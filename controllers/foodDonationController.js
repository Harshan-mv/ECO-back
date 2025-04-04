import FoodDonation from "../models/FoodDonation.js";

// Create a new food donation
// Create a new food donation
export const createFoodDonation = async (req, res) => {
  try {
    const {
      fullName,
      contactNumber,
      foodType,
      itemName,
      weight,
      cookingDate,
      expiryDate,
      storageInstructions,
      pickupAddress,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !contactNumber ||
      !foodType ||
      !itemName ||
      !weight ||
      !cookingDate ||
      !expiryDate ||
      !pickupAddress
    ) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Ensure cooking date is before expiry date
    if (new Date(cookingDate) >= new Date(expiryDate)) {
      return res.status(400).json({ message: "Cooking date must be before expiry date." });
    }
    const donorId = req.user._id; // ✅ Comes from protect middleware
    // ✅ Cloudinary image URL
    const foodImage = req.file ? req.file.path : null;

    // Create a new donation entry
    const newDonation = new FoodDonation({
      fullName,
      contactNumber,
      foodType,
      itemName,
      weight,
      cookingDate,
      expiryDate,
      storageInstructions,
      pickupAddress,
      foodImage,
      status: "available",
      donorId, // ✅ FIXED: required by schema
    });
    // Save to database
    await newDonation.save();
    res.status(201).json({
      message: "Food donation created successfully!",
      donation: newDonation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating food donation",
      error: error.message,
    });
  }
};
// Fetch all food donations
export const getFoodDonations = async (req, res) => {
  try {
    const donations = await FoodDonation.find();
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching food donations", error: error.message });
  }
};

// Fetch available food donations
export const getAvailableDonations = async (req, res) => {
  try {
    const donations = await FoodDonation.find({ status: "available" });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available food donations", error: error.message });
  }
};

// ✅ Claim a food donation
export const claimFoodDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const receiverId = req.user._id; // 🔥 Extracted from middleware
    console.log("User from token:", req.user);

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required to claim food." });
    }

    const donation = await FoodDonation.findById(id);
    if (!donation) {
      return res.status(404).json({ message: "Food donation not found." });
    }

    if (donation.donorId.toString() === receiverId.toString()) {
      return res.status(403).json({ message: "You cannot claim your own food donation." });
    }    

    if (donation.status !== "available") {
      return res.status(400).json({ message: "This food donation is no longer available." });
    }

    // Update donation status
    donation.status = "claimed";
    donation.receiverId = receiverId;
    await donation.save();

    res.status(200).json({ message: "✅ Food donation claimed successfully!", donation });
  } catch (error) {
    console.error("❌ Error claiming food donation:", error);
    res.status(500).json({ message: "Error claiming food donation", error: error.message });
  }
};
// Delete a food donation
export const deleteFoodDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Comes from verifyToken middleware

    const donation = await FoodDonation.findById(id);
    if (!donation || !donation.donorId) {
      return res.status(404).json({ message: "Food donation not found or donorId missing." });
    }

    if (donation.donorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this donation." });
    }

    await donation.deleteOne();
    res.status(200).json({ message: "Food donation deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting food donation", error: error.message });
  }
};



