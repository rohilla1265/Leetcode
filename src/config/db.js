import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_STRING);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;