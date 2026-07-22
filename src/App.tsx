import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import useTasks from "./hooks/useTasks";
import Dashboard from "./pages/Dashboard";
import TaskStatusPage from "./pages/TaskStatusPage";
import type { Task } from "./types/task";

const THEME_STORAGE_KEY = "gameplan-theme";

function App() {
  const {
    tasks,
    selectedTask,
    isCreateModalOpen,
    isLoadingTasks,
    isSavingTask,
    canReview,
    setSelectedTask,
    setIsCreateModalOpen,
    handleCreateTask,
    handleMoveTask,
    handleReturnTask,
    handleUpdateTask,
    handleDeleteTask,
  } = useTasks();

  const [searchQuery, setSearchQuery] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(
      THEME_STORAGE_KEY,
    );

    if (savedTheme === "dark") {
      return true;
    }

    if (savedTheme === "light") {
      return false;
    }

    return window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
  });

  useEffect(() => {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      isDarkMode ? "dark" : "light",
    );

    document.documentElement.style.colorScheme =
      isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  useEffect(() => {
    function handleKeyboardShortcut(
      event: KeyboardEvent,
    ) {
      const activeElement = document.activeElement;

      const isTyping =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if (event.key === "Escape") {
        setIsCreateModalOpen(false);
        setSelectedTask(null);
        return;
      }

      if (isTyping) {
        return;
      }

      if (event.key.toLowerCase() === "d") {
        setIsDarkMode(
          (currentMode) => !currentMode,
        );
      }

      if (
        event.key.toLowerCase() === "n" &&
        !isLoadingTasks &&
        !isSavingTask
      ) {
        setSelectedTask(null);
        setIsCreateModalOpen(true);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyboardShortcut,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboardShortcut,
      );
    };
  }, [
    isLoadingTasks,
    isSavingTask,
    setIsCreateModalOpen,
    setSelectedTask,
  ]);

  const normalizedSearch = searchQuery
    .trim()
    .toLowerCase();

  const filteredTasks = tasks.filter((task) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      task.title
        .toLowerCase()
        .includes(normalizedSearch) ||
      task.description
        .toLowerCase()
        .includes(normalizedSearch) ||
      (task.managerMessage ?? "")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  });

  const todoTasks = filteredTasks.filter(
    (task) => task.status === "todo",
  ).length;

  const urgentTasks = filteredTasks.filter(
    (task) => task.isUrgent,
  ).length;

  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "inprogress",
  ).length;

  const completedTasks = filteredTasks.filter(
    (task) => task.status === "done",
  ).length;

  return (
    <BrowserRouter>
      <Layout
        isDarkMode={isDarkMode}
        onToggleTheme={() =>
          setIsDarkMode(
            (currentMode) => !currentMode,
          )
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                tasks={tasks}
                isDarkMode={isDarkMode}
              />
            }
          />

          <Route
            path="/tasks"
            element={
              <Dashboard
                tasks={filteredTasks}
                selectedTask={selectedTask}
                isCreateModalOpen={isCreateModalOpen}
                isLoadingTasks={isLoadingTasks}
                isSavingTask={isSavingTask}
                isDarkMode={isDarkMode}
                canReview={canReview}
                todoTasks={todoTasks}
                urgentTasks={urgentTasks}
                inProgressTasks={inProgressTasks}
                completedTasks={completedTasks}
                onSelectTask={setSelectedTask}
                onOpenCreateModal={() =>
                  setIsCreateModalOpen(true)
                }
                onCloseCreateModal={() =>
                  setIsCreateModalOpen(false)
                }
                onCreateTask={handleCreateTask}
                onMoveTask={handleMoveTask}
                onReturnTask={handleReturnTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            }
          />

          <Route
            path="/tasks/:status"
            element={
              <TaskStatusPage
                tasks={filteredTasks}
                selectedTask={selectedTask}
                isCreateModalOpen={isCreateModalOpen}
                isLoadingTasks={isLoadingTasks}
                isSavingTask={isSavingTask}
                isDarkMode={isDarkMode}
                canReview={canReview}
                onSelectTask={setSelectedTask}
                onOpenCreateModal={() =>
                  setIsCreateModalOpen(true)
                }
                onCloseCreateModal={() =>
                  setIsCreateModalOpen(false)
                }
                onCreateTask={handleCreateTask}
                onMoveTask={handleMoveTask}
                onReturnTask={handleReturnTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            }
          />

          <Route
            path="/calendar"
            element={
              <CalendarPage
                tasks={filteredTasks}
                isDarkMode={isDarkMode}
              />
            }
          />

          <Route
            path="/analytics"
            element={
              <ComingSoonPage
                title="Analytics"
                description="Task performance, completion rates, overdue work, and team productivity will appear here."
                isDarkMode={isDarkMode}
              />
            }
          />

          <Route
            path="/settings"
            element={
              <ComingSoonPage
                title="Settings"
                description="Workspace, profile, notification, and application settings will appear here."
                isDarkMode={isDarkMode}
              />
            }
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

type PageThemeProps = {
  isDarkMode: boolean;
};

type HomePageProps = PageThemeProps & {
  tasks: Task[];
};

function HomePage({
  tasks,
  isDarkMode,
}: HomePageProps) {
  const activeTasks = tasks.filter(
    (task) => task.status !== "done",
  ).length;

  const urgentTasks = tasks.filter(
    (task) => task.isUrgent,
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section
        className={`rounded-3xl border p-8 shadow-sm ${
          isDarkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
      >
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
          GamePlan
        </p>

        <h1
          className={`mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl ${
            isDarkMode
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          Sports operations, organized.
        </h1>

        <p
          className={`mt-5 max-w-3xl text-lg leading-8 ${
            isDarkMode
              ? "text-slate-300"
              : "text-slate-600"
          }`}
        >
          GamePlan helps sports organizations manage
          operational tasks, deadlines, urgent work,
          reviews, and completed responsibilities from
          one centralized platform.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <InfoCard
          title="Your role"
          description="Coordinate team operations, assign responsibilities, review work, and keep deadlines visible."
          icon="👤"
          isDarkMode={isDarkMode}
        />

        <InfoCard
          title="The organization"
          description="Sports staff can use GamePlan to coordinate game preparation, media, equipment, and administrative work."
          icon="🏟️"
          isDarkMode={isDarkMode}
        />

        <InfoCard
          title="The application"
          description="Create tasks, track progress, review submissions, view due dates, and identify urgent work."
          icon="⚽"
          isDarkMode={isDarkMode}
        />
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <SummaryCard
          label="Active tasks"
          value={activeTasks}
          isDarkMode={isDarkMode}
        />

        <SummaryCard
          label="Urgent tasks"
          value={urgentTasks}
          isDarkMode={isDarkMode}
        />
      </section>
    </div>
  );
}

type CalendarPageProps = PageThemeProps & {
  tasks: Task[];
};

function CalendarPage({
  tasks,
  isDarkMode,
}: CalendarPageProps) {
  const sortedTasks = [...tasks].sort(
    (firstTask, secondTask) =>
      new Date(firstTask.dueDate).getTime() -
      new Date(secondTask.dueDate).getTime(),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
          Schedule
        </p>

        <h1
          className={`mt-3 text-4xl font-extrabold ${
            isDarkMode
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          Calendar
        </h1>

        <p
          className={`mt-3 ${
            isDarkMode
              ? "text-slate-400"
              : "text-slate-600"
          }`}
        >
          View your tasks in due-date order.
        </p>
      </div>

      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <article
            key={task.id}
            className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center ${
              isDarkMode
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className={`text-lg font-bold ${
                    isDarkMode
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  {task.title}
                </h2>

                {task.isUrgent && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    Urgent
                  </span>
                )}
              </div>

              <p
                className={`mt-2 text-sm ${
                  isDarkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                {task.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-blue-50 px-4 py-3 text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                Due
              </p>

              <p className="mt-1 font-bold text-blue-900">
                {formatDueDate(task.dueDate)}
              </p>
            </div>
          </article>
        ))}

        {tasks.length === 0 && (
          <div
            className={`rounded-2xl border border-dashed p-12 text-center ${
              isDarkMode
                ? "border-slate-700 text-slate-400"
                : "border-slate-300 text-slate-500"
            }`}
          >
            No tasks are currently scheduled.
          </div>
        )}
      </div>
    </div>
  );
}

type InfoCardProps = PageThemeProps & {
  title: string;
  description: string;
  icon: string;
};

function InfoCard({
  title,
  description,
  icon,
  isDarkMode,
}: InfoCardProps) {
  return (
    <article
      className={`rounded-2xl border p-6 shadow-sm ${
        isDarkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="text-3xl">{icon}</div>

      <h2
        className={`mt-4 text-xl font-bold ${
          isDarkMode
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {title}
      </h2>

      <p
        className={`mt-3 leading-7 ${
          isDarkMode
            ? "text-slate-400"
            : "text-slate-600"
        }`}
      >
        {description}
      </p>
    </article>
  );
}

type SummaryCardProps = PageThemeProps & {
  label: string;
  value: number;
};

function SummaryCard({
  label,
  value,
  isDarkMode,
}: SummaryCardProps) {
  return (
    <article
      className={`rounded-2xl border p-6 ${
        isDarkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          isDarkMode
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-4xl font-extrabold ${
          isDarkMode
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </article>
  );
}

type ComingSoonPageProps = PageThemeProps & {
  title: string;
  description: string;
};

function ComingSoonPage({
  title,
  description,
  isDarkMode,
}: ComingSoonPageProps) {
  return (
    <div
      className={`mx-auto max-w-4xl rounded-3xl border p-10 shadow-sm ${
        isDarkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
        GamePlan
      </p>

      <h1
        className={`mt-4 text-4xl font-extrabold ${
          isDarkMode
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {title}
      </h1>

      <p
        className={`mt-4 text-lg leading-8 ${
          isDarkMode
            ? "text-slate-400"
            : "text-slate-600"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function formatDueDate(dueDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dueDate}T00:00:00`));
}

export default App;