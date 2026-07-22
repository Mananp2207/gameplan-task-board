import type { DeadlineColor, Task } from "../../types/task";

type TaskCardProps = {
  task: Task;
  deadlineColor: DeadlineColor;
  onSelectTask: (task: Task) => void;
};

const deadlineStyles: Record<DeadlineColor, string> = {
  orange: "bg-orange-100 text-orange-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
};

function formatDueDate(dueDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${dueDate}T00:00:00`));
}

function isTaskOverdue(task: Task) {
  if (task.status === "done") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${task.dueDate}T00:00:00`);

  return dueDate < today;
}

export default function TaskCard({
  task,
  deadlineColor,
  onSelectTask,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task);

  return (
    <button
      type="button"
      onClick={() => onSelectTask(task)}
      className={`group w-full rounded-3xl border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl ${
        overdue
          ? "border-red-300"
          : "border-slate-200 hover:border-blue-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {task.isUrgent && (
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
              🚨 Urgent
            </span>
          )}

          {overdue && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              Overdue
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            overdue
              ? "bg-red-100 text-red-700"
              : deadlineStyles[deadlineColor]
          }`}
        >
          {overdue ? "⚠ Due " : "📅 Due "}
          {formatDueDate(task.dueDate)}
        </div>

        {task.managerMessage && (
          <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            💬 Feedback
          </div>
        )}
      </div>
    </button>
  );
}