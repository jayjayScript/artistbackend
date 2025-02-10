const express = require("express");
const mongoose = require("mongoose");
const Artist = require("../models/artists.js");
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
  charity: Joi.string().optional(),
  aboutCharity: Joi.string().optional(),
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
  const {
    _id,
    name,
    text,
    para1,
    para2,
    para3,
    hitSong,
    charity,
    aboutCharity,
    img,
  } = req.body;

  // Validate artist data using Joi
  const { error } = artistSchema.validate({
    name,
    text,
    para1,
    para2,
    para3,
    hitSong,
    charity,
    aboutCharity,
    img,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  let imageUrl = img;

  // Handle Cloudinary image upload if needed
  const uploadImage = async (img) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(img, { folder: "uploads" }, (error, result) => {
        if (error) reject(error);
        resolve(result.secure_url);
      });
    });
  };
  
  // Inside your POST route
  if (img && img.startsWith("data:image")) {
    try {
      const result = await uploadImage(img);
      imageUrl = result; // Use the image URL for the artist
    } catch (uploadError) {
      console.error("Error uploading to Cloudinary:", uploadError);
      return res.status(500).json({ message: "Error uploading image" });
    }
  }

  try {
    const updatedArtist = await Artist.findOneAndUpdate(
      { _id: _id || new mongoose.Types.ObjectId() }, // If no _id is provided, generate a new one
      {
        name,
        text,
        img: imageUrl,
        para1,
        para2,
        para3,
        hitSong,
        charity,
        aboutCharity,
      },
      { upsert: true, new: true, runValidators: true } // 🔥 This ensures updates or inserts
    );

    return res.status(200).json({
      success: true,
      message: _id ? "Artist updated successfully" : "Artist added successfully",
      data: updatedArtist,
    });
  } catch (err) {
    console.error("Error processing request:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});





// Get all Celebrities
router.get("/artists", async (req, res) => {
  try {
    // ✅ Ensure MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // Prevent long MongoDB hangs
      });
    }

    // ✅ CORS: Allow multiple domains
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

    // ✅ Pagination logic
    const page = parseInt(req.query.page) || 1; // Default: Page 1
    const limit = parseInt(req.query.limit); // Default: 10 per page
    const skip = (page - 1) * limit;

    // ✅ Fetch artists with a timeout guard
    const artists = await Artist.find()
      .sort({ createdAt: -1 }) // Sort newest first (if you have timestamps)
      .skip(skip)
      .limit(limit)
      .lean() // Optimize performance by returning plain objects

    res.status(200).json({ success: true, data: artists });
  } catch (error) {
    console.error("Error fetching artists:", error);
    res.status(500).json({ message: "Error fetching artists", error: error.message });
  }
});



// Get an artist by ID
router.get("/artists/:id", validateId, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.status(200).json({ success: true, data: artist });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching artist", error: error.message });
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
    res
      .status(400)
      .json({ message: "Error updating artist", error: error.message });
  }
});

// Update an artist by ID
router.put("/artists/:id", validateId, async (req, res) => {
  try {
    const { error } = artistSchema.validate(req.body); // Validate *only* what's being updated
    if (error) {
      console.error("Validation Error:", error);
      return res.status(400).json({ message: error.details[0].message });
    }

    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Enforce schema validation
    });

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.status(200).json({ success: true, data: artist }); // Consistent success response
  } catch (error) {
    console.error("Error updating artist:", error);

    if (error.name === "ValidationError") {
      // Mongoose validation errors
      return res.status(400).json({ message: error.message }); // Send validation error to client
    }

    res
      .status(500)
      .json({ message: "Server error updating artist", error: error.message }); // More generic error message for other errors
  }
});

module.exports = router;

// Delete an artist by ID
router.delete("/artists/:id", validateId, async (req, res) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.status(200).json({ success: true, data: artist });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting artist", error: error.message });
  }
});

module.exports = router;
