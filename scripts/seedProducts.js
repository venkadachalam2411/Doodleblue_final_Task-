
import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/product.js";
import products from "../data/products.json" with { type: "json" };

const seedProducts = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from your .env file");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully.");

        let insertedCount = 0;
        let skippedCount = 0;

        for (const productData of products) {
            const existingProduct = await Product.findOne({
                title: productData.title,
                brand: productData.brand
            });

            if (existingProduct) {
                skippedCount++;
                continue;
            }

            await Product.create(productData);
            insertedCount++;
        }

        console.log("Product seeding completed.");
        console.log(`Total products in JSON: ${products.length}`);
        console.log(`Inserted products: ${insertedCount}`);
        console.log(`Skipped existing products: ${skippedCount}`);

    } catch (error) {
        console.error("Product seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedProducts();
