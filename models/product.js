
import mongoose from "mongoose";

// Customer review schema
const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Musical instrument product schema
const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        brand: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 90
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        ratingCount: {
            type: Number,
            default: 0,
            min: 0
        },

        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },

        thumbnail: {
            type: String,
            required: true
        },

        images: {
            type: [String],
            default: []
        },

        instrumentType: {
            type: String,
            required: true
        },

        specifications: {
            type: Map,
            of: String,
            default: {}
        },

        tags: {
            type: [String],
            default: []
        },

        returnPolicy: {
            type: String,
            default: "7-day returns"
        },

        warrantyInformation: {
            type: String,
            default: "1 year warranty"
        },

        reviews: {
            type: [reviewSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
