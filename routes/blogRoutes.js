import express from "express";
import Blog from "../models/Blog.js";
import mongoose from "mongoose";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js"; // 

// POST: Create a new blog
// ✅ Ensure only authenticated users can create blogs
router.post("/", protect, async (req, res) => {
  const { title, content, image } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  try {
    const newBlog = new Blog({ 
      title, 
      content, 
      author: req.user._id, // ✅ Use logged-in user's ID
      image 
    });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: "Failed to create blog." });
  }
});


// GET: Fetch all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs." });
  }
});

// GET: Fetch a single blog by ID

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

// POST: Add comment to a blog
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
  

  // DELETE: Remove a blog post
  // ✅ Protect blog deletion - Only Author or Admin can delete
// DELETE: Remove a blog post
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    await blog.deleteOne();
    res.json({ message: "✅ Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error while deleting blog." });
  }
});

export default router;
