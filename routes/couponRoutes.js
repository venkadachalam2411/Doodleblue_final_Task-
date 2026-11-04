import express from "express";

import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from "../controllers/couponController.js";

import {
    protect,
    adminOnly
} from "../middleware/protect.js";

const router = express.Router();

// Customer: Validate coupon
router.post("/validate", protect, validateCoupon);

// Admin: Coupon management
router.post("/", protect, adminOnly, createCoupon);
router.get("/", protect, adminOnly, getAllCoupons);
router.get("/:id", protect, adminOnly, getCouponById);
router.put("/:id", protect, adminOnly, updateCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);

export default router;