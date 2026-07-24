import {
  Bell,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
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
  const { profile, user } = useAuth();

  const displayName =
    profile?.fullName?.trim() ||
    user?.email ||
    "GamePlan User";

  const roleLabel =
    profile?.role === "supervisor"
      ? "Supervisor"
      : "Member";

  return (
    <header
      className={`sticky top-0 z-50 flex h-16 items-center justify-between border-b px-8 transition-colors ${
        isDarkMode
          ? "border-slate-800 bg-slate-950"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-8">
        <h1
          className={`text-2xl font-bold tracking-tight ${
            isDarkMode
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          ⚽ GamePlan
        </h1>

        <div className="relative hidden lg:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search tasks..."
            className={`w-80 rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-300 focus:border-blue-500 ${
              isDarkMode
                ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
                : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className={`rounded-lg p-2 transition ${
            isDarkMode
              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Bell size={21} />
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={
            isDarkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className={`rounded-lg p-2 transition ${
            isDarkMode
              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {isDarkMode ? (
            <Sun size={21} />
          ) : (
            <Moon size={21} />
          )}
        </button>

        <div
          className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
            isDarkMode
              ? "bg-slate-900"
              : "border border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600">
            <User
              size={17}
              className="text-white"
            />
          </div>

          <div className="hidden md:block">
            <p
              className={`max-w-40 truncate text-sm font-semibold ${
                isDarkMode
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              {displayName}
            </p>

            <p
              className={`text-xs ${
                isDarkMode
                  ? "text-slate-400"
                  : "text-slate-500"
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