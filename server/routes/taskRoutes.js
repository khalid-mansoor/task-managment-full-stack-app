const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();

/**
 * Utility helper to check for valid MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Middleware to verify MongoDB connection state
 */
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        "MongoDB is not connected. Please ensure MongoDB is running and your MONGODB_URI in .env is configured.",
    });
  }
  next();
});

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks
 */
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 */
router.post("/", async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required and cannot be empty" });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      completed: Boolean(completed),
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID format" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update a task by ID (title, description, completed)
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID format" });
    }

    const updates = {};
    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Title cannot be empty" });
      }
      updates.title = req.body.title.trim();
    }
    if (req.body.description !== undefined) {
      updates.description = req.body.description.trim();
    }
    if (req.body.completed !== undefined) {
      updates.completed = Boolean(req.body.completed);
    }

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID format" });
    }

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
