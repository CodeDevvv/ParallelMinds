import mongoose from "mongoose";
import process from 'process';

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("Database connection successful!");
    }).catch((error) => {
        console.error("Database connection error:", error);
    });
}

export default connectDB;