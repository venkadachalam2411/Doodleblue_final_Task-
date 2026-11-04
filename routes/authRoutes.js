
import express from "express";

import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
} from "../controllers/authController.js";

import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected profile routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

export default router;
    