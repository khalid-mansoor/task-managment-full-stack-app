const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const { upload, removeUploadedFile } = require("../config/upload");

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
 * @desc    Create a new task (supports multipart/form-data for attachments)
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    if (!title || !title.trim()) {
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res
        .status(400)
        .json({ success: false, message: "Title is required and cannot be empty" });
    }

    const taskPayload = {
      title: title.trim(),
      description: description ? description.trim() : "",
      completed:
        typeof completed === "string"
          ? completed === "true"
          : Boolean(completed),
    };

    if (req.file) {
      taskPayload.file = {
        url: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    const task = await Task.create(taskPayload);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename);
    }
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
 * @desc    Update a task by ID (title, description, completed, file)
 */
router.patch("/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      if (req.file) removeUploadedFile(req.file.filename);
      return res.status(400).json({ success: false, message: "Invalid task ID format" });
    }

    const existingTask = await Task.findById(id);
    if (!existingTask) {
      if (req.file) removeUploadedFile(req.file.filename);
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const updates = {};
    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        if (req.file) removeUploadedFile(req.file.filename);
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
      updates.completed =
        typeof req.body.completed === "string"
          ? req.body.completed === "true"
          : Boolean(req.body.completed);
    }

    // Handle file replacement or removal
    if (req.file) {
      // Remove old file if it existed
      if (existingTask.file && existingTask.file.url) {
        removeUploadedFile(existingTask.file.url);
      }
      updates.file = {
        url: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    } else if (
      req.body.removeFile === "true" ||
      req.body.removeFile === true
    ) {
      if (existingTask.file && existingTask.file.url) {
        removeUploadedFile(existingTask.file.url);
      }
      updates.file = {
        url: null,
        originalName: null,
        mimeType: null,
        size: null,
      };
    }

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename);
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task by ID and clean up any associated file
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID format" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Remove associated file from disk if present
    if (task.file && task.file.url) {
      removeUploadedFile(task.file.url);
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
