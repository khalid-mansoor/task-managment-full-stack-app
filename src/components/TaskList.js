"use client";

import TaskCard from "./TaskCard";

/**
 * TaskList component.
 * Renders a list of TaskCards, or an empty-state message when there are no tasks.
 *
 * Props:
 *  - tasks: array of task objects
 *  - onToggle: function(_id)
 *  - onDelete: function(_id)
 */
export default function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-muted text-sm">
          No tasks found. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
