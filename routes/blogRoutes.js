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
    const blogs = await Blog.find().populate("author", "name").sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs." });
  }
});

// ✅ GET: Fetch a single blog by ID with populated comment user names
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid blog ID." });
  }

  try {
    const blog = await Blog.findById(req.params.id).populate("comments.user", "name"); // 🪄 magic happens here!

    if (!blog) return res.status(404).json({ message: "Blog not found." });

    res.json(blog);
  } catch (error) {
    console.error("❌ Error fetching blog:", error);
    res.status(500).json({ message: "Failed to fetch blog." });
  }
});

// ✅ POST: Add comment to a blog
// ✅ POST: Add comment to a blog
router.post("/:id/comments", async (req, res) => {
  console.log("🔍 Incoming comment:", req.body);
  const { user, text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  if (!text) {
    return res.status(400).json({ message: "Comment text is required." });
  }

  try {
    console.log("📌 Looking for blog:", req.params.id);
    const blog = await Blog.findById(req.params.id);
  
    if (!blog) {
      console.log("❌ Blog not found");
      return res.status(404).json({ message: "Blog not found." });
    }
  
    const newComment = {
      user: new mongoose.Types.ObjectId(user),
      text,
      timestamp: new Date(),
    };
  
    console.log("🛠 Adding comment:", newComment);
    blog.comments.push(newComment);
  
    console.log("💾 Saving blog...");
    await blog.save();
  
    console.log("✅ Comment saved. Returning updated comments.");
    res.status(201).json({ message: "Comment added", comments: blog.comments });
  } catch (error) {
    console.error("🔥 Error in comment route:", error);
    res.status(500).json({ message: "Failed to add comment." });
  }  
});
// DELETE /blogs/:blogId/comments/:commentId
router.delete("/:blogId/comments/:commentId", protect, async (req, res) => {
  const { blogId, commentId } = req.params;
  const userId = req.user._id;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const commentIndex = blog.comments.findIndex(
      (c) => c._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });

    const comment = blog.comments[commentIndex];

    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    blog.comments.splice(commentIndex, 1);
    await blog.save();

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("❌ DELETE comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ DELETE: Remove a blog post (Only Author or Admin)
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
