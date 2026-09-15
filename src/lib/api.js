const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

/**
 * Utility to get full public URL for uploaded files
 */
export function getFileUrl(fileUrl) {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }
  return `${SERVER_BASE_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

/**
 * Format file size into human readable string (e.g. 1.2 MB)
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Fetch all tasks from Express API
 */
export async function fetchTasks() {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch tasks");
  }

  return data.data;
}

/**
 * Fetch a single task by ID
 */
export async function fetchTask(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch task");
  }

  return data.data;
}

/**
 * Create a new task (supports JSON or FormData with file attachment)
 */
export async function createTask(taskData) {
  const isFormData =
    typeof FormData !== "undefined" && taskData instanceof FormData;

  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? taskData : JSON.stringify(taskData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to create task");
  }

  return data.data;
}

/**
 * Update an existing task by ID (supports JSON or FormData)
 */
export async function updateTask(id, updates) {
  const isFormData =
    typeof FormData !== "undefined" && updates instanceof FormData;

  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? updates : JSON.stringify(updates),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to update task");
  }

  return data.data;
}

/**
 * Delete a task by ID
 */
export async function deleteTask(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to delete task");
  }

  return data;
}

