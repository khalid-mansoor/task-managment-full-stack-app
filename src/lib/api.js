const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
 * Create a new task
 */
export async function createTask(taskData) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to create task");
  }

  return data.data;
}

/**
 * Update an existing task by ID (title, description, completed)
 */
export async function updateTask(id, updates) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
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
