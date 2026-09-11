"use client";

import { useState } from "react";
import Button from "./Button";

/**
 * TaskForm component.
 * Used for both creating and editing tasks.
 *
 * Props:
 *  - initialData: { title, description, completed } — defaults for editing
 *  - onSubmit: function(formData) — called with { title, description, completed }
 *  - isEditing: boolean — if true, shows the "completed" checkbox and uses "Save Changes" label
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
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    // Basic client-side validation
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setError("");
    onSubmit({ title: title.trim(), description: description.trim(), completed });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Validation error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Title <span className="text-danger">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Learn Next.js"
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional task details..."
          rows={4}
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>

      {/* Completed checkbox (edit mode only) */}
      {isEditing && (
        <div className="flex items-center gap-2">
          <input
            id="completed"
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="completed" className="text-sm text-foreground">
            Mark as completed
          </label>
        </div>
      )}

      {/* Submit */}
      <Button type="submit" disabled={loading}>
        {loading
          ? "Saving..."
          : isEditing
          ? "Save Changes"
          : "Create Task"}
      </Button>
    </form>
  );
}
