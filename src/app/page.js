"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TaskList from "@/components/TaskList";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { fetchTasks, updateTask, deleteTask } from "@/lib/api";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "active" | "completed"

  // Fetch tasks on component mount
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || "Failed to load tasks from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Toggle a task's completed status
  const handleToggle = async (id) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;

    try {
      const updated = await updateTask(id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      alert(`Error updating task: ${err.message}`);
    }
  };

  // Delete a task
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  // Filter tasks based on the selected tab
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  // Counts for the filter tabs
  const counts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Manager</h1>
          <p className="text-muted text-sm mt-1">
            {counts.all} total · {counts.active} active · {counts.completed}{" "}
            completed
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium"
        >
          + Add Task
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-card-bg text-foreground shadow-sm"
                : "text-secondary hover:text-foreground"
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
          <button
            onClick={loadTasks}
            className="mt-3 text-sm text-primary hover:underline font-medium"
          >
            Try reloading
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <Loading message="Loading your tasks from MongoDB..." />
      ) : (
        /* Task list */
        <TaskList
          tasks={filteredTasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
