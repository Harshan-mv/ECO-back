import express from "express";
import {
  createFoodDonation,
  getFoodDonations,
  getAvailableDonations,
  claimFoodDonation
} from "../controllers/foodDonationController.js";

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { protect } from "../middleware/authMiddleware.js";

// 🧠 Cloudinary setup
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Fix for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 🔐 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📦 Use Cloudinary storage with Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecovision-uploads", // Optional Cloudinary folder
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

// ✅ Routes
router.post("/", upload.single("foodImage"), createFoodDonation);
router.get("/", getFoodDonations);
router.get("/available", getAvailableDonations);
router.put("/claim/:id", protect, claimFoodDonation);

export default router;
