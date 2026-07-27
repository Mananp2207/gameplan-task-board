import { Bell, Moon, Search, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type NavbarProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export default function Navbar({
  isDarkMode,
  onToggleTheme,
  searchQuery,
  onSearchChange,
}: NavbarProps) {
  const { profile, user, isAnonymous } = useAuth();

  const displayName = getDisplayName({
    fullName: profile?.fullName,
    email: user?.email ?? profile?.email,
    isAnonymous,
  });

  const roleLabel = isAnonymous
    ? "Guest"
    : profile?.role === "supervisor"
      ? "Supervisor"
      : profile?.role === "member"
        ? "Member"
        : "Loading...";

  const initials = getInitials(displayName);
  const avatarColor = profile?.avatarColor?.trim() || "#2563eb";
  const avatarUrl = isAnonymous ? null : profile?.avatarUrl;

  return (
    <header
      className={`sticky top-0 z-50 flex h-16 items-center justify-between border-b px-4 transition-colors sm:px-6 lg:px-8 ${
        isDarkMode
          ? "border-slate-800 bg-slate-950"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex min-w-0 items-center gap-4 lg:gap-8">
        <h1
          className={`shrink-0 text-xl font-bold tracking-tight sm:text-2xl ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          ⚽ GamePlan
        </h1>

        <div className="relative hidden lg:block">
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className={`w-80 rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-300 focus:border-blue-500 ${
              isDarkMode
                ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
                : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className={`rounded-lg p-2 transition ${
            isDarkMode
              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Bell size={21} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          className={`rounded-lg p-2 transition ${
            isDarkMode
              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {isDarkMode ? (
            <Sun size={21} aria-hidden="true" />
          ) : (
            <Moon size={21} aria-hidden="true" />
          )}
        </button>

        <div
          className={`flex items-center gap-3 rounded-xl px-2 py-2 sm:px-3 ${
            isDarkMode
              ? "bg-slate-900"
              : "border border-slate-200 bg-slate-50"
          }`}
        >
          <div
            title={`${displayName} avatar`}
            aria-label={`${displayName} avatar`}
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full font-extrabold text-white shadow-sm"
            style={{ backgroundColor: avatarColor }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="hidden md:block">
            <p
              className={`max-w-40 truncate text-sm font-semibold ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {displayName}
            </p>

            <p
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {roleLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

type DisplayNameInput = {
  fullName?: string | null;
  email?: string | null;
  isAnonymous: boolean;
};

function getDisplayName({ fullName, email, isAnonymous }: DisplayNameInput) {
  const safeFullName = fullName?.trim() ?? "";

  if (safeFullName) {
    return safeFullName;
  }

  const safeEmail = email?.trim() ?? "";

  if (safeEmail) {
    return safeEmail.split("@")[0] || safeEmail;
  }

  return isAnonymous ? "Guest User" : "GamePlan User";
}

function getInitials(value: string | null | undefined) {
  const safeValue = value?.trim() ?? "";

  if (!safeValue) {
    return "?";
  }

  const words = safeValue.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
