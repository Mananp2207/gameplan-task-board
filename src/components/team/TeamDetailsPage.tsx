import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTasksByTeamId } from "../../services/tasks";
import type {
  Status,
  Task,
} from "../../types/task";
import {
  addTeamMember,
  getProfilesNotInTeam,
  getTeamById,
  removeTeamMember,
  updateTeamMemberRole,
} from "./teams.service";
import type {
  Team,
  TeamMember,
  TeamMemberProfile,
  TeamUserRole,
} from "./team.types";

type TeamDetailsPageProps = {
  isDarkMode: boolean;
};

const statusLabels: Record<Status, string> = {
  todo: "To Do",
  inprogress: "In Progress",
  inreview: "In Review",
  done: "Completed",
};

export default function TeamDetailsPage({
  isDarkMode,
}: TeamDetailsPageProps) {
  const { teamId = "" } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [team, setTeam] =
    useState<Team | null>(null);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [
    availableProfiles,
    setAvailableProfiles,
  ] = useState<TeamMemberProfile[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    isAddMemberOpen,
    setIsAddMemberOpen,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const currentMembership =
    team?.members.find(
      (member) =>
        member.userId === user?.id,
    );

  const canManageTeam =
    profile?.role === "supervisor" &&
    Boolean(
      team?.createdBy === user?.id ||
        currentMembership?.role ===
          "supervisor",
    );

  useEffect(() => {
    let isMounted = true;

    async function loadTeamPage() {
      if (!teamId) {
        if (isMounted) {
          setIsLoading(false);
        }

        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const [teamData, taskData] =
          await Promise.all([
            getTeamById(teamId),
            getTasksByTeamId(teamId),
          ]);

        if (!isMounted) {
          return;
        }

        setTeam(teamData);
        setTasks(taskData);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getErrorMessage(error),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTeamPage();

    return () => {
      isMounted = false;
    };
  }, [teamId]);

  const tasksByMember = useMemo(() => {
    const map = new Map<string, Task[]>();

    team?.members.forEach((member) => {
      map.set(member.userId, []);
    });

    tasks.forEach((task) => {
      if (!task.assignedTo) {
        return;
      }

      const existingTasks =
        map.get(task.assignedTo) ?? [];

      map.set(task.assignedTo, [
        ...existingTasks,
        task,
      ]);
    });

    return map;
  }, [team, tasks]);

  async function reloadTeam() {
    if (!teamId) {
      return;
    }

    const [teamData, taskData] =
      await Promise.all([
        getTeamById(teamId),
        getTasksByTeamId(teamId),
      ]);

    setTeam(teamData);
    setTasks(taskData);
  }

  async function openAddMemberModal() {
    if (!teamId || !canManageTeam) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const profiles =
        await getProfilesNotInTeam(
          teamId,
        );

      setAvailableProfiles(profiles);
      setIsAddMemberOpen(true);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddMember(
    userId: string,
    role: TeamUserRole,
  ) {
    if (!teamId || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await addTeamMember({
        teamId,
        userId,
        role,
      });

      await reloadTeam();

      setIsAddMemberOpen(false);
      setAvailableProfiles([]);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveMember(
    member: TeamMember,
  ) {
    if (!teamId || isSaving) {
      return;
    }

    const memberName =
      member.profile.fullName ||
      member.profile.email;

    const confirmed = window.confirm(
      `Remove ${memberName} from this team?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await removeTeamMember(
        teamId,
        member.userId,
      );

      await reloadTeam();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangeRole(
    member: TeamMember,
  ) {
    if (!teamId || isSaving) {
      return;
    }

    const nextRole: TeamUserRole =
      member.role === "supervisor"
        ? "member"
        : "supervisor";

    try {
      setIsSaving(true);
      setErrorMessage("");

      await updateTeamMemberRole({
        teamId,
        userId: member.userId,
        role: nextRole,
      });

      await reloadTeam();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div
        className={`flex min-h-96 items-center justify-center rounded-3xl border ${
          isDarkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="text-center">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-blue-600" />

          <p
            className={`mt-4 font-semibold ${
              isDarkMode
                ? "text-slate-300"
                : "text-slate-600"
            }`}
          >
            Loading team...
          </p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div
        className={`rounded-3xl border p-10 text-center ${
          isDarkMode
            ? "border-slate-800 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-900"
        }`}
      >
        <h1 className="text-2xl font-bold">
          Team not found
        </h1>

        {errorMessage && (
          <p className="mt-3 text-red-500">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={() =>
            navigate("/teams")
          }
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
        >
          Back to Teams
        </button>
      </div>
    );
  }

  const completedTasks = tasks.filter(
    (task) => task.status === "done",
  ).length;

  const activeTasks =
    tasks.length - completedTasks;

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() =>
            navigate("/teams")
          }
          className={`mb-6 inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition ${
            isDarkMode
              ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
              : "bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          }`}
        >
          <ArrowLeft size={18} />
          Back to Teams
        </button>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <section
          className={`rounded-3xl border p-8 shadow-sm ${
            isDarkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
                Team Overview
              </p>

              <h1
                className={`mt-3 text-4xl font-extrabold ${
                  isDarkMode
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                {team.name}
              </h1>

              <p
                className={`mt-4 max-w-3xl leading-7 ${
                  isDarkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                {team.description ||
                  "No team description provided."}
              </p>
            </div>

            {canManageTeam && (
              <button
                type="button"
                onClick={() =>
                  void openAddMemberModal()
                }
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={19} />
                Add Member
              </button>
            )}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Members"
              value={team.members.length}
              icon={<Users size={21} />}
              isDarkMode={isDarkMode}
            />

            <SummaryCard
              label="Active Tasks"
              value={activeTasks}
              icon={
                <ClipboardList size={21} />
              }
              isDarkMode={isDarkMode}
            />

            <SummaryCard
              label="Completed"
              value={completedTasks}
              icon={
                <CheckCircle2 size={21} />
              }
              isDarkMode={isDarkMode}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <h2
              className={`text-2xl font-extrabold ${
                isDarkMode
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Members and Assigned Tasks
            </h2>

            <p
              className={`mt-2 ${
                isDarkMode
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              View each member’s role and
              assigned work.
            </p>
          </div>

          <div className="space-y-5">
            {team.members.map((member) => {
              const memberTasks =
                tasksByMember.get(
                  member.userId,
                ) ?? [];

              const memberActiveTasks =
                memberTasks.filter(
                  (task) =>
                    task.status !== "done",
                );

              const memberCompletedTasks =
                memberTasks.filter(
                  (task) =>
                    task.status === "done",
                );

              return (
                <article
                  key={member.userId}
                  className={`rounded-3xl border p-6 shadow-sm ${
                    isDarkMode
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 font-extrabold text-white">
                        {getInitials(
                          member.profile
                            .fullName ||
                            member.profile.email,
                        )}
                      </div>

                      <div>
                        <h3
                          className={`text-lg font-extrabold ${
                            isDarkMode
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          {member.profile
                            .fullName ||
                            member.profile
                              .email}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            member.profile
                              .email
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                          member.role ===
                          "supervisor"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {member.role ===
                        "supervisor" ? (
                          <ShieldCheck
                            size={14}
                          />
                        ) : (
                          <UserRound
                            size={14}
                          />
                        )}

                        {member.role ===
                        "supervisor"
                          ? "Supervisor"
                          : "Member"}
                      </span>

                      {canManageTeam &&
                        member.userId !==
                          user?.id && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                void handleChangeRole(
                                  member,
                                )
                              }
                              disabled={isSaving}
                              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                                isDarkMode
                                  ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              Change Role
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleRemoveMember(
                                  member,
                                )
                              }
                              disabled={isSaving}
                              className="rounded-xl p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Remove ${
                                member.profile
                                  .fullName ||
                                member.profile
                                  .email
                              }`}
                            >
                              <Trash2
                                size={18}
                              />
                            </button>
                          </>
                        )}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div
                      className={`rounded-2xl p-4 ${
                        isDarkMode
                          ? "bg-slate-800"
                          : "bg-slate-50"
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Active Tasks
                      </p>

                      <p
                        className={`mt-2 text-2xl font-extrabold ${
                          isDarkMode
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        {
                          memberActiveTasks.length
                        }
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl p-4 ${
                        isDarkMode
                          ? "bg-slate-800"
                          : "bg-slate-50"
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Completed Tasks
                      </p>

                      <p
                        className={`mt-2 text-2xl font-extrabold ${
                          isDarkMode
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        {
                          memberCompletedTasks.length
                        }
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-5 border-t pt-5 ${
                      isDarkMode
                        ? "border-slate-800"
                        : "border-slate-200"
                    }`}
                  >
                    <h4
                      className={`font-bold ${
                        isDarkMode
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      Assigned Tasks
                    </h4>

                    {memberTasks.length ===
                    0 ? (
                      <p className="mt-3 text-sm text-slate-500">
                        No tasks are currently
                        assigned to this member.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {memberTasks.map(
                          (task) => (
                            <div
                              key={task.id}
                              className={`flex flex-col justify-between gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center ${
                                isDarkMode
                                  ? "border-slate-700 bg-slate-800"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <div>
                                <p
                                  className={`font-bold ${
                                    isDarkMode
                                      ? "text-white"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {task.title}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  Due{" "}
                                  {formatDueDate(
                                    task.dueDate,
                                  )}
                                </p>
                              </div>

                              <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                {
                                  statusLabels[
                                    task.status
                                  ]
                                }
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {isAddMemberOpen && (
        <AddMemberModal
          profiles={availableProfiles}
          isDarkMode={isDarkMode}
          isSaving={isSaving}
          onClose={() => {
            if (!isSaving) {
              setIsAddMemberOpen(false);
            }
          }}
          onAddMember={handleAddMember}
        />
      )}
    </>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  isDarkMode: boolean;
};

function SummaryCard({
  label,
  value,
  icon,
  isDarkMode,
}: SummaryCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        isDarkMode
          ? "border-slate-700 bg-slate-800"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2 text-blue-600">
        {icon}

        <p className="text-sm font-bold">
          {label}
        </p>
      </div>

      <p
        className={`mt-3 text-3xl font-extrabold ${
          isDarkMode
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type AddMemberModalProps = {
  profiles: TeamMemberProfile[];
  isDarkMode: boolean;
  isSaving: boolean;
  onClose: () => void;
  onAddMember: (
    userId: string,
    role: TeamUserRole,
  ) => Promise<void>;
};

function AddMemberModal({
  profiles,
  isDarkMode,
  isSaving,
  onClose,
  onAddMember,
}: AddMemberModalProps) {
  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState("");

  const [role, setRole] =
    useState<TeamUserRole>("member");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedUserId) {
      return;
    }

    await onAddMember(
      selectedUserId,
      role,
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl ${
          isDarkMode
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between">
          <div>
            <h2
              className={`text-2xl font-extrabold ${
                isDarkMode
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Add Team Member
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select a registered user and
              choose their team role.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={`rounded-xl p-2 transition ${
              isDarkMode
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="new-team-member"
              className={`mb-2 block text-sm font-bold ${
                isDarkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              User
            </label>

            <select
              id="new-team-member"
              value={selectedUserId}
              onChange={(event) =>
                setSelectedUserId(
                  event.target.value,
                )
              }
              disabled={isSaving}
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              <option value="">
                Select a user
              </option>

              {profiles.map(
                (memberProfile) => (
                  <option
                    key={memberProfile.id}
                    value={memberProfile.id}
                  >
                    {memberProfile.fullName ||
                      memberProfile.email}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="new-member-role"
              className={`mb-2 block text-sm font-bold ${
                isDarkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              Team role
            </label>

            <select
              id="new-member-role"
              value={role}
              onChange={(event) =>
                setRole(
                  event.target
                    .value as TeamUserRole,
                )
              }
              disabled={isSaving}
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              <option value="member">
                Member
              </option>

              <option value="supervisor">
                Supervisor
              </option>
            </select>
          </div>

          {profiles.length === 0 && (
            <p
              className={`rounded-xl px-4 py-3 text-sm ${
                isDarkMode
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Every registered user is already
              part of this team.
            </p>
          )}

          <div
            className={`flex justify-end gap-3 border-t pt-5 ${
              isDarkMode
                ? "border-slate-800"
                : "border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className={`rounded-xl px-5 py-3 font-bold ${
                isDarkMode
                  ? "bg-slate-800 text-slate-200"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSaving ||
                !selectedUserId
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving && (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              )}

              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getInitials(value: string) {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function formatDueDate(value: string) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(`${value}T00:00:00`),
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}