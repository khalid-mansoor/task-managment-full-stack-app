const dns = require("dns");
const mongoose = require("mongoose");

// Ensure MongoDB Atlas SRV lookup resolves reliably on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Fallback
}

/**
 * Connect to MongoDB database via Mongoose
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/task-manager"
    );
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Do not crash immediately in dev, but log error clearly
  }
};

module.exports = connectDB;
