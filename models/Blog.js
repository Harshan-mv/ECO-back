import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  image: { type: String, default: "" }, 
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      user: { type: String, required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog; // ✅ Use default export
