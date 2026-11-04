
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
    try {
        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error(
                "Please provide ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env"
            );
        }

        if (ADMIN_PASSWORD.length < 6) {
            throw new Error(
                "Admin password must contain at least 6 characters"
            );
        }

        await connectDB();

        const email = ADMIN_EMAIL.trim().toLowerCase();

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            if (existingAdmin.role === "admin") {
                console.log("Admin account already exists.");
            } else {
                console.log(
                    "This email belongs to an existing customer. Use a different admin email."
                );
            }

            return;
        }

        const hashedPassword = await bcrypt.hash(
            ADMIN_PASSWORD,
            10
        );

        const admin = await User.create({
            name: ADMIN_NAME.trim(),
            email,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin account created successfully!");
        console.log("Admin Email:", admin.email);

    } catch (error) {
        console.error("Admin setup failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
