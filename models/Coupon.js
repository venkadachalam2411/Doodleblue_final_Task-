import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        discountPercentage: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        },

        minOrderAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        maxDiscountAmount: {
            type: Number,
            default: null,
            min: 0
        },

        expiryDate: {
            type: Date,
            required: true
        },

        usageLimit: {
            type: Number,
            default: 100,
            min: 1
        },

        usedCount: {
            type: Number,
            default: 0,
            min: 0
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;