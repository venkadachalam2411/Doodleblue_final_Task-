
import express from "express";

import {
    createProduct,
    createManyProducts,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts
} from "../controllers/productController.js";

import {
    protect,
    adminOnly
} from "../middleware/protect.js";

const router = express.Router();

// Public routes - Anyone can view products
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);

// Admin-only routes - Manage products
router.post("/", protect, adminOnly, createProduct);
router.post("/bulk", protect, adminOnly, createManyProducts);

router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
