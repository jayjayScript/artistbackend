const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  // _id: { type: Number, required: true, unique: true},
  name: { type: String, required: true },
  img: { type: String, required: true },
  para1: { type: String },
  para2: { type: String },
  para3: { type: String },
  hitSong: { type: String },
  platforms: {
    spotify: { type: String },
    soundCloud: { type: String },
    youtube: { type: String },
    instagram: { type: String },
    appleMusic: { type: String },
    beatport: { type: String },
    bandcamp: { type: String },
    twitter: { type: String },
    deezer: { type: String },
    audiomack: { type: String },
    twitch: { type: String }
  },
  text: { type: String }
});

module.exports = mongoose.model("Artist", artistSchema);