import express from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} from "../controllers/orderController.js";

import {
    protect,
    adminOnly
} from "../middleware/protect.js";

const router = express.Router();

// Customer routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.patch("/:id/cancel", protect, cancelOrder);

// Admin routes
router.get("/", protect, adminOnly, getAllOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

// Customer or admin can view an order
router.get("/:id", protect, getOrderById);

export default router;