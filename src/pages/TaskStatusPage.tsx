import { Navigate, useParams } from "react-router-dom";
import Column from "../components/board/Column";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal";
import type {
  DeadlineColor,
  Status,
  Task,
} from "../types/task";

type TaskStatusPageProps = {
  tasks: Task[];
  selectedTask: Task | null;
  isCreateModalOpen: boolean;
  isLoadingTasks: boolean;
  isSavingTask: boolean;
  isDarkMode: boolean;
  canReview: boolean;
  onSelectTask: (task: Task | null) => void;
  onOpenCreateModal: () => void;
  onCloseCreateModal: () => void;
  onCreateTask: (task: Task) => void;
  onMoveTask: (
    taskId: string,
    status: Status,
  ) => void;
  onReturnTask: (
    taskId: string,
    message: string,
  ) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
};

const statusInformation: Record<
  Status,
  {
    title: string;
    description: string;
    icon: string;
  }
> = {
  todo: {
    title: "To Do",
    description:
      "Tasks that are ready to be started.",
    icon: "📋",
  },
  inprogress: {
    title: "In Progress",
    description:
      "Tasks that are currently being worked on.",
    icon: "🚀",
  },
  inreview: {
    title: "In Review",
    description:
      "Tasks waiting for manager review.",
    icon: "👀",
  },
  done: {
    title: "Completed",
    description:
      "Tasks that have been reviewed and completed.",
    icon: "✅",
  },
};

function isValidStatus(value: string): value is Status {
  return (
    value === "todo" ||
    value === "inprogress" ||
    value === "inreview" ||
    value === "done"
  );
}

function getDeadlineColors(
  tasks: Task[],
): Record<string, DeadlineColor> {
  const activeTasks = tasks
    .filter((task) => task.status !== "done")
    .sort(
      (firstTask, secondTask) =>
        new Date(firstTask.dueDate).getTime() -
        new Date(secondTask.dueDate).getTime(),
    );

  const colors: Record<string, DeadlineColor> = {};

  if (activeTasks.length === 1) {
    colors[activeTasks[0].id] = "yellow";
    return colors;
  }

  activeTasks.forEach((task, index) => {
    if (index === 0) {
      colors[task.id] = "orange";
    } else if (index === activeTasks.length - 1) {
      colors[task.id] = "green";
    } else {
      colors[task.id] = "yellow";
    }
  });

  return colors;
}

export default function TaskStatusPage({
  tasks,
  selectedTask,
  isCreateModalOpen,
  isLoadingTasks,
  isSavingTask,
  isDarkMode,
  canReview,
  onSelectTask,
  onOpenCreateModal,
  onCloseCreateModal,
  onCreateTask,
  onMoveTask,
  onReturnTask,
  onUpdateTask,
  onDeleteTask,
}: TaskStatusPageProps) {
  const { status = "" } = useParams();

  if (!isValidStatus(status)) {
    return <Navigate to="/tasks/todo" replace />;
  }

  const pageInformation = statusInformation[status];

  const statusTasks = tasks.filter(
    (task) => task.status === status,
  );

  const deadlineColors =
    getDeadlineColors(statusTasks);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <section
          className={`mb-8 rounded-3xl border p-8 shadow-sm ${
            isDarkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
                GamePlan Tasks
              </p>

              <h1
                className={`mt-3 flex items-center gap-3 text-4xl font-extrabold ${
                  isDarkMode
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                <span>{pageInformation.icon}</span>
                <span>{pageInformation.title}</span>
              </h1>

              <p
                className={`mt-3 ${
                  isDarkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                {pageInformation.description}
              </p>

              <p
                className={`mt-2 text-sm font-semibold ${
                  isDarkMode
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                {statusTasks.length}{" "}
                {statusTasks.length === 1
                  ? "task"
                  : "tasks"}
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenCreateModal}
              disabled={
                isLoadingTasks || isSavingTask
              }
              className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingTask
                ? "Saving..."
                : "+ Create Task"}
            </button>
          </div>
        </section>

        {isLoadingTasks ? (
          <div
            className={`rounded-3xl border p-16 text-center ${
              isDarkMode
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

            <p
              className={`mt-5 font-semibold ${
                isDarkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              Loading tasks...
            </p>
          </div>
        ) : (
          <Column
            title={pageInformation.title}
            status={status}
            tasks={statusTasks}
            deadlineColors={deadlineColors}
            onSelectTask={onSelectTask}
          />
        )}
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={onCloseCreateModal}
        onCreateTask={onCreateTask}
      />

      <TaskDetailsModal
        task={selectedTask}
        canReview={canReview}
        onClose={() => onSelectTask(null)}
        onMoveTask={onMoveTask}
        onReturnTask={onReturnTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />
    </>
  );
}