// import {
//   useCallback,
//   useEffect,
//   useState,
// } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   createTask as createTaskInDatabase,
//   deleteTask as deleteTaskFromDatabase,
//   getTasks,
//   moveTask as moveTaskInDatabase,
//   returnTask as returnTaskInDatabase,
//   updateTask as updateTaskInDatabase,
// } from "../services/tasks";
// import type {
//   Status,
//   Task,
// } from "../types/task";

// export default function useTasks() {
//   const { user, profile } = useAuth();

//   const [tasks, setTasks] = useState<
//     Task[]
//   >([]);

//   const [
//     selectedTask,
//     setSelectedTask,
//   ] = useState<Task | null>(null);

//   const [
//     isCreateModalOpen,
//     setIsCreateModalOpen,
//   ] = useState(false);

//   const [
//     isLoadingTasks,
//     setIsLoadingTasks,
//   ] = useState(true);

//   const [
//     isSavingTask,
//     setIsSavingTask,
//   ] = useState(false);

//   const [
//     errorMessage,
//     setErrorMessage,
//   ] = useState<string | null>(null);

//   const canReview =
//     profile?.role === "supervisor";

//   const loadTasks = useCallback(
//     async () => {
//       if (!user) {
//         setTasks([]);
//         setIsLoadingTasks(false);
//         return;
//       }

//       try {
//         setIsLoadingTasks(true);
//         setErrorMessage(null);

//         const data = await getTasks();

//         setTasks(data);
//       } catch (error) {
//         setErrorMessage(
//           getErrorMessage(error),
//         );
//       } finally {
//         setIsLoadingTasks(false);
//       }
//     },
//     [user],
//   );

//   useEffect(() => {
//     let isMounted = true;

//     async function initializeTasks() {
//       if (!user) {
//         if (isMounted) {
//           setTasks([]);
//           setIsLoadingTasks(false);
//         }

//         return;
//       }

//       try {
//         if (isMounted) {
//           setIsLoadingTasks(true);
//           setErrorMessage(null);
//         }

//         const data = await getTasks();

//         if (isMounted) {
//           setTasks(data);
//         }
//       } catch (error) {
//         if (isMounted) {
//           setErrorMessage(
//             getErrorMessage(error),
//           );
//         }
//       } finally {
//         if (isMounted) {
//           setIsLoadingTasks(false);
//         }
//       }
//     }

//     void initializeTasks();

//     return () => {
//       isMounted = false;
//     };
//   }, [user]);

//   async function handleCreateTask(
//     newTask: Task,
//   ): Promise<void> {
//     if (isSavingTask) {
//       return;
//     }

//     setIsSavingTask(true);
//     setErrorMessage(null);

//     try {
//       const createdTask =
//         await createTaskInDatabase(
//           newTask,
//         );

//       setTasks((currentTasks) => [
//         ...currentTasks,
//         createdTask,
//       ]);

//       setIsCreateModalOpen(false);
//     } catch (error) {
//       const message =
//         getErrorMessage(error);

//       setErrorMessage(message);

//       throw new Error(message);
//     } finally {
//       setIsSavingTask(false);
//     }
//   }

//   async function handleMoveTask(
//     taskId: string,
//     newStatus: Status,
//   ) {
//     if (isSavingTask) {
//       return;
//     }

//     setIsSavingTask(true);
//     setErrorMessage(null);

//     try {
//       const movedTask =
//         await moveTaskInDatabase(
//           taskId,
//           newStatus,
//         );

//       replaceTask(movedTask);
//     } catch (error) {
//       setErrorMessage(
//         getErrorMessage(error),
//       );
//     } finally {
//       setIsSavingTask(false);
//     }
//   }

//   async function handleReturnTask(
//     taskId: string,
//     managerMessage: string,
//   ) {
//     if (isSavingTask || !canReview) {
//       return;
//     }

//     setIsSavingTask(true);
//     setErrorMessage(null);

//     try {
//       const returnedTask =
//         await returnTaskInDatabase(
//           taskId,
//           managerMessage,
//         );

//       replaceTask(returnedTask);
//     } catch (error) {
//       setErrorMessage(
//         getErrorMessage(error),
//       );
//     } finally {
//       setIsSavingTask(false);
//     }
//   }

//   async function handleUpdateTask(
//     updatedTask: Task,
//   ) {
//     if (isSavingTask) {
//       return;
//     }

//     setIsSavingTask(true);
//     setErrorMessage(null);

//     try {
//       const savedTask =
//         await updateTaskInDatabase(
//           updatedTask,
//         );

//       replaceTask(savedTask);
//     } catch (error) {
//       setErrorMessage(
//         getErrorMessage(error),
//       );
//     } finally {
//       setIsSavingTask(false);
//     }
//   }

//   async function handleDeleteTask(
//     taskId: string,
//   ) {
//     if (isSavingTask) {
//       return;
//     }

//     setIsSavingTask(true);
//     setErrorMessage(null);

//     try {
//       await deleteTaskFromDatabase(
//         taskId,
//       );

//       setTasks((currentTasks) =>
//         currentTasks.filter(
//           (task) => task.id !== taskId,
//         ),
//       );

//       setSelectedTask(null);
//     } catch (error) {
//       setErrorMessage(
//         getErrorMessage(error),
//       );
//     } finally {
//       setIsSavingTask(false);
//     }
//   }

