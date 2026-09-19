
const path = require("path");
const multer = require("multer");

/**
 * Dangerous extensions to reject for security
 */
const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".ps1",
  ".msi",
  ".vbs",
  ".com",
  ".scr",
  ".dll",
]);

/**
 * Validate uploaded file extension
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(
        `File extension '${ext}' is not allowed for security reasons.`
      )
    );
  }

  cb(null, true);
};

/**
 * Multer configuration
 *
 * memoryStorage means:
 *
 * Browser
 *    ↓
 * Multer
 *    ↓
 * req.file.buffer
 *    ↓
 * Azure Blob Storage
 *
 * No permanent local file is created.
 */
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 15 * 1024 * 1024,
  },

  fileFilter,
});

module.exports = {
  upload,
};

