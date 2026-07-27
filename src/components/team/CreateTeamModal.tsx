import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Check,
  LoaderCircle,
  Search,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createTeam,
  getAvailableProfiles,
} from "./teams.service";
import type {
  TeamMemberProfile,
} from "./team.types";
import { useAuth } from "../../context/AuthContext";

type CreateTeamModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void | Promise<void>;
};

export default function CreateTeamModal({
  isOpen,
  onClose,
  onTeamCreated,
}: CreateTeamModalProps) {
  const { user, profile } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [searchQuery, setSearchQuery] =
    useState("");
  const [profiles, setProfiles] = useState<
    TeamMemberProfile[]
  >([]);
  const [selectedMemberIds, setSelectedMemberIds] =
    useState<string[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    async function loadProfiles() {
      setIsLoadingProfiles(true);

      try {
        const availableProfiles =
          await getAvailableProfiles();

        if (!isMounted) {
          return;
        }

        setProfiles(
          availableProfiles.filter(
            (availableProfile) =>
              availableProfile.id !== user?.id,
          ),
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load available members.";

        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoadingProfiles(false);
        }
      }
    }

    void loadProfiles();

    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    resetForm();
  }, [isOpen]);

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    if (!normalizedQuery) {
      return profiles;
    }

    return profiles.filter((availableProfile) => {
      return (
        availableProfile.fullName
          .toLowerCase()
          .includes(normalizedQuery) ||
        availableProfile.email
          .toLowerCase()
          .includes(normalizedQuery) ||
        availableProfile.role
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [profiles, searchQuery]);

  function resetForm() {
    setName("");
    setDescription("");
    setSearchQuery("");
    setSelectedMemberIds([]);
    setProfiles([]);
    setIsSubmitting(false);
    setIsLoadingProfiles(false);
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  }

  function toggleMember(userId: string) {
    setSelectedMemberIds((currentMemberIds) => {
      if (currentMemberIds.includes(userId)) {
        return currentMemberIds.filter(
          (memberId) => memberId !== userId,
        );
      }

      return [...currentMemberIds, userId];
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedName = name.trim();

    if (cleanedName.length < 2) {
      toast.error(
        "Team name must contain at least 2 characters.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createTeam({
        name: cleanedName,
        description: description.trim(),
        memberIds: selectedMemberIds,
      });

      toast.success("Team created successfully.");

      await onTeamCreated();

      resetForm();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create the team.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-team-title"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div>
            <h2
              id="create-team-title"
              className="text-xl font-bold text-slate-900 dark:text-white"
            >
              Create a new team
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create a workspace and choose the people
              who should be part of it.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close create team modal"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div>
              <label
                htmlFor="team-name"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Team name
              </label>

              <input
                id="team-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                }}
                placeholder="Example: Product Development"
                maxLength={80}
                disabled={isSubmitting}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

              <p className="mt-2 text-xs text-slate-400">
                {name.length}/80 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="team-description"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Description
              </label>

              <textarea
                id="team-description"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                }}
                placeholder="Describe the purpose of this team."
                rows={4}
                maxLength={300}
                disabled={isSubmitting}
                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

              <p className="mt-2 text-xs text-slate-400">
                {description.length}/300 characters
              </p>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Add members
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    You will automatically be added as
                    the team creator.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {selectedMemberIds.length} selected
                </span>
              </div>

              <div className="relative mb-3">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                  }}
                  placeholder="Search members by name or email"
                  disabled={
                    isSubmitting || isLoadingProfiles
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                {isLoadingProfiles ? (
                  <div className="flex min-h-40 items-center justify-center gap-3 px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
                    <LoaderCircle
                      size={20}
                      className="animate-spin"
                    />
                    Loading available members...
                  </div>
                ) : filteredProfiles.length === 0 ? (
                  <div className="flex min-h-40 flex-col items-center justify-center px-4 py-8 text-center">
                    <Users
                      size={28}
                      className="mb-3 text-slate-400"
                    />

                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      No members found
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Other registered users will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 divide-y divide-slate-200 overflow-y-auto dark:divide-slate-700">
                    {filteredProfiles.map(
                      (availableProfile) => {
                        const isSelected =
                          selectedMemberIds.includes(
                            availableProfile.id,
                          );

                        return (
                          <button
                            key={availableProfile.id}
                            type="button"
                            onClick={() => {
                              toggleMember(
                                availableProfile.id,
                              );
                            }}
                            disabled={isSubmitting}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-slate-800"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                              {availableProfile.fullName
                                .trim()
                                .charAt(0)
                                .toUpperCase() || "U"}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                {
                                  availableProfile.fullName
                                }
                              </p>

                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {availableProfile.email}
                              </p>
                            </div>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {availableProfile.role}
                            </span>

                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-900"
                              }`}
                            >
                              <Check size={15} />
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
              Signed in as{" "}
              <span className="font-semibold">
                {profile?.fullName ??
                  user?.email ??
                  "current user"}
              </span>
              . You will automatically be included in the
              team.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting || name.trim().length < 2
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              )}

              {isSubmitting
                ? "Creating team..."
                : "Create team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}