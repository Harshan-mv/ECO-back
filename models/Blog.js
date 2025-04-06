import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Correct type
  image: { type: String, default: "" }, 
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 🔁 changed from String to ObjectId ref
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],  
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog; // ✅ Use default export
