import type {
  DeadlineColor,
  Status,
  Task,
} from "../../types/task";
import TaskCard from "../tasks/TaskCard";

type ColumnProps = {
  title: string;
  status: Status;
  tasks: Task[];
  deadlineColors: Record<string, DeadlineColor>;
  onSelectTask: (task: Task) => void;
};

const columnStyles: Record<
  Status,
  {
    icon: string;
    border: string;
    badge: string;
    background: string;
  }
> = {
  todo: {
    icon: "📋",
    border: "border-slate-300",
    badge: "bg-slate-200 text-slate-700",
    background: "bg-slate-50",
  },
  inprogress: {
    icon: "🚀",
    border: "border-blue-300",
    badge: "bg-blue-100 text-blue-700",
    background: "bg-blue-50/50",
  },
  inreview: {
    icon: "👀",
    border: "border-amber-300",
    badge: "bg-amber-100 text-amber-700",
    background: "bg-amber-50/50",
  },
  done: {
    icon: "✅",
    border: "border-green-300",
    badge: "bg-green-100 text-green-700",
    background: "bg-green-50/50",
  },
};

export default function Column({
  title,
  status,
  tasks,
  deadlineColors,
  onSelectTask,
}: ColumnProps) {
  const filteredTasks = tasks
    .filter((task) => task.status === status)
    .sort((firstTask, secondTask) => {
      if (firstTask.isUrgent !== secondTask.isUrgent) {
        return firstTask.isUrgent ? -1 : 1;
      }

      return (
        new Date(firstTask.dueDate).getTime() -
        new Date(secondTask.dueDate).getTime()
      );
    });

  const style = columnStyles[status];

  return (
    <section
      className={`flex min-h-[650px] flex-col rounded-3xl border ${style.border} ${style.background} p-5 shadow-sm transition-all duration-300 hover:shadow-xl`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
            {style.icon}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>

            <p className="text-sm text-slate-500">
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1
                ? "Task"
                : "Tasks"}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
        >
          {filteredTasks.length}
        </span>
      </div>

      <div className="flex-1 space-y-4">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            deadlineColor={
              deadlineColors[task.id] ?? "yellow"
            }
            onSelectTask={onSelectTask}
          />
        ))}

        {filteredTasks.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 text-center">
            <div>
              <div className="mb-2 text-4xl opacity-60">
                {style.icon}
              </div>

              <p className="font-semibold text-slate-600">
                No tasks yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                This column is empty.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}