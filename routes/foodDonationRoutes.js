import express from "express";
import { createFoodDonation, getFoodDonations,getAvailableDonations, claimFoodDonation} from "../controllers/foodDonationController.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import protect from "../middleware/authMiddleware.js"; // Ensure this import is correct
// Fix for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer setup to store images in `uploads/food`
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/food"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
router.post("/", upload.single("foodImage"), createFoodDonation);
router.get("/", getFoodDonations);
// Fetch available food donations
router.get("/available", getAvailableDonations);

// Claim a food donation
router.put("/claim/:id", protect, claimFoodDonation); // Middleware must be applied here


export default router;
