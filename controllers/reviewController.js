
import mongoose from "mongoose";
import Product from "../models/product.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Calculate average rating and review count
const updateProductRating = async (product) => {
    const reviews = product.reviews;

    product.ratingCount = reviews.length;

    if (reviews.length === 0) {
        product.rating = 0;
    } else {
        const totalRating = reviews.reduce(
            (total, review) => total + review.rating,
            0
        );

        product.rating = Number(
            (totalRating / reviews.length).toFixed(1)
        );
    }

    await product.save();
};

// Add a product review
export const addReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product ID");
    }

    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {
        throw new ApiError(400, "Rating must be an integer between 1 and 5");
    }

    if (
        typeof comment !== "string" ||
        !comment.trim()
    ) {
        throw new ApiError(400, "Review comment is required");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const alreadyReviewed = product.reviews.some(
        (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        throw new ApiError(400, "You have already reviewed this product");
    }

    product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating,
        comment: comment.trim()
    });

    await updateProductRating(product);

    res.status(201).json({
        success: true,
        message: "Review added successfully",
        rating: product.rating,
        ratingCount: product.ratingCount,
        reviews: product.reviews
    });
});

// Update your own review
export const updateReview = asyncHandler(async (req, res) => {
    const { id, reviewId } = req.params;
    const { rating, comment } = req.body;

    if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(reviewId)
    ) {
        throw new ApiError(400, "Invalid product or review ID");
    }

    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {
        throw new ApiError(400, "Rating must be an integer between 1 and 5");
    }

    if (
        typeof comment !== "string" ||
        !comment.trim()
    ) {
        throw new ApiError(400, "Review comment is required");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const review = product.reviews.id(reviewId);

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    if (review.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own review");
    }

    review.rating = rating;
    review.comment = comment.trim();

    await updateProductRating(product);

    res.status(200).json({
        success: true,
        message: "Review updated successfully",
        rating: product.rating,
        ratingCount: product.ratingCount,
        reviews: product.reviews
    });
});

// Delete your own review
export const deleteReview = asyncHandler(async (req, res) => {
    const { id, reviewId } = req.params;

    if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(reviewId)
    ) {
        throw new ApiError(400, "Invalid product or review ID");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const review = product.reviews.id(reviewId);

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    if (review.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own review");
    }

    product.reviews.pull(reviewId);

    await updateProductRating(product);

    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
        rating: product.rating,
        ratingCount: product.ratingCount
    });
});
