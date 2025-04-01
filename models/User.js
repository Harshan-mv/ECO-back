import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Encrypted password

    // ✅ Add these missing fields
    greenScore: { type: Number, default: 0 },  // Stores the user's Green Score
    badge: { type: String, default: "🌱 Eco Beginner" }, // Default badge
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

const User = mongoose.model("User", userSchema);

export default User;
