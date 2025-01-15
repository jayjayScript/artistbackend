const express = require("express");
const mongoose = require("mongoose")
const Artist = require("../models/artists.js"); // Corrected typo
const router = express.Router();

// Handle an array of artist objects
router.post("/artists", async (req, res) => {
  try {
    const artists = req.body;
    if (!Array.isArray(artists)) {
      return res
        .status(400)
        .json({ message: "Request body must be an array of artist objects" });
    }
    const newArtists = await Artist.insertMany(artists, { ordered: false });
    res.status(201).json(newArtists);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Duplicate key error", error });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.get("/artists", async (req, res) => {
  try {
    const artists = await Artist.find();
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get an artist by ID
router.get("/artists/:id", async (req, res) => {  // Changed from "/api/artists/:id" to "/artists/:id"
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    // Validate the ID as a MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }

    // Query the database to find the artist by ID
    const artist = await Artist.findById(id);

    // Handle case where artist is not found
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    // Return the artist data
    res.status(200).json(artist);
  } catch (error) {
    // Handle unexpected server errors
    console.error("Error fetching artist:", error);
    res.status(500).json({ message: "Error fetching artist", error: error.message });
  }
});

// Update an artist by ID
router.patch("/artists/:id", async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }
    res.status(200).json(artist);
  } catch (error) {
    res.status(400).json({ message: "Error updating artist", error });
  }
});

// Delete an artist by ID
router.delete("/artists/:id", async (req, res) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }
    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json({ message: "Error deleting artist", error });
  }
});

module.exports = router;
