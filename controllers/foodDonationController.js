import FoodDonation from "../models/FoodDonation.js";

// Create a new food donation
export const createFoodDonation = async (req, res) => {
  try {
    const { fullName, contactNumber, foodType, itemName, weight, cookingDate, expiryDate, storageInstructions, pickupAddress } = req.body;

    // Validate required fields
    if (!fullName || !contactNumber || !foodType || !itemName || !weight || !cookingDate || !expiryDate || !pickupAddress) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Ensure cooking date is before expiry date
    if (new Date(cookingDate) >= new Date(expiryDate)) {
      return res.status(400).json({ message: "Cooking date must be before expiry date." });
    }

    // Handle image upload
    const foodImage = req.file ? `/uploads/food/${req.file.filename}` : null;

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
      status: "available", // Default status
    });

    // Save to database
    await newDonation.save();
    res.status(201).json({ message: "Food donation created successfully!", donation: newDonation });

  } catch (error) {
    res.status(500).json({ message: "Error creating food donation", error: error.message });
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

// Claim a food donation
export const claimFoodDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const receiverId = req.user._id; // 🔥 Get from middleware

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required to claim food." });
    }

    const donation = await FoodDonation.findById(id);
    if (!donation) {
      return res.status(404).json({ message: "Food donation not found." });
    }

    if (donation.donorId === receiverId) {
      return res.status(403).json({ message: "You cannot claim your own food donation." });
    }

    if (donation.status !== "available") {
      return res.status(400).json({ message: "This food donation is no longer available." });
    }

    donation.status = "claimed";
    donation.receiverId = receiverId;
    await donation.save();

    res.status(200).json({ message: "Food donation claimed successfully!", donation });
  } catch (error) {
    res.status(500).json({ message: "Error claiming food donation", error: error.message });
  }
};