//   function replaceTask(
//     updatedTask: Task,
//   ) {
//     setTasks((currentTasks) =>
//       currentTasks.map((task) =>
//         task.id === updatedTask.id
//           ? updatedTask
//           : task,
//       ),
//     );

//     setSelectedTask((currentTask) =>
//       currentTask?.id === updatedTask.id
//         ? updatedTask
//         : currentTask,
//     );
//   }

//   async function retryLoadingTasks() {
//     await loadTasks();
//   }

//   return {
//     tasks,
//     selectedTask,
//     isCreateModalOpen,
//     isLoadingTasks,
//     isSavingTask,
//     errorMessage,
//     canReview,

//     setSelectedTask,
//     setIsCreateModalOpen,

//     handleCreateTask,
//     handleMoveTask,
//     handleReturnTask,
//     handleUpdateTask,
//     handleDeleteTask,
//     retryLoadingTasks,
//   };
// }

// function getErrorMessage(
//   error: unknown,
// ) {
//   if (error instanceof Error) {
//     return error.message;
//   }

//   return "Something went wrong.";
// }
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useAuth } from "../context/AuthContext";
import {
  createTask as createTaskInDatabase,
  deleteTask as deleteTaskFromDatabase,
  getTasks,
  moveTask as moveTaskInDatabase,
  returnTask as returnTaskInDatabase,
  updateTask as updateTaskInDatabase,
} from "../services/tasks";
import type {
  Status,
  Task,
} from "../types/task";

export default function useTasks() {
  const {
    user,
    profile,
    isAnonymous,
  } = useAuth();

  const [tasks, setTasks] = useState<
    Task[]
  >([]);

  const [
    selectedTask,
    setSelectedTask,
  ] = useState<Task | null>(null);

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false);

  const [
    isLoadingTasks,
    setIsLoadingTasks,
  ] = useState(true);

  const [
    isSavingTask,
    setIsSavingTask,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  /*
   * Supervisors can review team tasks.
   * Guests receive full demo permissions
   * for their own private tasks.
   */
  const canReview =
    isAnonymous ||
    profile?.role === "supervisor";

  const loadTasks = useCallback(
    async () => {
      if (!user) {
        setTasks([]);
        setIsLoadingTasks(false);
        return;
      }

      try {
        setIsLoadingTasks(true);
        setErrorMessage(null);

        const data = await getTasks();

        setTasks(data);
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error),
        );
      } finally {
        setIsLoadingTasks(false);
      }
    },
    [user],
  );

  useEffect(() => {
    let isMounted = true;

    async function initializeTasks() {
      if (!user) {
        if (isMounted) {
          setTasks([]);
          setIsLoadingTasks(false);
        }

        return;
      }

      try {
        if (isMounted) {
          setIsLoadingTasks(true);
          setErrorMessage(null);
        }

        const data = await getTasks();

        if (isMounted) {
          setTasks(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getErrorMessage(error),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingTasks(false);
        }
      }
    }

    void initializeTasks();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function handleCreateTask(
    newTask: Task,
  ): Promise<void> {
    if (isSavingTask || !user) {
      return;
    }

    setIsSavingTask(true);
    setErrorMessage(null);

    try {
      const createdTask =
        await createTaskInDatabase(
          newTask,
        );

      setTasks((currentTasks) => [
        ...currentTasks,
        createdTask,
      ]);

      setIsCreateModalOpen(false);
    } catch (error) {
      const message =
        getErrorMessage(error);

      setErrorMessage(message);

      throw new Error(message);
    } finally {
      setIsSavingTask(false);
    }
  }

  async function handleMoveTask(
    taskId: string,
    newStatus: Status,
  ) {
    if (isSavingTask || !user) {
      return;
    }

    setIsSavingTask(true);
    setErrorMessage(null);

    try {
      const movedTask =
        await moveTaskInDatabase(
          taskId,
          newStatus,
        );

      replaceTask(movedTask);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSavingTask(false);
    }
  }

  async function handleReturnTask(
    taskId: string,
    managerMessage: string,
  ) {
    if (
      isSavingTask ||
      !user ||
      !canReview
    ) {
      return;
    }

    setIsSavingTask(true);
    setErrorMessage(null);

    try {
      const returnedTask =
        await returnTaskInDatabase(
          taskId,
          managerMessage,
        );

      replaceTask(returnedTask);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSavingTask(false);
    }
  }

  async function handleUpdateTask(
    updatedTask: Task,
  ) {
    if (isSavingTask || !user) {
      return;
    }

    setIsSavingTask(true);
    setErrorMessage(null);

    try {
      const savedTask =
        await updateTaskInDatabase(
          updatedTask,
        );

      replaceTask(savedTask);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSavingTask(false);
    }
  }

  async function handleDeleteTask(
    taskId: string,
  ) {
    if (isSavingTask || !user) {
      return;
    }

    setIsSavingTask(true);
    setErrorMessage(null);

    try {
      await deleteTaskFromDatabase(
        taskId,
      );

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== taskId,
        ),
      );

      setSelectedTask(null);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSavingTask(false);
    }
  }

  function replaceTask(
    updatedTask: Task,
  ) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id
          ? updatedTask
          : task,
      ),
    );

    setSelectedTask((currentTask) =>
      currentTask?.id === updatedTask.id
        ? updatedTask
        : currentTask,
    );
  }

  async function retryLoadingTasks() {
    await loadTasks();
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

function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}
