const express = require("express");
const mongoose = require("mongoose");
const Artist = require("../models/artists");
const Joi = require("joi");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Validation Schema
const artistSchema = Joi.object({
  name: Joi.string().required(),
  text: Joi.string().optional(),
  para1: Joi.string().optional(),
  para2: Joi.string().optional(),
  para3: Joi.string().optional(),
  hitSong: Joi.string().optional(),
  img: Joi.string().uri().optional(), // Ensure that img is a valid URL
});

// Middleware to validate MongoDB ObjectId
const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid artist ID" });
  }
  next();
};

// Create a new artist
router.post("/artists", async (req, res) => {
  const { name, text, para1, para2, para3, hitSong, img } = req.body;

  // Validate artist data using Joi
  const { error } = artistSchema.validate({ name, text, para1, para2, para3, hitSong, img });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  let imageUrl = img; // Default to the provided image URL

  // If a base64-encoded image is provided, upload it to Cloudinary
  if (img && img.startsWith("data:image")) {
    try {
      const result = await cloudinary.uploader.upload(img, {
        folder: "uploads", // Optional: Organize images into a folder
      });
      imageUrl = result.secure_url; // Use the Cloudinary URL
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return res.status(500).json({ message: "Error uploading image" });
    }
  }

  // Create the artist object with the provided data
  const artist = {
    name,
    text: text || '',
    img: imageUrl || null, // Use the Cloudinary URL or the provided URL
    para1: para1 || '',
    para2: para2 || '',
    para3: para3 || '',
    hitSong: hitSong || '',
  };

  try {
    const newArtist = await Artist.create(artist);
    res.status(201).json({ success: true, data: newArtist });
  } catch (error) {
    console.error("Error adding artist:", error);
    const errorMessage =
      error.code === 11000
        ? "Duplicate artist"
        : "Error adding artist";
    res.status(500).json({ message: errorMessage, error: error.message });
  }
});







// Get all Celebrities
router.get("/artists", async (req, res) => {
  try {
    const Celebrities = await Artist.find();
    res.status(200).json({ success: true, data: Celebrities });
  } catch (error) {
    res.status(500).json({ message: "Error fetching Celebrities", error: error.message });
  }
});

// Get an artist by ID
router.get("/artists/:id", validateId, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.status(200).json({ success: true, data: artist });
  } catch (error) {
    res.status(500).json({ message: "Error fetching artist", error: error.message });
  }
});




// Update an artist by ID
router.patch("/artists/:id", validateId, async (req, res) => {
  const { error } = artistSchema.validate(req.body, { allowUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.status(200).json({ success: true, data: artist });
  } catch (error) {
    res.status(400).json({ message: "Error updating artist", error: error.message });
  }
});





// Delete an artist by ID
router.delete("/artists/:id", validateId, async (req, res) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.status(200).json({ success: true, data: artist });
  } catch (error) {
    res.status(500).json({ message: "Error deleting artist", error: error.message });
  }
});

module.exports = router;
