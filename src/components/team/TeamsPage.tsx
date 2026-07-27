import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Check,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createTeam,
  deleteTeam,
  getAvailableProfiles,
  getTeams,
} from "./teams.service";
import type {
  CreateTeamInput,
  Team,
  TeamMemberProfile,
} from "./team.types";

type TeamsPageProps = {
  isDarkMode: boolean;
};

export default function TeamsPage({
  isDarkMode,
}: TeamsPageProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [
    availableProfiles,
    setAvailableProfiles,
  ] = useState<TeamMemberProfile[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const canManageTeams =
    profile?.role === "supervisor";

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [teamsData, profilesData] =
          await Promise.all([
            getTeams(),
            canManageTeams
              ? getAvailableProfiles()
              : Promise.resolve([]),
          ]);

        if (!isMounted) {
          return;
        }

        setTeams(teamsData);
        setAvailableProfiles(
          profilesData,
        );
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

    void loadPage();

    return () => {
      isMounted = false;
    };
  }, [canManageTeams]);

  async function reloadTeams() {
    const teamsData = await getTeams();
    setTeams(teamsData);
  }

  async function handleCreateTeam(
    input: CreateTeamInput,
  ) {
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await createTeam(input);
      await reloadTeams();

      setIsCreateModalOpen(false);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTeam(
    teamId: string,
  ) {
    const confirmed = window.confirm(
      "Delete this team? Team memberships will also be removed.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");

      await deleteTeam(teamId);

      setTeams((currentTeams) =>
        currentTeams.filter(
          (team) => team.id !== teamId,
        ),
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
            Workspace
          </p>

          <h1
            className={`mt-3 text-4xl font-extrabold ${
              isDarkMode
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            Teams
          </h1>

          <p
            className={`mt-3 max-w-2xl ${
              isDarkMode
                ? "text-slate-400"
                : "text-slate-600"
            }`}
          >
            Organize members, assign work,
            and keep team collaboration in one
            shared workspace.
          </p>
        </div>

        {canManageTeams && (
          <button
            type="button"
            onClick={() =>
              setIsCreateModalOpen(true)
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Create team
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <LoadingTeams
          isDarkMode={isDarkMode}
        />
      ) : teams.length === 0 ? (
        <EmptyTeams
          isDarkMode={isDarkMode}
          canManageTeams={canManageTeams}
          onCreate={() =>
            setIsCreateModalOpen(true)
          }
        />
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              isDarkMode={isDarkMode}
              canDelete={
                canManageTeams &&
                team.createdBy ===
                  profile?.id
              }
              onOpen={() =>
                navigate(
                  `/teams/${team.id}`,
                )
              }
              onDelete={() =>
                void handleDeleteTeam(
                  team.id,
                )
              }
            />
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateTeamModal
          profiles={availableProfiles}
          currentUserId={profile?.id ?? ""}
          isDarkMode={isDarkMode}
          isSaving={isSaving}
          onClose={() =>
            setIsCreateModalOpen(false)
          }
          onSubmit={handleCreateTeam}
        />
      )}
    </div>
  );
}

type TeamCardProps = {
  team: Team;
  isDarkMode: boolean;
  canDelete: boolean;
  onOpen: () => void;
  onDelete: () => void;
};

function TeamCard({
  team,
  isDarkMode,
  canDelete,
  onOpen,
  onDelete,
}: TeamCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onOpen();
        }
      }}
      className={`cursor-pointer rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        isDarkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Users size={22} />
          </div>

          <div>
            <h2
              className={`text-xl font-extrabold ${
                isDarkMode
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              {team.name}
            </h2>

            <p
              className={`mt-2 text-sm leading-6 ${
                isDarkMode
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              {team.description ||
                "No team description provided."}
            </p>
          </div>
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            aria-label={`Delete ${team.name}`}
            className={`rounded-xl p-2 transition ${
              isDarkMode
                ? "text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                : "text-slate-400 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              isDarkMode
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            Members
          </p>

          <p
            className={`mt-1 text-2xl font-extrabold ${
              isDarkMode
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            {team.members.length}
          </p>
        </div>

        <div className="flex -space-x-3">
          {team.members
            .slice(0, 5)
            .map((member) => (
              <MemberAvatar
                key={member.userId}
                member={member.profile}
                isDarkMode={isDarkMode}
              />
            ))}

          {team.members.length > 5 && (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold ${
                isDarkMode
                  ? "border-slate-900 bg-slate-700 text-white"
                  : "border-white bg-slate-200 text-slate-700"
              }`}
            >
              +{team.members.length - 5}
            </div>
          )}
        </div>
      </div>

      <div
        className={`mt-6 border-t pt-5 ${
          isDarkMode
            ? "border-slate-800"
            : "border-slate-200"
        }`}
      >
        {team.members.length === 0 ? (
          <p className="text-sm text-slate-500">
            No members have been added.
          </p>
        ) : (
          <div className="space-y-3">
            {team.members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MemberAvatar
                    member={member.profile}
                    isDarkMode={isDarkMode}
                    small
                  />

                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-bold ${
                        isDarkMode
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      {getProfileDisplayName(
                        member.profile,
                      )}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {member.profile.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    member.role ===
                    "supervisor"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {member.role ===
                  "supervisor"
                    ? "Supervisor"
                    : "Member"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

type MemberAvatarProps = {
  member: TeamMemberProfile;
  isDarkMode: boolean;
  small?: boolean;
};

function MemberAvatar({
  member,
  isDarkMode,
  small = false,
}: MemberAvatarProps) {
  const displayName =
    getProfileDisplayName(member);

  const initials =
    getInitials(displayName);

  const sizeClass = small
    ? "h-9 w-9 text-xs"
    : "h-10 w-10 text-sm";

  return (
    <div
      title={displayName}
      style={{
        backgroundColor:
          member.avatarColor ||
          "#2563eb",
      }}
      className={`flex shrink-0 items-center justify-center rounded-full border-2 font-extrabold text-white ${sizeClass} ${
        isDarkMode
          ? "border-slate-900"
          : "border-white"
      }`}
    >
      {initials}
    </div>
  );
}

type EmptyTeamsProps = {
  isDarkMode: boolean;
  canManageTeams: boolean;
  onCreate: () => void;
};

function EmptyTeams({
  isDarkMode,
  canManageTeams,
  onCreate,
}: EmptyTeamsProps) {
  return (
    <div
      className={`mt-8 rounded-3xl border border-dashed p-12 text-center ${
        isDarkMode
          ? "border-slate-700 bg-slate-900/50"
          : "border-slate-300 bg-white"
      }`}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
        <Users size={28} />
      </div>

      <h2
        className={`mt-5 text-2xl font-extrabold ${
          isDarkMode
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        No teams yet
      </h2>

      <p
        className={`mx-auto mt-3 max-w-lg leading-7 ${
          isDarkMode
            ? "text-slate-400"
            : "text-slate-600"
        }`}
      >
        {canManageTeams
          ? "Create your first team and add existing GamePlan users."
          : "You have not been added to a team yet."}
      </p>

      {canManageTeams && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          <Plus size={19} />
          Create first team
        </button>
      )}
    </div>
  );
}

function LoadingTeams({
  isDarkMode,
}: {
  isDarkMode: boolean;
}) {
  return (
    <div
      className={`mt-8 flex min-h-72 items-center justify-center rounded-3xl border ${
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
          Loading teams...
        </p>
      </div>
    </div>
  );
}

type CreateTeamModalProps = {
  profiles: TeamMemberProfile[];
  currentUserId: string;
  isDarkMode: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (
    input: CreateTeamInput,
  ) => Promise<void>;
};

function CreateTeamModal({
  profiles,
  currentUserId,
  isDarkMode,
  isSaving,
  onClose,
  onSubmit,
}: CreateTeamModalProps) {
  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    selectedMemberIds,
    setSelectedMemberIds,
  ] = useState<string[]>([]);

  const [
    validationMessage,
    setValidationMessage,
  ] = useState("");

  const selectableProfiles =
    profiles.filter(
      (availableProfile) =>
        availableProfile.id !==
          currentUserId &&
        availableProfile.email.length > 0,
    );

  function toggleMember(userId: string) {
    setSelectedMemberIds(
      (currentIds) =>
        currentIds.includes(userId)
          ? currentIds.filter(
              (id) => id !== userId,
            )
          : [...currentIds, userId],
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (name.trim().length < 2) {
      setValidationMessage(
        "Team name must contain at least 2 characters.",
      );
      return;
    }

    setValidationMessage("");

    await onSubmit({
      name,
      description,
      memberIds: selectedMemberIds,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-5 backdrop-blur-sm">
      <div
        className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border shadow-2xl ${
          isDarkMode
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`sticky top-0 z-10 flex items-center justify-between border-b px-6 py-5 ${
            isDarkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div>
            <h2
              className={`text-2xl font-extrabold ${
                isDarkMode
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Create team
            </h2>

            <p
              className={`mt-1 text-sm ${
                isDarkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Add existing GamePlan users to
              your new team.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close create team modal"
            className={`rounded-xl p-2 transition ${
              isDarkMode
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {validationMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {validationMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="team-name"
              className={`mb-2 block text-sm font-bold ${
                isDarkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              Team name
            </label>

            <input
              id="team-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Example: Basketball Operations"
              disabled={isSaving}
              className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="team-description"
              className={`mb-2 block text-sm font-bold ${
                isDarkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              Description
            </label>

            <textarea
              id="team-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="What is this team responsible for?"
              rows={3}
              disabled={isSaving}
              className={`w-full resize-none rounded-2xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p
                  className={`text-sm font-bold ${
                    isDarkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  Add members
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  You will automatically be
                  added as the supervisor.
                </p>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {selectedMemberIds.length} selected
              </span>
            </div>

            <div
              className={`max-h-72 space-y-2 overflow-y-auto rounded-2xl border p-3 ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {selectableProfiles.length ===
              0 ? (
                <div className="p-6 text-center">
                  <UserRound className="mx-auto h-9 w-9 text-slate-400" />

                  <p
                    className={`mt-3 text-sm font-semibold ${
                      isDarkMode
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    No other registered users
                    are available.
                  </p>
                </div>
              ) : (
                selectableProfiles.map(
                  (member) => {
                    const isSelected =
                      selectedMemberIds.includes(
                        member.id,
                      );

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() =>
                          toggleMember(
                            member.id,
                          )
                        }
                        disabled={isSaving}
                        className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/10"
                            : isDarkMode
                              ? "border-slate-800 bg-slate-900 hover:border-slate-700"
                              : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            style={{
                              backgroundColor:
                                member.avatarColor ||
                                "#2563eb",
                            }}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
                          >
                            {getInitials(
                              getProfileDisplayName(
                                member,
                              ),
                            )}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm font-bold ${
                                isDarkMode
                                  ? "text-white"
                                  : "text-slate-900"
                              }`}
                            >
                              {getProfileDisplayName(
                                member,
                              )}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : isDarkMode
                                ? "border-slate-600"
                                : "border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <Check size={15} />
                          )}
                        </div>
                      </button>
                    );
                  },
                )
              )}
            </div>
          </div>

          <div
            className={`flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end ${
              isDarkMode
                ? "border-slate-800"
                : "border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className={`rounded-xl px-5 py-3 font-bold transition ${
                isDarkMode
                  ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Creating team...
                </>
              ) : (
                <>
                  <ShieldCheck size={19} />
                  Create team
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getProfileDisplayName(
  member: TeamMemberProfile,
) {
  if (member.fullName) {
    return member.fullName;
  }

  if (member.email) {
    return member.email;
  }

  return "Guest User";
}

function getInitials(
  value: string | null | undefined,
) {
  const safeValue =
    value?.trim() ?? "";

  if (!safeValue) {
    return "?";
  }

  const words = safeValue
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}