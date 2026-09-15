const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    file: {
      url: {
        type: String,
        default: null,
      },
      originalName: {
        type: String,
        default: null,
      },
      mimeType: {
        type: String,
        default: null,
      },
      size: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Task || mongoose.model("Task", TaskSchema);
