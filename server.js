require("dotenv").config(); // This loads the .env file

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const artistRoutes = require("./routes/artistsRoutes");
const helmet = require("helmet");

const app = express();

const allowedOrigins = [
  "https://artistphere.onrender.com",
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
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

app.use("/api", artistRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Artists API");
});

app.use((err, req, res) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Invalid token");
  } else if (err.message === "Not allowed by CORS") {
    res.status(403).send("CORS Error: Access Denied");
  } else {
    res.status(500).send("An unexpected error occurred");
  }
});