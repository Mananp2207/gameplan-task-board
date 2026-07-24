import { supabase } from "../lib/supabase";
import type {
  Status,
  Task,
} from "../types/task";

type DatabaseTaskStatus =
  | "todo"
  | "in_progress"
  | "in_review"
  | "done";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_urgent: boolean;
  status: DatabaseTaskStatus;
  manager_message: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type TaskInsert = {
  title: string;
  description: string;
  due_date: string;
  is_urgent: boolean;
  status: DatabaseTaskStatus;
  manager_message: string | null;
  assigned_to: string;
  assigned_by: string;
  created_by: string;
};

type TaskUpdate = {
  title: string;
  description: string;
  due_date: string;
  is_urgent: boolean;
  status: DatabaseTaskStatus;
  manager_message: string | null;
};

const TASK_COLUMNS = `
  id,
  title,
  description,
  due_date,
  is_urgent,
  status,
  manager_message,
  assigned_to,
  assigned_by,
  created_by,
  created_at,
  updated_at
`;

function convertStatusToDatabase(
  status: Status,
): DatabaseTaskStatus {
  switch (status) {
    case "inprogress":
      return "in_progress";

    case "inreview":
      return "in_review";

    case "todo":
    case "done":
      return status;
  }
}

function convertStatusFromDatabase(
  status: DatabaseTaskStatus,
): Status {
  switch (status) {
    case "in_progress":
      return "inprogress";

    case "in_review":
      return "inreview";

    case "todo":
    case "done":
      return status;
  }
}

function convertTaskRowToTask(
  row: TaskRow,
): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    dueDate: row.due_date ?? "",
    isUrgent: row.is_urgent,
    status: convertStatusFromDatabase(
      row.status,
    ),
    managerMessage:
      row.manager_message ?? undefined,
    assignedTo: row.assigned_to,
    assignedBy: row.assigned_by,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function convertTaskToUpdateValues(
  task: Task,
): TaskUpdate {
  return {
    title: task.title.trim(),
    description: task.description.trim(),
    due_date: task.dueDate,
    is_urgent: task.isUrgent,
    status: convertStatusToDatabase(
      task.status,
    ),
    manager_message:
      task.managerMessage?.trim() || null,
  };
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(
      `Unable to verify the current user: ${error.message}`,
    );
  }

  if (!user) {
    throw new Error(
      "You must be signed in to manage tasks.",
    );
  }

  return user.id;
}

export async function getTasks(): Promise<
  Task[]
> {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .order("is_urgent", {
      ascending: false,
    })
    .order("due_date", {
      ascending: true,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Unable to load tasks: ${error.message}`,
    );
  }

  return ((data ?? []) as TaskRow[]).map(
    convertTaskRowToTask,
  );
}

export async function createTask(
  task: Task,
): Promise<Task> {
  const currentUserId =
    await getCurrentUserId();

  const values: TaskInsert = {
    title: task.title.trim(),
    description: task.description.trim(),
    due_date: task.dueDate,
    is_urgent: task.isUrgent,
    status: convertStatusToDatabase(
      task.status,
    ),
    manager_message:
      task.managerMessage?.trim() || null,

    // Until the member-assignment interface is added,
    // newly created tasks are assigned to their creator.
    assigned_to:
      task.assignedTo ?? currentUserId,
    assigned_by: currentUserId,
    created_by: currentUserId,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(values)
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    throw new Error(
      `Unable to create task: ${error.message}`,
    );
  }

  return convertTaskRowToTask(
    data as TaskRow,
  );
}

export async function updateTask(
  task: Task,
): Promise<Task> {
  const values =
    convertTaskToUpdateValues(task);

  const { data, error } = await supabase
    .from("tasks")
    .update(values)
    .eq("id", task.id)
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    throw new Error(
      `Unable to update task: ${error.message}`,
    );
  }

  return convertTaskRowToTask(
    data as TaskRow,
  );
}

export async function moveTask(
  taskId: string,
  newStatus: Status,
): Promise<Task> {
  const valuesToUpdate: {
    status: DatabaseTaskStatus;
    manager_message?: null;
  } = {
    status:
      convertStatusToDatabase(newStatus),
  };

  if (
    newStatus === "inprogress" ||
    newStatus === "done"
  ) {
    valuesToUpdate.manager_message = null;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(valuesToUpdate)
    .eq("id", taskId)
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    throw new Error(
      `Unable to move task: ${error.message}`,
    );
  }

  return convertTaskRowToTask(
    data as TaskRow,
  );
}

export async function returnTask(
  taskId: string,
  managerMessage: string,
): Promise<Task> {
  const cleanedMessage =
    managerMessage.trim();

  if (!cleanedMessage) {
    throw new Error(
      "A return message is required.",
    );
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status:
        "todo" satisfies DatabaseTaskStatus,
      manager_message: cleanedMessage,
    })
    .eq("id", taskId)
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    throw new Error(
      `Unable to return task: ${error.message}`,
    );
  }

  return convertTaskRowToTask(
    data as TaskRow,
  );
}

export async function deleteTask(
  taskId: string,
): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    throw new Error(
      `Unable to delete task: ${error.message}`,
    );
  }
}