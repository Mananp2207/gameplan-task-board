import { supabase } from "../lib/supabase";
import type { Status, Task } from "../types/task";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  is_urgent: boolean;
  status: Status;
  manager_message: string | null;
  created_at: string;
  updated_at: string;
};

type TaskInsert = {
  title: string;
  description: string;
  due_date: string;
  is_urgent: boolean;
  status: Status;
  manager_message: string | null;
};

function convertTaskRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    dueDate: row.due_date,
    isUrgent: row.is_urgent,
    status: row.status,
    managerMessage: row.manager_message ?? undefined,
  };
}

function convertTaskToDatabaseValues(task: Task): TaskInsert {
  return {
    title: task.title,
    description: task.description,
    due_date: task.dueDate,
    is_urgent: task.isUrgent,
    status: task.status,
    manager_message: task.managerMessage ?? null,
  };
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load tasks: ${error.message}`);
  }

  return (data as TaskRow[]).map(convertTaskRowToTask);
}

export async function createTask(task: Task): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert(convertTaskToDatabaseValues(task))
    .select()
    .single();

  if (error) {
    throw new Error(`Unable to create task: ${error.message}`);
  }

  return convertTaskRowToTask(data as TaskRow);
}

export async function updateTask(task: Task): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update(convertTaskToDatabaseValues(task))
    .eq("id", task.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Unable to update task: ${error.message}`);
  }

  return convertTaskRowToTask(data as TaskRow);
}

export async function moveTask(
  taskId: string,
  newStatus: Status,
): Promise<Task> {
  const valuesToUpdate: {
    status: Status;
    manager_message?: null;
  } = {
    status: newStatus,
  };

  if (newStatus === "inprogress") {
    valuesToUpdate.manager_message = null;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(valuesToUpdate)
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    throw new Error(`Unable to move task: ${error.message}`);
  }

  return convertTaskRowToTask(data as TaskRow);
}

export async function returnTask(
  taskId: string,
  managerMessage: string,
): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: "todo",
      manager_message: managerMessage,
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    throw new Error(`Unable to return task: ${error.message}`);
  }

  return convertTaskRowToTask(data as TaskRow);
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    throw new Error(`Unable to delete task: ${error.message}`);
  }
}