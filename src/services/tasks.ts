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

  user_id: string;

  team_id: string | null;
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

  user_id: string;

  team_id: string | null;
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
  team_id: string | null;
  assigned_to: string | null;
};

const TASK_COLUMNS = `
  id,
  title,
  description,
  due_date,
  is_urgent,
  status,
  manager_message,
  user_id,
  team_id,
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

    userId: row.user_id,

    teamId: row.team_id,
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
    team_id: task.teamId ?? null,
    assigned_to:
      task.assignedTo ?? null,
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
      "A valid guest or permanent session is required to manage tasks.",
    );
  }

  return user.id;
}

export async function getTasks(): Promise<
  Task[]
> {
  await getCurrentUserId();

  /*
   * Do not filter here by user_id.
   * Supabase RLS decides whether the current
   * user is the owner or assigned member.
   */
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

export async function getTasksByTeamId(
  teamId: string,
): Promise<Task[]> {
  await getCurrentUserId();

  /*
   * Do not filter by user_id here either.
   * An assignee may not own the task, but
   * RLS should still allow them to read it.
   */
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("team_id", teamId)
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
      `Unable to load team tasks: ${error.message}`,
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

    user_id: currentUserId,

    team_id: task.teamId ?? null,

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
  await getCurrentUserId();

  const values =
    convertTaskToUpdateValues(task);

  /*
   * The query only targets the task ID.
   * RLS determines whether the current user
   * is allowed to update it as owner or assignee.
   */
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
  await getCurrentUserId();

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

  /*
   * Do not add .eq("user_id", currentUserId).
   * The assigned member is not the owner.
   * RLS decides whether the update is allowed.
   */
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
  const currentUserId =
    await getCurrentUserId();

  const cleanedMessage =
    managerMessage.trim();

  if (!cleanedMessage) {
    throw new Error(
      "A return message is required.",
    );
  }

  /*
   * Only the task owner/supervisor can return
   * the task, so this keeps the user_id check.
   */
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status:
        "todo" satisfies DatabaseTaskStatus,
      manager_message: cleanedMessage,
    })
    .eq("id", taskId)
    .eq("user_id", currentUserId)
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
  const currentUserId =
    await getCurrentUserId();

  /*
   * Only the owner/supervisor can delete.
   * An assigned member will not match user_id.
   */
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", currentUserId);

  if (error) {
    throw new Error(
      `Unable to delete task: ${error.message}`,
    );
  }
}