import FoodDonation from "../models/FoodDonation.js";

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
      foodImage, // now a Cloudinary URL
      status: "available",
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
