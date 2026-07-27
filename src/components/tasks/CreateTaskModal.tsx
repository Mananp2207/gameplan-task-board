import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  LoaderCircle,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getTeams } from "../team/teams.service";
import type { Team } from "../team/team.types";
import type { Task } from "../../types/task";

type CreateTaskModalProps = {
  isOpen: boolean;
  isDarkMode: boolean;
  isSaving: boolean;
  onClose: () => void;
  onCreateTask: (task: Task) => Promise<void>;
};

export default function CreateTaskModal({
  isOpen,
  isDarkMode,
  isSaving,
  onClose,
  onCreateTask,
}: CreateTaskModalProps) {
  const { user, profile } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [dueDate, setDueDate] =
    useState("");
  const [isUrgent, setIsUrgent] =
    useState(false);

  const [teams, setTeams] = useState<
    Team[]
  >([]);

  const [selectedTeamId, setSelectedTeamId] =
    useState("");

  const [
    selectedMemberId,
    setSelectedMemberId,
  ] = useState("");

  const [
    isLoadingTeams,
    setIsLoadingTeams,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const canCreateTask =
    profile?.role === "supervisor";

  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }

    let isMounted = true;

    async function loadAvailableTeams() {
      try {
        setIsLoadingTeams(true);
        setErrorMessage("");

        const loadedTeams = await getTeams();

        if (!isMounted) {
          return;
        }

        const manageableTeams =
          loadedTeams.filter((team) => {
            const isCreator =
              team.createdBy === user.id;

            const isTeamSupervisor =
              team.members.some(
                (member) =>
                  member.userId === user.id &&
                  member.role === "supervisor",
              );

            return (
              isCreator || isTeamSupervisor
            );
          });

        setTeams(manageableTeams);

        if (manageableTeams.length === 1) {
          setSelectedTeamId(
            manageableTeams[0].id,
          );
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getErrorMessage(error),
        );
      } finally {
        if (isMounted) {
          setIsLoadingTeams(false);
        }
      }
    }

    void loadAvailableTeams();

    return () => {
      isMounted = false;
    };
  }, [isOpen, user]);

  const selectedTeam = useMemo(
    () =>
      teams.find(
        (team) =>
          team.id === selectedTeamId,
      ) ?? null,
    [selectedTeamId, teams],
  );

  useEffect(() => {
    setSelectedMemberId("");
  }, [selectedTeamId]);

  if (!isOpen) {
    return null;
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setDueDate("");
    setIsUrgent(false);
    setSelectedTeamId("");
    setSelectedMemberId("");
    setTeams([]);
    setErrorMessage("");
  }

  function handleClose() {
    if (isSaving) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription =
      description.trim();

    if (!canCreateTask) {
      setErrorMessage(
        "Only supervisors can create and assign tasks.",
      );
      return;
    }

    if (!trimmedTitle) {
      setErrorMessage(
        "Please enter a task title.",
      );
      return;
    }

    if (!selectedTeamId) {
      setErrorMessage(
        "Please select a team.",
      );
      return;
    }

    if (!selectedMemberId) {
      setErrorMessage(
        "Please select a team member.",
      );
      return;
    }

    if (!dueDate) {
      setErrorMessage(
        "Please select a due date.",
      );
      return;
    }

    setErrorMessage("");

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: trimmedDescription,
      dueDate,
      isUrgent,
      status: "todo",
      teamId: selectedTeamId,
      assignedTo: selectedMemberId,
    };

    try {
      await onCreateTask(newTask);

      resetForm();
      onClose();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={handleClose}
    >
      <div
        className={`max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border shadow-2xl ${
          isDarkMode
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div
          className={`sticky top-0 z-10 flex items-start justify-between border-b px-6 py-5 ${
            isDarkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
              GamePlan
            </p>

            <h2
              className={`mt-2 text-2xl font-extrabold ${
                isDarkMode
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Create and assign task
            </h2>

            <p
              className={`mt-2 text-sm ${
                isDarkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Select a team and assign the
              task to one of its members.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close create task form"
            className={`rounded-xl p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isDarkMode
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <X size={21} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="task-team"
                className={`mb-2 block text-sm font-bold ${
                  isDarkMode
                    ? "text-slate-200"
                    : "text-slate-700"
                }`}
              >
                Team
              </label>

              <select
                id="task-team"
                value={selectedTeamId}
                onChange={(event) =>
                  setSelectedTeamId(
                    event.target.value,
                  )
                }
                disabled={
                  isSaving || isLoadingTeams
                }
                required
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-900"
                }`}
              >
                <option value="">
                  {isLoadingTeams
                    ? "Loading teams..."
                    : "Select a team"}
                </option>

                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))}
              </select>

              {!isLoadingTeams &&
                teams.length === 0 && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    Create a team before assigning
                    tasks.
                  </p>
                )}
            </div>

            <div>
              <label
                htmlFor="task-member"
                className={`mb-2 block text-sm font-bold ${
                  isDarkMode
                    ? "text-slate-200"
                    : "text-slate-700"
                }`}
              >
                Assign to
              </label>

              <select
                id="task-member"
                value={selectedMemberId}
                onChange={(event) =>
                  setSelectedMemberId(
                    event.target.value,
                  )
                }
                disabled={
                  isSaving || !selectedTeam
                }
                required
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-900"
                }`}
              >
                <option value="">
                  {selectedTeam
                    ? "Select a member"
                    : "Select a team first"}
                </option>

                {selectedTeam?.members.map(
                  (member) => (
                    <option
                      key={member.userId}
                      value={member.userId}
                    >
                      {member.profile.fullName ||
                        member.profile.email}{" "}
                      —{" "}
                      {member.role ===
                      "supervisor"
                        ? "Supervisor"
                        : "Member"}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {selectedTeam && (
            <div
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                isDarkMode
                  ? "border-blue-500/20 bg-blue-500/10 text-blue-200"
                  : "border-blue-100 bg-blue-50 text-blue-800"
              }`}
            >
              <Users size={20} />

              <div>
                <p className="text-sm font-bold">
                  {selectedTeam.name}
                </p>

                <p className="text-xs opacity-80">
                  {selectedTeam.members.length}{" "}
                  {selectedTeam.members.length ===
                  1
                    ? "member"
                    : "members"}{" "}
                  available
                </p>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="task-title"
              className={`mb-2 block text-sm font-bold ${
                isDarkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              Task title
            </label>

            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter task title"
              required
              autoFocus
              disabled={isSaving}
              maxLength={120}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className={`mb-2 block text-sm font-bold ${
                isDarkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              Description
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Describe the task"
              rows={4}
              disabled={isSaving}
              maxLength={1000}
              className={`w-full resize-none rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="task-due-date"
              className={`mb-2 block text-sm font-bold ${
                isDarkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              Due date
            </label>

            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              required
              disabled={isSaving}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            />

            <p
              className={`mt-2 text-xs leading-5 ${
                isDarkMode
                  ? "text-slate-500"
                  : "text-slate-500"
              }`}
            >
              GamePlan automatically assigns
              deadline colors based on due-date
              order.
            </p>
          </div>

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${
              isDarkMode
                ? "border-red-500/20 bg-red-500/10"
                : "border-red-200 bg-red-50"
            }`}
          >
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(event) =>
                setIsUrgent(
                  event.target.checked,
                )
              }
              disabled={isSaving}
              className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500"
            />

            <span>
              <span
                className={`block font-bold ${
                  isDarkMode
                    ? "text-red-300"
                    : "text-red-700"
                }`}
              >
                ❗ Mark as urgent
              </span>

              <span
                className={`mt-1 block text-sm ${
                  isDarkMode
                    ? "text-red-400"
                    : "text-red-600"
                }`}
              >
                Urgent tasks appear above
                non-urgent tasks.
              </span>
            </span>
          </label>

          <div
            className={`flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end ${
              isDarkMode
                ? "border-slate-800"
                : "border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className={`rounded-xl px-5 py-3 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isDarkMode
                  ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSaving ||
                isLoadingTeams ||
                teams.length === 0
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Creating task...
                </>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}