export type Status =
  | "todo"
  | "inprogress"
  | "inreview"
  | "done";

export type DeadlineColor =
  | "orange"
  | "yellow"
  | "green";

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  isUrgent: boolean;
  status: Status;
  managerMessage?: string;

  /*
   * The owner of the task and board.
   * RLS compares this with auth.uid().
   */
  userId?: string;

  teamId?: string | null;
  assignedTo?: string | null;
  assignedBy?: string | null;
  createdBy?: string;

  createdAt?: string;
  updatedAt?: string;
};