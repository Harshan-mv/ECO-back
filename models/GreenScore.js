import mongoose from "mongoose";

const GreenScoreSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    billType: String,
    billNumber: String,
    itemPurchased: String,
    purchaseDate: Date,
    vendor: String,
    purchaseMode: String,
    ecoCertification: String,
    totalAmount: Number,
    billImageUrl: String,
    greenScore: Number,
  },
  { timestamps: true }
);

export default mongoose.model("GreenScore", GreenScoreSchema);
