const express = require("express");
const mongoose = require("mongoose");
const Artist = require("../models/artists");
const Joi = require("joi");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a timestamp to avoid name conflicts
  },
});

const upload = multer({ storage });

// Validation Schema
const artistSchema = Joi.object({
  name: Joi.string().required(),
  text: Joi.string().optional(),
  para1: Joi.string().optional(),
  para2: Joi.string().optional(),
  para3: Joi.string().optional(),
  hitSong: Joi.string().optional(),
});

// Middleware to validate MongoDB ObjectId
const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid artist ID" });
  }
  next();
};

// Create a new artist
router.post("/artists", upload.single("img"), async (req, res) => {
  const { name, text, para1, para2, para3, hitSong } = req.body;

  // Check if a file is uploaded
  const img = req.file ? `/uploads/${req.file.filename}` : null;

  // Validate artist data using Joi
  const { error } = artistSchema.validate({ name, text, para1, para2, para3, hitSong });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Create the artist object with the image file path
  const artist = {
    name,
    text: text || '',
    img,
    para1: para1 || '',
    para2: para2 || '',
    para3: para3 || '',
    hitSong: hitSong || '',
  };

  try {
    const newArtist = await Artist.create(artist);
    res.status(201).json({ success: true, data: newArtist });
    console.log("successfully added celebrity", res.data)
  } catch (error) {
    console.error("Error adding celebrity:", error);
    const errorMessage =
      error.code === 11000
        ? "Duplicate artist"
        : "Error adding artist";
    res.status(500).json({ message: errorMessage, error: error.message });
  }
});

module.exports = router;


// Get all artists
router.get("/artists", async (req, res) => {
  try {
    const artists = await Artist.find();
    res.status(200).json({ success: true, data: artists });
  } catch (error) {
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
