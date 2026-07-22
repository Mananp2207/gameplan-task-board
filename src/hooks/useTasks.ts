import { useEffect, useState } from "react";
import {
  createTask as createTaskInDatabase,
  deleteTask as deleteTaskFromDatabase,
  getTasks,
  moveTask as moveTaskInDatabase,
  returnTask as returnTaskInDatabase,
  updateTask as updateTaskInDatabase,
} from "../services/tasks";
import type { Status, Task } from "../types/task";

export default function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    null,
  );

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [isLoadingTasks, setIsLoadingTasks] =
    useState(true);

  const [isSavingTask, setIsSavingTask] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const canReview = true;

  useEffect(() => {
    let mounted = true;

    async function loadTasks() {
      try {
        setIsLoadingTasks(true);

        const data = await getTasks();

        if (mounted) {
          setTasks(data);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setIsLoadingTasks(false);
        }
      }
    }

    void loadTasks();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleCreateTask(newTask: Task) {
    if (isSavingTask) {
      return;
    }

    setIsSavingTask(true);
    try {
      const createdTask =
        await createTaskInDatabase(newTask);

      setTasks((current) => [...current, createdTask]);

      setIsCreateModalOpen(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingTask(false);
    }
  }

  async function handleMoveTask(
    taskId: string,
    newStatus: Status,
  ) {
    if (isSavingTask) {
      return;
    }

    setIsSavingTask(true);

    try {
      const movedTask = await moveTaskInDatabase(
        taskId,
        newStatus,
      );

      replaceTask(movedTask);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingTask(false);
    }
  }

  async function handleReturnTask(
    taskId: string,
    managerMessage: string,
  ) {
    if (isSavingTask) {
      return;
    }

    setIsSavingTask(true);

    try {
      const task = await returnTaskInDatabase(
        taskId,
        managerMessage,
      );

      replaceTask(task);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingTask(false);
    }
  }

  async function handleUpdateTask(updatedTask: Task) {
    if (isSavingTask) {
      return;
    }

    setIsSavingTask(true);

    try {
      const savedTask =
        await updateTaskInDatabase(updatedTask);

      replaceTask(savedTask);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingTask(false);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (isSavingTask) {
      return;
    }

    setIsSavingTask(true);

    try {
      await deleteTaskFromDatabase(taskId);

      setTasks((current) =>
        current.filter((task) => task.id !== taskId),
      );

      setSelectedTask(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingTask(false);
    }
  }

  function replaceTask(updatedTask: Task) {
    setTasks((current) =>
      current.map((task) =>
        task.id === updatedTask.id
          ? updatedTask
          : task,
      ),
    );

    setSelectedTask((current) =>
      current?.id === updatedTask.id
        ? updatedTask
        : current,
    );
  }

  async function retryLoadingTasks() {
    try {
      setIsLoadingTasks(true);

      const data = await getTasks();

      setTasks(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoadingTasks(false);
    }
  }

  return {
    tasks,
    selectedTask,
    isCreateModalOpen,
    isLoadingTasks,
    isSavingTask,
    errorMessage,
    canReview,

    setSelectedTask,
    setIsCreateModalOpen,

    handleCreateTask,
    handleMoveTask,
    handleReturnTask,
    handleUpdateTask,
    handleDeleteTask,
    retryLoadingTasks,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}