import Board from "../components/board/Board";
import DashboardStats from "../components/dashboard/DashboardStats";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal";
import type { Status, Task } from "../types/task";

type DashboardProps = {
  tasks: Task[];
  selectedTask: Task | null;
  isCreateModalOpen: boolean;
  isLoadingTasks: boolean;
  isSavingTask: boolean;
  isDarkMode: boolean;
  canReview: boolean;

  todoTasks: number;
  urgentTasks: number;
  inProgressTasks: number;
  completedTasks: number;

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

export default function Dashboard({
  tasks,
  selectedTask,
  isCreateModalOpen,
  isLoadingTasks,
  isSavingTask,
  isDarkMode,
  canReview,
  todoTasks,
  urgentTasks,
  inProgressTasks,
  completedTasks,
  onSelectTask,
  onOpenCreateModal,
  onCloseCreateModal,
  onCreateTask,
  onMoveTask,
  onReturnTask,
  onUpdateTask,
  onDeleteTask,
}: DashboardProps) {
  return (
    <>
      <section
        className={`mb-8 overflow-hidden rounded-3xl border shadow-lg ${
          isDarkMode
            ? "border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800"
            : "border-slate-200 bg-gradient-to-r from-blue-50 via-white to-slate-50"
        }`}
      >
        <div className="flex flex-col justify-between gap-8 p-8 lg:flex-row lg:items-center">
          <div>
            <p
              className={`mb-3 text-sm font-bold uppercase tracking-[0.35em] ${
                isDarkMode
                  ? "text-blue-400"
                  : "text-blue-600"
              }`}
            >
              GAMEPLAN
            </p>

            <h1
              className={`text-5xl font-extrabold tracking-tight ${
                isDarkMode
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Welcome back 👋
            </h1>

            <p
              className={`mt-5 max-w-2xl text-lg leading-8 ${
                isDarkMode
                  ? "text-slate-300"
                  : "text-slate-600"
              }`}
            >
              Manage your sports operations,
              prioritize urgent work, and keep every
              task moving from To Do all the way to
              Done.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            disabled={
              isLoadingTasks || isSavingTask
            }
            className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700 disabled:opacity-50"
          >
            + Create New Task
          </button>
        </div>
      </section>

      <DashboardStats
        todoTasks={todoTasks}
        urgentTasks={urgentTasks}
        inProgressTasks={inProgressTasks}
        completedTasks={completedTasks}
        isDarkMode={isDarkMode}
      />

      <section className="mt-10">
        {isLoadingTasks ? (
          <div
            className={`rounded-3xl border p-16 text-center shadow-sm ${
              isDarkMode
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent ${
                isDarkMode
                  ? "border-blue-400"
                  : "border-blue-600"
              }`}
            />

            <p
              className={`mt-5 text-lg font-semibold ${
                isDarkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              Loading your tasks...
            </p>
          </div>
        ) : (
          <Board
            tasks={tasks}
            onSelectTask={onSelectTask}
          />
        )}
      </section>
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