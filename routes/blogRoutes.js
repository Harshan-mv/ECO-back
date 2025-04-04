import express from "express";
import Blog from "../models/Blog.js";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js"; 
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// 🛠 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ POST: Create a new blog with Cloudinary image
router.post("/", protect, async (req, res) => {
  const { title, content, image } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  try {
    let imageUrl = null;

    // If image URL is provided, ensure it's a valid Cloudinary URL
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image, {
        folder: "ecovision-blogs",
      });
      imageUrl = uploadedResponse.secure_url;
    }

    const newBlog = new Blog({ 
      title, 
      content, 
      author: req.user._id, 
      image: imageUrl,
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: "Failed to create blog." });
  }
});

// ✅ GET: Fetch all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs." });
  }
});

// ✅ GET: Fetch a single blog by ID
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid blog ID." });
  }

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blog." });
  }
});

// ✅ POST: Add comment to a blog
router.post("/:id/comments", async (req, res) => {
  const { user, text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Comment text is required." });
  }

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    const newComment = { user, text, timestamp: new Date() };
    blog.comments = blog.comments || [];
    blog.comments.push(newComment);

    await blog.save();
    res.status(201).json({ message: "Comment added", comments: blog.comments });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment." });
  }
});

// ✅ DELETE: Remove a blog post (Only Author or Admin)
router.delete("/:id", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    // 🛑 Ensure only author or admin can delete
    if (req.user._id.toString() !== blog.author.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this blog." });
    }

    // 🗑 Delete the image from Cloudinary if it exists
    if (blog.image) {
      const publicId = blog.image.split("/").pop().split(".")[0]; // Extract public ID
      await cloudinary.uploader.destroy(`ecovision-blogs/${publicId}`);
    }

    await blog.deleteOne();
    res.json({ message: "✅ Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error while deleting blog." });
  }
});

export default router;
