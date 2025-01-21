// require("dotenv").config(); // This loads the .env file

require("dotenv").config(); // Load environment variables
const cloudinary = require("cloudinary").v2;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const artistRoutes = require("./routes/artistsRoutes");
const helmet = require("helmet");

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const allowedOrigins = [
  "https://artistphere.onrender.com/",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Block the request
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB connection lost. Retrying...");
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, tls: true,  });
});

app.use("/api", artistRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Artists API");
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ message: "Invalid token" });
  } else if (err.message === "Not allowed by CORS") {
    res.status(403).json({ message: "CORS Error: Access Denied" });
  } else {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});