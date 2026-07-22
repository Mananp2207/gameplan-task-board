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
};