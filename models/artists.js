const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    img: { type: String, required: true },
    text: { type: String, default: "" },
    para1: { type: String, default: "" },
    para2: { type: String, default: "" },
    para3: { type: String, default: "" },
    hitSong: { type: String, default: "" },
    platforms: {
      spotify: { type: String, match: /^https?:\/\/.*/, default: "" },
      soundCloud: { type: String, match: /^https?:\/\/.*/, default: "" },
      youtube: { type: String, match: /^https?:\/\/.*/, default: "" },
      instagram: { type: String, match: /^https?:\/\/.*/, default: "" },
      appleMusic: { type: String, match: /^https?:\/\/.*/, default: "" },
      beatport: { type: String, match: /^https?:\/\/.*/, default: "" },
      bandcamp: { type: String, match: /^https?:\/\/.*/, default: "" },
      twitter: { type: String, match: /^https?:\/\/.*/, default: "" },
      deezer: { type: String, match: /^https?:\/\/.*/, default: "" },
      audiomack: { type: String, match: /^https?:\/\/.*/, default: "" },
      twitch: { type: String, match: /^https?:\/\/.*/, default: "" },
    },
  },
  { timestamps: true }
);

artistSchema.index({ name: 1 });

module.exports = mongoose.model("Artist", artistSchema);
