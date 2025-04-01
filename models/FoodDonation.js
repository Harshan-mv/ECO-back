import mongoose from "mongoose";

const FoodDonationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    foodType: { type: String, required: true },
    itemName: { type: String, required: true },
    weight: { type: String, required: true },
    cookingDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    storageInstructions: { type: String },
    pickupAddress: { type: String, required: true }, // Now just a string
    foodImage: { type: String },
    status: { type: String, enum: ["available", "claimed"], default: "available" }, // New field
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Who claimed it
  },
  { timestamps: true }
);

export default mongoose.model("FoodDonation", FoodDonationSchema);
