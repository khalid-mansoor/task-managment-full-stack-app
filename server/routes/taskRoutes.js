
const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const { upload } = require("../config/upload");
const {
  uploadToAzure,
  deleteFromAzure,
} = require("../config/azureblob");

const router = express.Router();

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

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("[Tasks] Get all tasks error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task with optional Azure Blob attachment
 */
router.post("/", upload.single("file"), async (req, res) => {
  let uploadedBlob = null;

  try {
    const { title, description, completed } = req.body;

    /**
     * Validate title
     */
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required and cannot be empty",
      });
    }

    /**
     * Prepare task data
     */
    const taskPayload = {
      title: title.trim(),

      description: description ? description.trim() : "",

      completed:
        typeof completed === "string"
          ? completed === "true"
          : Boolean(completed),
    };

    /**
     * Upload file to Azure Blob Storage
     */
    if (req.file) {
      console.log("[Tasks] Uploading file to Azure Blob Storage...");

      uploadedBlob = await uploadToAzure(req.file);

      console.log("[Tasks] Azure upload successful:", uploadedBlob.blobName);

      taskPayload.file = {
        url: uploadedBlob.url,
        blobName: uploadedBlob.blobName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    /**
     * Save task in MongoDB
     */
    const task = await Task.create(taskPayload);

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("[Tasks] Create task error:", error);

    /**
     * If Azure upload succeeded but MongoDB failed,
     * remove the newly uploaded Azure blob.
     */
    if (uploadedBlob && uploadedBlob.blobName) {
      try {
        await deleteFromAzure(uploadedBlob.blobName);
        console.log(
          "[Tasks] Cleaned up Azure blob after MongoDB failure:",
          uploadedBlob.blobName
        );
      } catch (cleanupError) {
        console.error(
          "[Tasks] Failed to clean up Azure blob:",
          cleanupError.message
        );
      }
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
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
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("[Tasks] Get single task error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update a task by ID
 *
 * Supports:
 * - title
 * - description
 * - completed
 * - replace attachment
 * - remove attachment
 */
router.patch("/:id", upload.single("file"), async (req, res) => {
  let newUploadedBlob = null;

  try {
    const { id } = req.params;

    /**
     * Validate ID
     */
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    /**
     * Find existing task
     */
    const existingTask = await Task.findById(id);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const updates = {};

    /**
     * Update title
     */
    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      updates.title = req.body.title.trim();
    }

    /**
     * Update description
     */
    if (req.body.description !== undefined) {
      updates.description = req.body.description.trim();
    }

    /**
     * Update completed status
     */
    if (req.body.completed !== undefined) {
      updates.completed =
        typeof req.body.completed === "string"
          ? req.body.completed === "true"
          : Boolean(req.body.completed);
    }

    /**
     * ------------------------------------------------
     * REPLACE EXISTING FILE
     * ------------------------------------------------
     */
    if (req.file) {
      console.log("[Tasks] Uploading replacement file to Azure...");

      /**
       * Upload the new file first.
       * This protects us from losing the old file if
       * the new upload fails.
       */
      newUploadedBlob = await uploadToAzure(req.file);

      console.log(
        "[Tasks] New Azure blob uploaded:",
        newUploadedBlob.blobName
      );

      updates.file = {
        url: newUploadedBlob.url,
        blobName: newUploadedBlob.blobName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    /**
     * ------------------------------------------------
     * REMOVE EXISTING FILE
     * ------------------------------------------------
     */
    else if (
      req.body.removeFile === "true" ||
      req.body.removeFile === true
    ) {
      updates.file = {
        url: null,
        blobName: null,
        originalName: null,
        mimeType: null,
        size: null,
      };
    }

    /**
     * Update MongoDB
     */
    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    /**
     * ------------------------------------------------
     * DELETE OLD AZURE FILE
     * ------------------------------------------------
     *
     * Only delete the old blob after MongoDB has
     * successfully updated.
     */
    if (req.file) {
      if (existingTask.file && existingTask.file.blobName) {
        try {
          await deleteFromAzure(existingTask.file.blobName);

          console.log(
            "[Tasks] Old Azure blob deleted:",
            existingTask.file.blobName
          );
        } catch (deleteError) {
          /**
           * Don't fail the whole request because the
           * database already contains the new file.
           */
          console.error(
            "[Tasks] Failed to delete old Azure blob:",
            deleteError.message
          );
        }
      }
    }

    /**
     * ------------------------------------------------
     * DELETE FILE WHEN removeFile=true
     * ------------------------------------------------
     */
    if (
      !req.file &&
      (req.body.removeFile === "true" ||
        req.body.removeFile === true)
    ) {
      if (existingTask.file && existingTask.file.blobName) {
        try {
          await deleteFromAzure(existingTask.file.blobName);

          console.log(
            "[Tasks] Azure blob removed:",
            existingTask.file.blobName
          );
        } catch (deleteError) {
          console.error(
            "[Tasks] Failed to delete Azure blob:",
            deleteError.message
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("[Tasks] Update task error:", error);

    /**
     * If a new Azure blob was uploaded but something
     * failed afterward, clean it up.
     */
    if (newUploadedBlob && newUploadedBlob.blobName) {
      try {
        await deleteFromAzure(newUploadedBlob.blobName);

        console.log(
          "[Tasks] Cleaned up new Azure blob after update failure:",
          newUploadedBlob.blobName
        );
      } catch (cleanupError) {
        console.error(
          "[Tasks] Failed to clean up new Azure blob:",
          cleanupError.message
        );
      }
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task and its Azure Blob attachment
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    /**
     * Validate ID
     */
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    /**
     * Find task
     */
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    /**
     * Delete Azure Blob attachment
     */
    if (task.file && task.file.blobName) {
      try {
        await deleteFromAzure(task.file.blobName);

        console.log(
          "[Tasks] Azure blob deleted:",
          task.file.blobName
        );
      } catch (deleteError) {
        console.error(
          "[Tasks] Failed to delete Azure blob:",
          deleteError.message
        );

        /**
         * We continue deleting the MongoDB task.
         * The blob deletion problem can be handled separately.
         */
      }
    }

    /**
     * Delete task from MongoDB
     */
    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("[Tasks] Delete task error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

