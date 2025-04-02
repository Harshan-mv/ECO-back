import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });

  const serverUrl = process.env.NODE_ENV === "production" 
    ? "https://eco-back-fd95.onrender.com" 
    : "http://localhost:5000";

  const imageUrl = `${serverUrl}/uploads/${req.file.filename}`;

  res.json({ imageUrl }); // ✅ Send the image URL as a response
}); // ✅ Closing curly brace added

export default router;
