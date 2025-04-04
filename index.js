import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url"; // Fix for __dirname in ES modules
import greenScoreRoutes from "./routes/greenScoreRoutes.js";
import foodDonationRoutes from "./routes/foodDonationRoutes.js";


dotenv.config();
connectDB();

const app = express();
const upload = multer({ dest: "uploads/" });

// Fix for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = ["http://localhost:3000", "https://eco-front1.onrender.com"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Handle preflight requests
app.options("*", cors());


app.use(express.json());
// Serve static files (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/blogs",blogRoutes);
app.use("/api/green-score", greenScoreRoutes);
app.use("/api/food-donations", foodDonationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
