import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import type { Status, Task } from "../../types/task";

type TaskDetailsModalProps = {
  task: Task | null;
  canReview: boolean;
  onClose: () => void;
  onMoveTask: (
    taskId: string,
    newStatus: Status,
  ) => void;
  onReturnTask: (
    taskId: string,
    managerMessage: string,
  ) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
};

export default function TaskDetailsModal({
  task,
  canReview,
  onClose,
  onMoveTask,
  onReturnTask,
  onUpdateTask,
  onDeleteTask,
}: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [
    isDeleteConfirmationOpen,
    setIsDeleteConfirmationOpen,
  ] = useState(false);

  const [
    isReturnFormOpen,
    setIsReturnFormOpen,
  ] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [managerMessage, setManagerMessage] =
    useState("");

  useEffect(() => {
    if (!task) {
      return;
    }

    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setIsUrgent(task.isUrgent);
    setManagerMessage("");

    setIsEditing(false);
    setIsDeleteConfirmationOpen(false);
    setIsReturnFormOpen(false);
  }, [task]);

  if (!task) {
    return null;
  }

  function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!task) {
      return;
    }

    const trimmedTitle = title.trim();

    if (!trimmedTitle || !dueDate) {
      return;
    }

    const updatedTask: Task = {
      ...task,
      title: trimmedTitle,
      description: description.trim(),
      dueDate,
      isUrgent,
    };

    onUpdateTask(updatedTask);
    setIsEditing(false);
  }

  function handleStartEditing() {
    if (!task) {
      return;
    }

    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setIsUrgent(task.isUrgent);
    setIsEditing(true);
    setIsReturnFormOpen(false);
  }

  function handleCancelEditing() {
    if (!task) {
      return;
    }

    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setIsUrgent(task.isUrgent);
    setIsEditing(false);
  }

  function handleMove(newStatus: Status) {
    if (!task) {
      return;
    }

    onMoveTask(task.id, newStatus);
  }

  function handleOpenReturnForm() {
    setManagerMessage("");
    setIsReturnFormOpen(true);
  }

  function handleCancelReturn() {
    setManagerMessage("");
    setIsReturnFormOpen(false);
  }

  function handleReturnTask(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!task) {
      return;
    }

    const trimmedMessage = managerMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    onReturnTask(task.id, trimmedMessage);
    setManagerMessage("");
    setIsReturnFormOpen(false);
  }

  function handleDeleteTask() {
    if (!task) {
      return;
    }

    onDeleteTask(task.id);
    setIsDeleteConfirmationOpen(false);
  }

  function formatStatus(status: Status) {
    if (status === "inprogress") {
      return "In Progress";
    }

    if (status === "inreview") {
      return "In Review";
    }

    if (status === "todo") {
      return "To Do";
    }

    return "Done";
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
        onMouseDown={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-details-title"
          className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-yellow-600">
                Task Details
              </p>

              {!isEditing && (
                <h2
                  id="task-details-title"
                  className="mt-1 text-2xl font-bold text-slate-900"
                >
                  {task.title}
                </h2>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xl font-semibold text-slate-500 transition hover:bg-slate-100"
              aria-label="Close task details"
            >
              ×
            </button>
          </div>

          {isEditing ? (
            <form
              onSubmit={handleSave}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="edit-task-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Task title
                </label>

                <input
                  id="edit-task-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  required
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-task-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="edit-task-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-task-due-date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Due date
                </label>

                <input
                  id="edit-task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(event) =>
                    setIsUrgent(event.target.checked)
                  }
                  className="h-5 w-5"
                />

                <span className="font-bold text-red-700">
                  ❗ Mark as urgent
                </span>
              </label>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!title.trim() || !dueDate}
                  className="rounded-lg bg-yellow-600 px-4 py-2.5 font-semibold text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              {task.description ? (
                <p className="text-sm leading-6 text-slate-600">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm italic text-slate-400">
                  No description provided.
                </p>
              )}

              <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Due date
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }).format(
                      new Date(
                        `${task.dueDate}T00:00:00`,
                      ),
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatStatus(task.status)}
                  </p>
                </div>
              </div>

              {task.isUrgent && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 font-bold text-red-700">
                  ❗ Urgent task
                </div>
              )}

              {task.managerMessage &&
                task.status === "todo" && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                      Manager feedback
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm text-amber-800">
                      {task.managerMessage}
                    </p>
                  </div>
                )}

              {isReturnFormOpen && (
                <form
                  onSubmit={handleReturnTask}
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <label
                    htmlFor="manager-message"
                    className="block text-sm font-bold text-red-800"
                  >
                    Feedback for the task owner
                  </label>

                  <p className="mt-1 text-sm text-red-700">
                    Explain what needs to be changed before
                    this task is submitted again.
                  </p>

                  <textarea
                    id="manager-message"
                    value={managerMessage}
                    onChange={(event) =>
                      setManagerMessage(
                        event.target.value,
                      )
                    }
                    rows={4}
                    required
                    autoFocus
                    placeholder="Enter the changes that are needed..."
                    className="mt-3 w-full resize-none rounded-lg border border-red-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />

                  <div className="mt-3 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancelReturn}
                      className="rounded-lg border border-red-300 bg-white px-4 py-2.5 font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!managerMessage.trim()}
                      className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Return to To Do
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setIsDeleteConfirmationOpen(true)
                  }
                  className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Delete Task
                </button>

                <div className="flex flex-wrap justify-end gap-3">
                  {(task.status === "todo" ||
                    task.status === "inprogress") && (
                    <button
                      type="button"
                      onClick={handleStartEditing}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Edit Task
                    </button>
                  )}

                  {task.status === "todo" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleMove("inprogress")
                      }
                      className="rounded-lg bg-yellow-600 px-4 py-2.5 font-semibold text-white transition hover:bg-yellow-700"
                    >
                      Start Task
                    </button>
                  )}

                  {task.status === "inprogress" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleMove("inreview")
                      }
                      className="rounded-lg bg-violet-600 px-4 py-2.5 font-semibold text-white transition hover:bg-violet-700"
                    >
                      Submit for Review
                    </button>
                  )}

                  {task.status === "inreview" &&
                    canReview &&
                    !isReturnFormOpen && (
                      <>
                        <button
                          type="button"
                          onClick={handleOpenReturnForm}
                          className="rounded-lg border border-red-300 px-4 py-2.5 font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Return Task
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleMove("done")
                          }
                          className="rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white transition hover:bg-green-700"
                        >
                          Approve
                        </button>
                      </>
                    )}

                  {task.status === "inreview" &&
                    !canReview && (
                      <div className="rounded-lg bg-slate-100 px-4 py-2.5 font-semibold text-slate-600">
                        Waiting for manager review
                      </div>
                    )}

                  {task.status === "done" && (
                    <div className="rounded-lg bg-green-100 px-4 py-2.5 font-bold text-green-700">
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isDeleteConfirmationOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4"
          onMouseDown={() =>
            setIsDeleteConfirmationOpen(false)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-task-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
              🗑️
            </div>

            <h2
              id="delete-task-title"
              className="mt-4 text-xl font-bold text-slate-900"
            >
              Delete task?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">
                “{task.title}”
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setIsDeleteConfirmationOpen(false)
                }
                className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTask}
                className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}