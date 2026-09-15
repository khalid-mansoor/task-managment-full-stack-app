"use client";

import Link from "next/link";
import Button from "./Button";
import { getFileUrl, formatFileSize } from "@/lib/api";

/**
 * TaskCard component.
 * Displays a single task with its title, description, status, attachment, and action buttons.
 *
 * Props:
 *  - task: { _id, title, description, completed, file, createdAt }
 *  - onToggle: function(_id) — toggle completed status
 *  - onDelete: function(_id) — delete the task
 */
export default function TaskCard({ task, onToggle, onDelete }) {
  const { _id, title, description, completed, file, createdAt } = task;

  const isImage =
    file?.url &&
    (file.mimeType?.startsWith("image/") ||
      file.originalName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));

  const isPdf =
    file?.url &&
    (file.mimeType === "application/pdf" || file.originalName?.endsWith(".pdf"));

  const getFileIcon = (mime, name) => {
    if (isPdf) return "📄";
    if (name?.match(/\.(doc|docx)$/i)) return "📝";
    if (name?.match(/\.(xls|xlsx|csv)$/i)) return "📊";
    if (name?.match(/\.(zip|tar|gz|rar)$/i)) return "🗜️";
    return "📎";
  };

  return (
    <div className="bg-card-bg border border-border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Top row: title + status badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3
            className={`font-semibold text-lg leading-snug ${
              completed ? "line-through text-muted" : "text-foreground"
            }`}
          >
            {title}
          </h3>

          <span
            className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
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
          <p className="text-secondary text-sm mb-3 line-clamp-3 whitespace-pre-line">
            {description}
          </p>
        )}

        {/* Attachment preview / chip */}
        {file && file.url && (
          <div className="mb-4">
            {isImage ? (
              <div className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <a
                  href={getFileUrl(file.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative overflow-hidden max-h-48"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFileUrl(file.url)}
                    alt={file.originalName || "Task attachment"}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                      🔍 Click to view full image
                    </span>
                  </div>
                </a>
                <div className="px-3 py-1.5 bg-slate-50 text-[11px] text-muted flex items-center justify-between border-t border-slate-100">
                  <span className="truncate max-w-[200px]" title={file.originalName}>
                    {file.originalName}
                  </span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">
                    {getFileIcon(file.mimeType, file.originalName)}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-medium text-foreground truncate max-w-[180px] sm:max-w-xs"
                      title={file.originalName}
                    >
                      {file.originalName}
                    </p>
                    <p className="text-[11px] text-muted">
                      {isPdf ? "PDF document" : "Attached file"} ·{" "}
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <a
                  href={getFileUrl(file.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={file.originalName}
                  className="shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  View / Download ↗
                </a>
              </div>
            )}
          </div>
        )}

        {/* Date */}
        <p className="text-muted text-xs mb-4">
          Created: {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
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
