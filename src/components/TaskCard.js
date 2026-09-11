"use client";

import Link from "next/link";
import Button from "./Button";

/**
 * TaskCard component.
 * Displays a single task with its title, description, status, and action buttons.
 *
 * Props:
 *  - task: { _id, title, description, completed, createdAt }
 *  - onToggle: function(_id) — toggle completed status
 *  - onDelete: function(_id) — delete the task
 */
export default function TaskCard({ task, onToggle, onDelete }) {
  const { _id, title, description, completed, createdAt } = task;

  return (
    <div className="bg-card-bg border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      {/* Top row: title + status badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3
          className={`font-semibold text-lg ${
            completed ? "line-through text-muted" : "text-foreground"
          }`}
        >
          {title}
        </h3>

        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
            completed
              ? "bg-success-bg text-green-700"
              : "bg-warning-bg text-amber-700"
          }`}
        >
          {completed ? "Completed" : "Active"}
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-secondary text-sm mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* Date */}
      <p className="text-muted text-xs mb-4">
        Created: {new Date(createdAt).toLocaleDateString()}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={completed ? "secondary" : "success"}
          size="sm"
          onClick={() => onToggle(_id)}
        >
          {completed ? "↩ Mark Active" : "✓ Complete"}
        </Button>

        <Link href={`/tasks/${_id}`}>
          <Button variant="secondary" size="sm">
            ✏️ Edit
          </Button>
        </Link>

        <Button variant="danger" size="sm" onClick={() => onDelete(_id)}>
          🗑 Delete
        </Button>
      </div>
    </div>
  );
}
