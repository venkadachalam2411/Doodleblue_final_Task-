
import mongoose from "mongoose";
import Product from "../models/product.js";

// Validate MongoDB product ID
const validateProductId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Validate product input
const validateProductData = (data, isUpdate = false) => {
    const errors = [];

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return ["Product data must be an object"];
    }

    const requiredFields = [
        "title",
        "description",
        "category",
        "brand",
        "price",
        "stock"
    ];

    if (!isUpdate) {
        requiredFields.forEach((field) => {
            if (
                data[field] === undefined ||
                data[field] === null ||
                data[field] === ""
            ) {
                errors.push(`${field} is required`);
            }
        });
    }

    if (
        data.title !== undefined &&
        (typeof data.title !== "string" || !data.title.trim())
    ) {
        errors.push("Title must be a non-empty string");
    }

    if (
        data.description !== undefined &&
        typeof data.description !== "string"
    ) {
        errors.push("Description must be a string");
    }

    if (
        data.category !== undefined &&
        (typeof data.category !== "string" || !data.category.trim())
    ) {
        errors.push("Category must be a non-empty string");
    }

    if (
        data.brand !== undefined &&
        (typeof data.brand !== "string" || !data.brand.trim())
    ) {
        errors.push("Brand must be a non-empty string");
    }

    if (
        data.price !== undefined &&
        (!Number.isFinite(data.price) || data.price < 0)
    ) {
        errors.push("Price must be a valid non-negative number");
    }

    if (
        data.stock !== undefined &&
        (!Number.isInteger(data.stock) || data.stock < 0)
    ) {
        errors.push("Stock must be a non-negative integer");
    }

    if (
        data.discountPercentage !== undefined &&
        (!Number.isFinite(data.discountPercentage) ||
            data.discountPercentage < 0 ||
            data.discountPercentage > 100)
    ) {
        errors.push("Discount percentage must be between 0 and 100");
    }

    if (
        data.rating !== undefined &&
        (!Number.isFinite(data.rating) ||
            data.rating < 0 ||
            data.rating > 5)
    ) {
        errors.push("Rating must be between 0 and 5");
    }

    if (
        data.ratingCount !== undefined &&
        (!Number.isInteger(data.ratingCount) || data.ratingCount < 0)
    ) {
        errors.push("Rating count must be a non-negative integer");
    }

    if (
        data.thumbnail !== undefined &&
        typeof data.thumbnail !== "string"
    ) {
        errors.push("Thumbnail must be a string");
    }

    if (
        data.images !== undefined &&
        (!Array.isArray(data.images) ||
            !data.images.every((image) => typeof image === "string"))
    ) {
        errors.push("Images must be an array of strings");
    }

    if (
        data.tags !== undefined &&
        (!Array.isArray(data.tags) ||
            !data.tags.every((tag) => typeof tag === "string"))
    ) {
        errors.push("Tags must be an array of strings");
    }

    return errors;
};

// 1. Create a product
export const createProduct = async (req, res) => {
    try {
        const errors = validateProductData(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Product validation failed",
                errors
            });
        }

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Bulk create products
export const createManyProducts = async (req, res) => {
    try {
        const products = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a non-empty array of products"
            });
        }

        if (products.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Maximum 50 products allowed per request"
            });
        }

        const errors = [];

        products.forEach((product, index) => {
            const productErrors = validateProductData(product);

            productErrors.forEach((error) => {
                errors.push(`Product ${index + 1}: ${error}`);
            });
        });

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Bulk product validation failed",
                errors
            });
        }

        const savedProducts = await Product.insertMany(products);

        res.status(201).json({
            success: true,
            message: "Products added successfully",
            count: savedProducts.length,
            products: savedProducts
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Get all products with filtering, sorting and pagination
export const getAllProducts = async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            minRating,
            sort,
            page = 1,
            limit = 8
        } = req.query;

        const filter = {};

        if (category) {
            filter.category = category.toLowerCase();
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                const value = Number(minPrice);

                if (!Number.isFinite(value) || value < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "minPrice must be a non-negative number"
                    });
                }

                filter.price.$gte = value;
            }

            if (maxPrice !== undefined) {
                const value = Number(maxPrice);

                if (!Number.isFinite(value) || value < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "maxPrice must be a non-negative number"
                    });
                }

                filter.price.$lte = value;
            }

            if (
                filter.price.$gte !== undefined &&
                filter.price.$lte !== undefined &&
                filter.price.$gte > filter.price.$lte
            ) {
                return res.status(400).json({
                    success: false,
                    message: "minPrice cannot be greater than maxPrice"
                });
            }
        }

        if (minRating !== undefined) {
            const rating = Number(minRating);

            if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "minRating must be between 0 and 5"
                });
            }

            filter.rating = { $gte: rating };
        }

        const allowedSortOptions = [
            "price_asc",
            "price_desc",
            "rating"
        ];

        if (sort && !allowedSortOptions.includes(sort)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sort option"
            });
        }

        const currentPage = Number(page);
        const pageLimit = Number(limit);

        if (!Number.isInteger(currentPage) || currentPage < 1) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer"
            });
        }

        if (
            !Number.isInteger(pageLimit) ||
            pageLimit < 1 ||
            pageLimit > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 50"
            });
        }

        let sortOption = {};

        if (sort === "price_asc") sortOption.price = 1;
        if (sort === "price_desc") sortOption.price = -1;
        if (sort === "rating") sortOption.rating = -1;

        const skip = (currentPage - 1) * pageLimit;

        const products = await Product.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(pageLimit);

        const totalProducts = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage,
            totalPages: Math.ceil(totalProducts / pageLimit),
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. Get a single product
export const getProductById = async (req, res) => {
    try {
        if (!validateProductId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Update a product
export const updateProduct = async (req, res) => {
    try {
        if (!validateProductId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const errors = validateProductData(req.body, true);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Product validation failed",
                errors
            });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update"
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 6. Delete a product
export const deleteProduct = async (req, res) => {
    try {
        if (!validateProductId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 7. Search products
// GET /api/products/search?keyword=guitar
export const searchProducts = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (
            !keyword ||
            typeof keyword !== "string" ||
            !keyword.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a search keyword"
            });
        }

        const searchRegex = new RegExp(
            keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
        );

        const products = await Product.find({
            $or: [
                { title: searchRegex },
                { brand: searchRegex },
                { category: searchRegex },
                { description: searchRegex }
            ]
        }).limit(50);

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
