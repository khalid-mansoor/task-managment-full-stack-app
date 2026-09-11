const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Task Manager Express API is running" });
});

// Routes
app.use("/api/tasks", taskRoutes);

// Fallback 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Express] Server running on http://localhost:${PORT}`);
});
