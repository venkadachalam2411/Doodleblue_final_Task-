
import express from "express";

import {
    addReview,
    updateReview,
    deleteReview
} from "../controllers/reviewController.js";

import { protect } from "../middleware/protect.js";

const router = express.Router();

// Add a review
router.post("/:id", protect, addReview);

// Update your review
router.put("/:id/:reviewId", protect, updateReview);

// Delete your review
router.delete("/:id/:reviewId", protect, deleteReview);

export default router;
