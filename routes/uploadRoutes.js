import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });
  
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`; // Added full URL
  res.json({ imageUrl });
});

export default router;
