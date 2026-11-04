
import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/product.js";
import Coupon from "../models/Coupon.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    calculateShipping,
    calculateOrderTotal
} from "../utils/pricing.js";

// Restore stock and coupon usage inside the current transaction
const restoreOrderResources = async (order, session) => {
    for (const item of order.items) {
        const result = await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session }
        );

        if (result.matchedCount !== 1) {
            throw new ApiError(
                404,
                `Product not found while restoring stock: ${item.title}`
            );
        }
    }

    if (order.coupon) {
        const result = await Coupon.updateOne(
            {
                _id: order.coupon,
                usedCount: { $gt: 0 }
            },
            { $inc: { usedCount: -1 } },
            { session }
        );

        if (result.modifiedCount !== 1) {
            throw new ApiError(
                409,
                "Coupon usage could not be restored"
            );
        }
    }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Customer
export const createOrder = asyncHandler(async (req, res) => {
    const {
        items,
        shippingAddress,
        paymentMethod,
        couponCode
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Please provide at least one product");
    }

    if (!shippingAddress) {
        throw new ApiError(400, "Shipping address is required");
    }

    const requiredAddressFields = [
        "fullName",
        "phone",
        "address",
        "city",
        "state",
        "postalCode"
    ];

    for (const field of requiredAddressFields) {
        if (
            typeof shippingAddress[field] !== "string" ||
            !shippingAddress[field].trim()
        ) {
            throw new ApiError(
                400,
                `${field} is required in shipping address`
            );
        }
    }

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
        throw new ApiError(400, "Invalid payment method");
    }

    if (
        couponCode !== undefined &&
        couponCode !== null &&
        typeof couponCode !== "string"
    ) {
        throw new ApiError(400, "Invalid coupon code");
    }

    const productQuantities = new Map();

    for (const item of items) {
        if (
            !item.product ||
            !mongoose.Types.ObjectId.isValid(item.product)
        ) {
            throw new ApiError(400, "Invalid product ID");
        }

        if (
            !Number.isInteger(item.quantity) ||
            item.quantity < 1
        ) {
            throw new ApiError(400, "Invalid product quantity");
        }

        const productId = item.product.toString();

        productQuantities.set(
            productId,
            (productQuantities.get(productId) || 0) + item.quantity
        );
    }

    const session = await mongoose.startSession();

    let createdOrder;

    try {
        await session.withTransaction(async () => {
            const productIds = [...productQuantities.keys()];

            const products = await Product.find({
                _id: { $in: productIds }
            }).session(session);

            if (products.length !== productIds.length) {
                throw new ApiError(
                    404,
                    "One or more products were not found"
                );
            }

            let subtotal = 0;
            const orderItems = [];

            for (const product of products) {
                const quantity = productQuantities.get(
                    product._id.toString()
                );

                if (product.stock < quantity) {
                    throw new ApiError(
                        400,
                        `Insufficient stock for ${product.title}`
                    );
                }

                const discountedPrice = Number(
                    (
                        product.price *
                        (1 - (product.discountPercentage || 0) / 100)
                    ).toFixed(2)
                );

                subtotal += discountedPrice * quantity;

                orderItems.push({
                    product: product._id,
                    title: product.title,
                    quantity,
                    price: discountedPrice,
                    thumbnail: product.thumbnail || ""
                });
            }

            subtotal = Number(subtotal.toFixed(2));

            let coupon = null;
            let discountAmount = 0;

            if (couponCode && couponCode.trim()) {
                coupon = await Coupon.findOne({
                    code: couponCode.trim().toUpperCase()
                }).session(session);

                if (!coupon || !coupon.isActive) {
                    throw new ApiError(
                        400,
                        "Invalid or inactive coupon"
                    );
                }

                if (coupon.expiryDate <= new Date()) {
                    throw new ApiError(400, "Coupon has expired");
                }

                if (coupon.usedCount >= coupon.usageLimit) {
                    throw new ApiError(
                        400,
                        "Coupon usage limit reached"
                    );
                }

                if (subtotal < coupon.minOrderAmount) {
                    throw new ApiError(
                        400,
                        `Minimum order amount is ₹${coupon.minOrderAmount}`
                    );
                }

                discountAmount =
                    (subtotal * coupon.discountPercentage) / 100;

                if (coupon.maxDiscountAmount !== null) {
                    discountAmount = Math.min(
                        discountAmount,
                        coupon.maxDiscountAmount
                    );
                }

                discountAmount = Number(discountAmount.toFixed(2));
            }

            const shippingCharge = calculateShipping(subtotal);

            const totalAmount = calculateOrderTotal(
                subtotal,
                discountAmount,
                shippingCharge
            );

            // Deduct product stock
            for (const item of orderItems) {
                const result = await Product.updateOne(
                    {
                        _id: item.product,
                        stock: { $gte: item.quantity }
                    },
                    {
                        $inc: { stock: -item.quantity }
                    },
                    { session }
                );

                if (result.modifiedCount !== 1) {
                    throw new ApiError(
                        409,
                        `Stock changed while placing order for ${item.title}`
                    );
                }
            }

            // Increase coupon usage
            if (coupon) {
                const updatedCoupon = await Coupon.findOneAndUpdate(
                    {
                        _id: coupon._id,
                        isActive: true,
                        usedCount: { $lt: coupon.usageLimit },
                        expiryDate: { $gt: new Date() }
                    },
                    {
                        $inc: { usedCount: 1 }
                    },
                    {
                        new: true,
                        session
                    }
                );

                if (!updatedCoupon) {
                    throw new ApiError(
                        409,
                        "Coupon is no longer available"
                    );
                }
            }

            const orders = await Order.create(
                [
                    {
                        user: req.user._id,
                        items: orderItems,
                        shippingAddress,
                        paymentMethod,
                        paymentStatus: "Pending",
                        subtotal,
                        coupon: coupon ? coupon._id : null,
                        couponCode: coupon ? coupon.code : "",
                        discountAmount,
                        shippingCharge,
                        totalAmount,
                        orderStatus: "Placed"
                    }
                ],
                { session }
            );

            createdOrder = orders[0];
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: createdOrder
        });

    } finally {
        await session.endSession();
    }
});

