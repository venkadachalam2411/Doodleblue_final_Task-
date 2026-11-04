
import mongoose from "mongoose";

import Coupon from "../models/Coupon.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Validate coupon ID
const validateCouponId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid coupon ID");
    }
};

// Validate coupon code
const validateCouponCode = (code) => {
    if (
        typeof code !== "string" ||
        !code.trim() ||
        !/^[a-zA-Z0-9_-]+$/.test(code.trim())
    ) {
        throw new ApiError(400, "Invalid coupon code");
    }
};

// Validate numeric coupon fields
const validateNumber = (value, field, min, max = Infinity) => {
    if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < min ||
        value > max
    ) {
        throw new ApiError(
            400,
            `${field} must be a valid number between ${min} and ${max === Infinity ? "infinity" : max}`
        );
    }
};

// Validate expiry date
const validateExpiryDate = (date) => {
    const parsedDate = new Date(date);

    if (
        date === undefined ||
        date === null ||
        date === "" ||
        Number.isNaN(parsedDate.getTime())
    ) {
        throw new ApiError(400, "Please provide a valid expiry date");
    }

    if (parsedDate <= new Date()) {
        throw new ApiError(400, "Expiry date must be in the future");
    }

    return parsedDate;
};

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Admin
export const createCoupon = asyncHandler(async (req, res) => {
    const {
        code,
        description = "",
        discountPercentage,
        minOrderAmount = 0,
        maxDiscountAmount = null,
        expiryDate,
        usageLimit = 100
    } = req.body;

    validateCouponCode(code);

    validateNumber(
        discountPercentage,
        "Discount percentage",
        1,
        100
    );

    validateNumber(
        minOrderAmount,
        "Minimum order amount",
        0
    );

    if (maxDiscountAmount !== null) {
        validateNumber(
            maxDiscountAmount,
            "Maximum discount amount",
            0
        );
    }

    validateNumber(usageLimit, "Usage limit", 1);

    if (!Number.isInteger(usageLimit)) {
        throw new ApiError(400, "Usage limit must be a whole number");
    }

    if (typeof description !== "string") {
        throw new ApiError(400, "Description must be a string");
    }

    const validExpiryDate = validateExpiryDate(expiryDate);

    const normalizedCode = code.trim().toUpperCase();

    const existingCoupon = await Coupon.findOne({
        code: normalizedCode
    });

    if (existingCoupon) {
        throw new ApiError(409, "Coupon code already exists");
    }

    try {
        const coupon = await Coupon.create({
            code: normalizedCode,
            description: description.trim(),
            discountPercentage,
            minOrderAmount,
            maxDiscountAmount,
            expiryDate: validExpiryDate,
            usageLimit
        });

        res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            coupon
        });

    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(409, "Coupon code already exists");
        }

        throw error;
    }
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Admin
export const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: coupons.length,
        coupons
    });
});

// @desc    Get a single coupon
// @route   GET /api/coupons/:id
// @access  Admin
export const getCouponById = asyncHandler(async (req, res) => {
    validateCouponId(req.params.id);

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    res.status(200).json({
        success: true,
        coupon
    });
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Admin
export const updateCoupon = asyncHandler(async (req, res) => {
    validateCouponId(req.params.id);

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    const {
        code,
        description,
        discountPercentage,
        minOrderAmount,
        maxDiscountAmount,
        expiryDate,
        usageLimit,
        isActive
    } = req.body;

    if (Object.keys(req.body).length === 0) {
        throw new ApiError(400, "Please provide at least one field to update");
    }

    if (code !== undefined) {
        validateCouponCode(code);

        const normalizedCode = code.trim().toUpperCase();

        const existingCoupon = await Coupon.findOne({
            code: normalizedCode,
            _id: { $ne: coupon._id }
        });

        if (existingCoupon) {
            throw new ApiError(409, "Coupon code already exists");
        }

        coupon.code = normalizedCode;
    }

    if (description !== undefined) {
        if (typeof description !== "string") {
            throw new ApiError(400, "Description must be a string");
        }

        coupon.description = description.trim();
    }

    if (discountPercentage !== undefined) {
        validateNumber(
            discountPercentage,
            "Discount percentage",
            1,
            100
        );

        coupon.discountPercentage = discountPercentage;
    }

    if (minOrderAmount !== undefined) {
        validateNumber(
            minOrderAmount,
            "Minimum order amount",
            0
        );

        coupon.minOrderAmount = minOrderAmount;
    }

    if (maxDiscountAmount !== undefined) {
        if (maxDiscountAmount !== null) {
            validateNumber(
                maxDiscountAmount,
                "Maximum discount amount",
                0
            );
        }

        coupon.maxDiscountAmount = maxDiscountAmount;
    }

    if (expiryDate !== undefined) {
        coupon.expiryDate = validateExpiryDate(expiryDate);
    }

    if (usageLimit !== undefined) {
        validateNumber(usageLimit, "Usage limit", 1);

        if (!Number.isInteger(usageLimit)) {
            throw new ApiError(400, "Usage limit must be a whole number");
        }

        if (usageLimit < coupon.usedCount) {
            throw new ApiError(
                400,
                "Usage limit cannot be less than the number of times this coupon has been used"
            );
        }

        coupon.usageLimit = usageLimit;
    }

    if (isActive !== undefined) {
        if (typeof isActive !== "boolean") {
            throw new ApiError(400, "isActive must be true or false");
        }

        coupon.isActive = isActive;
    }

    try {
        await coupon.save();

        res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            coupon
        });

    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(409, "Coupon code already exists");
        }

        throw error;
    }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
    validateCouponId(req.params.id);

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    await coupon.deleteOne();

    res.status(200).json({
        success: true,
        message: "Coupon deleted successfully"
    });
});

// @desc    Validate a coupon for an order
// @route   POST /api/coupons/validate
// @access  Customer
export const validateCoupon = asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;

    validateCouponCode(code);

    if (
        typeof subtotal !== "number" ||
        !Number.isFinite(subtotal) ||
        subtotal < 0
    ) {
        throw new ApiError(
            400,
            "Subtotal must be a valid non-negative number"
        );
    }

    const normalizedCode = code.trim().toUpperCase();

    const coupon = await Coupon.findOne({
        code: normalizedCode
    });

    if (!coupon || !coupon.isActive) {
        throw new ApiError(404, "Invalid or inactive coupon");
    }

    if (coupon.expiryDate <= new Date()) {
        throw new ApiError(400, "Coupon has expired");
    }

    if (coupon.usedCount >= coupon.usageLimit) {
        throw new ApiError(400, "Coupon usage limit reached");
    }

    if (subtotal < coupon.minOrderAmount) {
        throw new ApiError(
            400,
            `Minimum order amount is ₹${coupon.minOrderAmount}`
        );
    }

    let discountAmount =
        (subtotal * coupon.discountPercentage) / 100;

    if (coupon.maxDiscountAmount !== null) {
        discountAmount = Math.min(
            discountAmount,
            coupon.maxDiscountAmount
        );
    }

    discountAmount = Number(discountAmount.toFixed(2));

    res.status(200).json({
        success: true,
        message: "Coupon applied successfully",
        coupon: {
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        },
        subtotal,
        discountAmount,
        finalAmount: Number(
            (subtotal - discountAmount).toFixed(2)
        )
    });
});
