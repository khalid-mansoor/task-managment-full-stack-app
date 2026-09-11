"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Link from "next/link";
import { fetchTask, updateTask } from "@/lib/api";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [task, setTask] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const loadTask = async () => {
      try {
        setFetching(true);
        setFetchError(null);
        const data = await fetchTask(id);
        setTask(data);
      } catch (err) {
        setFetchError(err.message || "Task not found");
      } finally {
        setFetching(false);
      }
    };

    loadTask();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      await updateTask(id, formData);
      router.push("/");
      router.refresh();
    } catch (err) {
      setSubmitError(err.message || "Failed to update task");
      setSubmitting(false);
    }
  };

  if (fetching) {
    return <Loading message="Loading task details..." />;
  }

  if (fetchError || !task) {
    return (
      <div className="max-w-xl">
        <ErrorMessage message={fetchError || "Task was not found."} />
        <Link
          href="/"
          className="inline-block mt-4 text-primary hover:text-primary-hover text-sm font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="text-primary hover:text-primary-hover text-sm font-medium"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-foreground mt-4 mb-1">
        Edit Task
      </h1>
      <p className="text-muted text-sm mb-6">
        Update the task details and save changes to MongoDB.
      </p>

      {submitError && (
        <div className="mb-4">
          <ErrorMessage message={submitError} />
        </div>
      )}

      <div className="bg-card-bg border border-border rounded-xl p-6">
        <TaskForm
          initialData={task}
          onSubmit={handleSubmit}
          isEditing={true}
          loading={submitting}
        />
      </div>
    </div>
  );
}