// @desc    Get logged-in customer's orders
// @route   GET /api/orders/my-orders
// @access  Customer
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({
        user: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Customer / Admin
export const getOrderById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, "Invalid order ID");
    }

    const order = await Order.findById(req.params.id)
        .populate("user", "name email");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (
        req.user.role !== "admin" &&
        order.user._id.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(403, "You cannot access this order");
    }

    res.status(200).json({
        success: true,
        order
    });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    });
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderStatus } = req.body;

    const allowedStatuses = [
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    if (!allowedStatuses.includes(orderStatus)) {
        throw new ApiError(400, "Invalid order status");
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, "Invalid order ID");
    }

    const session = await mongoose.startSession();

    let updatedOrder;

    try {
        await session.withTransaction(async () => {
            const order = await Order.findById(
                req.params.id
            ).session(session);

            if (!order) {
                throw new ApiError(404, "Order not found");
            }

            const currentStatus = order.orderStatus;

            // Prevent updating completed or cancelled orders
            if (["Cancelled", "Delivered"].includes(currentStatus)) {
                throw new ApiError(
                    400,
                    "This order can no longer be updated"
                );
            }

            // Define valid status transitions
            const validTransitions = {
                Placed: ["Confirmed", "Cancelled"],
                Confirmed: ["Processing", "Cancelled"],
                Processing: ["Shipped", "Cancelled"],
                Shipped: ["Delivered"]
            };

            if (
                !validTransitions[currentStatus] ||
                !validTransitions[currentStatus].includes(orderStatus)
            ) {
                throw new ApiError(
                    400,
                    `Cannot change order status from ${currentStatus} to ${orderStatus}`
                );
            }

            // Check online payment before delivery
            if (orderStatus === "Delivered") {
                if (
                    order.paymentMethod === "ONLINE" &&
                    order.paymentStatus !== "Paid"
                ) {
                    throw new ApiError(
                        400,
                        "Online payment must be confirmed before delivery"
                    );
                }

                order.deliveredAt = new Date();

                // COD payment is collected on delivery
                if (order.paymentMethod === "COD") {
                    order.paymentStatus = "Paid";
                }
            }

            // Restore stock and coupon usage on cancellation
            if (orderStatus === "Cancelled") {
                if (
                    order.paymentMethod === "ONLINE" &&
                    order.paymentStatus === "Paid"
                ) {
                    throw new ApiError(
                        400,
                        "Paid online orders require a refund process"
                    );
                }

                await restoreOrderResources(order, session);
            }

            order.orderStatus = orderStatus;

            await order.save({ session });

            updatedOrder = order;
        });

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order: updatedOrder
        });

    } finally {
        await session.endSession();
    }
});

// @desc    Cancel customer's order
// @route   PATCH /api/orders/:id/cancel
// @access  Customer
export const cancelOrder = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, "Invalid order ID");
    }

    const session = await mongoose.startSession();

    let cancelledOrder;

    try {
        await session.withTransaction(async () => {
            const order = await Order.findById(
                req.params.id
            ).session(session);

            if (!order) {
                throw new ApiError(404, "Order not found");
            }

            if (
                order.user.toString() !== req.user._id.toString()
            ) {
                throw new ApiError(
                    403,
                    "You cannot cancel this order"
                );
            }

            if (!["Placed", "Confirmed"].includes(order.orderStatus)) {
                throw new ApiError(
                    400,
                    "This order can no longer be cancelled"
                );
            }

            if (
                order.paymentMethod === "ONLINE" &&
                order.paymentStatus === "Paid"
            ) {
                throw new ApiError(
                    400,
                    "Paid online orders require a refund process"
                );
            }

            await restoreOrderResources(order, session);

            order.orderStatus = "Cancelled";

            await order.save({ session });

            cancelledOrder = order;
        });

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order: cancelledOrder
        });

    } finally {
        await session.endSession();
    }
});
