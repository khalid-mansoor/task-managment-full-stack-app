"use client";

import { useState, useRef, useEffect } from "react";
import Button from "./Button";
import { getFileUrl, formatFileSize } from "@/lib/api";

/**
 * TaskForm component.
 * Used for both creating and editing tasks with optional file attachment (images, PDFs, documents).
 *
 * Props:
 *  - initialData: { title, description, completed, file } — defaults for editing
 *  - onSubmit: function(formData) — called with FormData instance
 *  - isEditing: boolean — if true, shows the "completed" checkbox and "Save Changes" label
 *  - loading: boolean — disables the submit button while saving
 */
export default function TaskForm({
  initialData = {},
  onSubmit,
  isEditing = false,
  loading = false,
}) {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(
    initialData.description || ""
  );
  const [completed, setCompleted] = useState(
    initialData.completed || false
  );

  // File states
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const existingFile = initialData.file?.url ? initialData.file : null;

  // Cleanup object preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Check file size (max 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setError("File size exceeds 15MB limit. Please choose a smaller file.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setRemoveExistingFile(false);

    // Create image preview if image
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    handleFileSelect(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveNewFile = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveExisting = () => {
    setRemoveExistingFile(true);
    handleRemoveNewFile();
  };

  const handleRestoreExisting = () => {
    setRemoveExistingFile(false);
  };

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("completed", completed);

    if (file) {
      formData.append("file", file);
    }

    if (removeExistingFile) {
      formData.append("removeFile", "true");
    }

    onSubmit(formData);
  }

  // Determine file icon helper
  const getFileBadgeInfo = (mime, name) => {
    if (mime?.startsWith("image/") || name?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return { icon: "🖼️", label: "Image", bg: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (mime === "application/pdf" || name?.endsWith(".pdf")) {
      return { icon: "📄", label: "PDF Document", bg: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    if (name?.match(/\.(doc|docx)$/i)) {
      return { icon: "📝", label: "Word Document", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    }
    if (name?.match(/\.(xls|xlsx|csv)$/i)) {
      return { icon: "📊", label: "Spreadsheet", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (name?.match(/\.(zip|tar|gz|rar)$/i)) {
      return { icon: "🗜️", label: "Archive", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    return { icon: "📎", label: "Attachment", bg: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Validation error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-foreground mb-1.5"
        >
          Title <span className="text-danger">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Design homepage wireframes"
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-foreground mb-1.5"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional task details, requirements, or links..."
          rows={3}
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
        />
      </div>

      {/* Attachment Upload Section */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Attachment (Image, PDF, Document)
        </label>

        {/* Existing file in edit mode */}
        {existingFile && !removeExistingFile && !file && (
          <div className="mb-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {existingFile.mimeType?.startsWith("image/") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={getFileUrl(existingFile.url)}
                  alt="Existing attachment preview"
                  className="w-12 h-12 rounded object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0">
                  {getFileBadgeInfo(existingFile.mimeType, existingFile.originalName).icon}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs text-muted font-medium uppercase tracking-wide">
                  Current attachment
                </p>
                <a
                  href={getFileUrl(existingFile.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline truncate block"
                  title={existingFile.originalName}
                >
                  {existingFile.originalName}
                </a>
                <p className="text-xs text-muted">
                  {formatFileSize(existingFile.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-2.5 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemoveExisting}
                className="text-xs px-2.5 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Existing file marked for removal notice */}
        {existingFile && removeExistingFile && !file && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
            <span>Attachment will be deleted when you save changes.</span>
            <button
              type="button"
              onClick={handleRestoreExisting}
              className="text-primary font-medium hover:underline ml-2"
            >
              Undo
            </button>
          </div>
        )}

        {/* Newly selected file preview */}
        {file && (
          <div className="mb-3 p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="New file preview"
                  className="w-12 h-12 rounded object-cover border border-blue-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-blue-100 border border-blue-200 flex items-center justify-center text-xl shrink-0">
                  {getFileBadgeInfo(file.type, file.name).icon}
                </div>
              )}

              <div className="min-w-0">
                <span className="inline-block text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
                  New Attachment Ready
                </span>
                <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveNewFile}
              className="text-xs px-2.5 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 font-medium shrink-0"
            >
              ✕ Remove
            </button>
          </div>
        )}

        {/* Upload Dropzone / Picker */}
        {(!file && (!existingFile || removeExistingFile)) && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-primary bg-blue-50/50 scale-[0.99]"
                : "border-slate-300 hover:border-primary/60 hover:bg-slate-50/80"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-1.5 text-secondary">
              <span className="text-2xl">📎</span>
              <p className="text-sm font-medium text-foreground">
                <span className="text-primary hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted">
                Images (PNG, JPG, WebP), PDFs, Office Docs, or Archives up to 15MB
              </p>
            </div>
          </div>
        )}

        {/* Hidden native input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
        />
      </div>

      {/* Completed checkbox (edit mode only) */}
      {isEditing && (
        <div className="flex items-center gap-2 pt-1">
          <input
            id="completed"
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="completed" className="text-sm font-medium text-foreground cursor-pointer select-none">
            Mark as completed
          </label>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving task..."
            : isEditing
            ? "Save Changes"
            : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
