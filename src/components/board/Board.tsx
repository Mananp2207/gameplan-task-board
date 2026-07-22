import type { DeadlineColor, Task } from "../../types/task";
import Column from "./Column";

type BoardProps = {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
};

function getDeadlineColors(tasks: Task[]) {
  const activeTasks = tasks
    .filter((task) => task.status !== "done")
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() -
        new Date(b.dueDate).getTime(),
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

export default function Board({
  tasks,
  onSelectTask,
}: BoardProps) {
  const deadlineColors = getDeadlineColors(tasks);

  return (
    <section className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Task Board
          </h2>

          <p className="mt-1 text-slate-500">
            Drag, manage and complete your work.
          </p>
        </div>

        <div className="rounded-2xl bg-white px-5 py-3 shadow-sm">
          <span className="text-sm font-semibold text-slate-500">
            Total Tasks
          </span>

          <p className="text-3xl font-extrabold text-slate-900">
            {tasks.length}
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-4">
        <Column
          title="To Do"
          status="todo"
          tasks={tasks}
          deadlineColors={deadlineColors}
          onSelectTask={onSelectTask}
        />

        <Column
          title="In Progress"
          status="inprogress"
          tasks={tasks}
          deadlineColors={deadlineColors}
          onSelectTask={onSelectTask}
        />

        <Column
          title="In Review"
          status="inreview"
          tasks={tasks}
          deadlineColors={deadlineColors}
          onSelectTask={onSelectTask}
        />

        <Column
          title="Completed"
          status="done"
          tasks={tasks}
          deadlineColors={deadlineColors}
          onSelectTask={onSelectTask}
        />
      </div>
    </section>
  );
}