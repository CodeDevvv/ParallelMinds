import mongoose from "mongoose";

export const connectDb = async () => {
    const uri = process.env.MONGODB_URI
    if (!uri) return

    try {
        await mongoose.connect(uri);
        console.log("Database connection successful!");
    } catch (error) {
        console.error("Database connection error:", error);
    }

}