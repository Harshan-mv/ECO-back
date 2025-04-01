import GreenScore from "../models/GreenScore.js";
import User from "../models/User.js";
import { calculateGreenScore, assignBadge } from "../services/scoreService.js";
import mongoose from "mongoose";

// ✅ Submit Green Score
export const submitGreenScore = async (req, res) => {
  try {
    console.log("📥 Incoming Request Data:", req.body); // Debugging log

    const { userId, billType, billNumber, itemPurchased, purchaseDate, vendor, purchaseMode, ecoCertification, totalAmount } = req.body;

    // 🛑 Check if userId is valid
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID." });
    }

    const greenScore = calculateGreenScore({ billType, purchaseMode, ecoCertification, totalAmount });

    // ✅ Create a new GreenScore submission
    const submission = await GreenScore.create({
      userId,
      billType,
      billNumber,
      itemPurchased,
      purchaseDate,
      vendor,
      purchaseMode,
      ecoCertification,
      totalAmount,
      greenScore,
    });

    // ✅ Find the user and update their Green Score
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Update Green Score and assign a new badge
    user.greenScore = (user.greenScore || 0) + greenScore; // Initialize if undefined
    user.badge = assignBadge(user.greenScore);
    await user.save();

    console.log("✅ Updated User Score:", user.greenScore); // Debugging log

    return res.status(201).json({
      success: true,
      greenScore: user.greenScore,
      badge: user.badge,
      data: submission, // For debugging
    });
  } catch (error) {
    console.error("❌ Error submitting Green Score:", error);
    res.status(500).json({ success: false, message: "Error submitting Green Score", error });
  }
};

// ✅ Get User's Green Score & Badge
export const getUserGreenScore = async (req, res) => {
  try {
    const { userId } = req.params;

    // 🛑 Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID." });
    }

    // ✅ Fetch the user's Green Score
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("✅ Fetching User Green Score:", user.greenScore); // Debugging log

    res.status(200).json({
      success: true,
      greenScore: user.greenScore || 0, // Ensure it’s not undefined
      badge: user.badge || "🌱 Eco Beginner",
    });
  } catch (error) {
    console.error("❌ Error fetching Green Score:", error);
    res.status(500).json({ success: false, message: "Error fetching Green Score", error });
  }
};

// Get the top two users with the highest Green Score
export const getLeaders = async (req, res) => {
    try {
      // Aggregate users with their total Green Score
      const leaders = await GreenScore.aggregate([
        {
          $group: {
            _id: "$userId",
            totalScore: { $sum: "$greenScore" }, // Sum all green scores for each user
          },
        },
        { $sort: { totalScore: -1 } }, // Sort by highest score
        { $limit: 2 }, // Get top 2 users
      ]);
  
      // Fetch user details (name, badge) for leaderboard display
      const usersWithDetails = await Promise.all(
        leaders.map(async (leader) => {
          const user = await User.findById(leader._id).select("name badge");
          return {
            name: user?.name || "Unknown User",
            greenScore: leader.totalScore,
            badge: user?.badge || "🌱 Eco Beginner",
          };
        })
      );
  
      if (usersWithDetails.length === 0) {
        return res.status(404).json({ success: false, message: "No leaders found" });
      }
  
      res.status(200).json({ success: true, leaders: usersWithDetails });
    } catch (error) {
      console.error("❌ Error fetching leaders:", error);
      res.status(500).json({ success: false, message: "Error fetching leaderboard", error });
    }
  };
  