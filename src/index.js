import express from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import cookieParser from "cookie-parser";

config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.DB_STRING)
    .then(() => console.log("DB Connected Successfully!"))
    .catch((err) => console.log("DB Connection Error:", err));

app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
});