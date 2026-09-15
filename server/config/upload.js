const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Ensure upload directory exists
const UPLOADS_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const rawBase = path.basename(file.originalname, ext);
    // Sanitize filename to alphanumeric, dashes, and underscores
    const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50) || "attachment";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  },
});

// Dangerous extensions to reject for security
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

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(`File extension '${ext}' is not allowed for security reasons.`)
    );
  }
  cb(null, true);
};

// 15 MB max file size
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter,
});

/**
 * Safely delete a file from the uploads directory given its URL or filename
 * @param {string} fileUrl e.g. "/uploads/my-photo-1234.png"
 */
function removeUploadedFile(fileUrl) {
  if (!fileUrl) return;
  try {
    const filename = path.basename(fileUrl);
    const fullPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error(`[Upload] Failed to delete file ${fileUrl}:`, err.message);
  }
}

module.exports = {
  upload,
  UPLOADS_DIR,
  removeUploadedFile,
};
