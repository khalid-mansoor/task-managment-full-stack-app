const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");
const { UPLOADS_DIR } = require("./config/upload");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(UPLOADS_DIR));

// API Health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Task Manager Express API is running" });
});

// Routes
app.use("/api/tasks", taskRoutes);

// Multer and general error handling middleware
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ success: false, message: "File size exceeds 15MB limit." });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

// Fallback 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Express] Server running on http://localhost:${PORT}`);
});
