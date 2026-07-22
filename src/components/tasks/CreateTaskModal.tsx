import { useState, type FormEvent } from "react";
import type { Task } from "../../types/task";

type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Task) => void;
};

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreateTask,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  if (!isOpen) {
    return null;
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setDueDate("");
    setIsUrgent(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !dueDate) {
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: trimmedDescription,
      dueDate,
      isUrgent,
      status: "todo",
    };

    onCreateTask(newTask);
    resetForm();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-yellow-600">
              GamePlan
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Create Task
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-3 py-2 text-xl font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close create task form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Task title
            </label>

            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter task title"
              required
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the task"
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
            />
          </div>

          <div>
            <label
              htmlFor="task-due-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Due date
            </label>

            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              The system automatically marks the earliest deadline orange,
              middle deadlines yellow, and the latest deadline green.
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(event) => setIsUrgent(event.target.checked)}
              className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500"
            />

            <span>
              <span className="block font-bold text-red-700">
                ❗ Mark as urgent
              </span>

              <span className="mt-1 block text-sm text-red-600">
                Urgent tasks will always appear at the top.
              </span>
            </span>
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-yellow-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-yellow-700"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}