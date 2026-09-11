"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import ErrorMessage from "@/components/ErrorMessage";
import Link from "next/link";
import { createTask } from "@/lib/api";

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await createTask(formData);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to create task");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="text-primary hover:text-primary-hover text-sm font-medium mb-4 inline-block"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-1">
        Create New Task
      </h1>
      <p className="text-muted text-sm mb-6">
        Fill out the form below to save a new task to MongoDB.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="bg-card-bg border border-border rounded-xl p-6">
        <TaskForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
