import {
  BarChart3,
  Calendar,
  CheckCircle,
  ClipboardList,
  Eye,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const topMenu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "To Do",
    icon: ClipboardList,
    path: "/tasks/todo",
  },
  {
    title: "In Progress",
    icon: PlayCircle,
    path: "/tasks/inprogress",
  },
  {
    title: "In Review",
    icon: Eye,
    path: "/tasks/inreview",
  },
  {
    title: "Completed",
    icon: CheckCircle,
    path: "/tasks/done",
  },
];

const bottomMenu = [
  {
    title: "Calendar",
    icon: Calendar,
    path: "/calendar",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

function getLinkClass(isActive: boolean) {
  return `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
    isActive
      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const {
    profile,
    user,
    signOut,
  } = useAuth();

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  const [signOutError, setSignOutError] =
    useState("");

  const displayName =
    profile?.fullName?.trim() ||
    user?.email ||
    "GamePlan User";

  const roleLabel =
    profile?.role === "supervisor"
      ? "Supervisor"
      : "Member";

  const RoleIcon =
    profile?.role === "supervisor"
      ? ShieldCheck
      : UserRound;

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setSignOutError("");

    const result = await signOut();

    if (result.error) {
      setSignOutError(result.error);
      setIsSigningOut(false);
      return;
    }

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 p-6">
        <h2 className="text-2xl font-bold text-white">
          ⚽ GamePlan
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Team Operations Platform
        </p>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {topMenu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                getLinkClass(isActive)
              }
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}

        <div className="my-4 border-t border-slate-800" />

        {bottomMenu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                getLinkClass(isActive)
              }
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <RoleIcon size={19} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {displayName}
              </p>

              <p className="text-xs font-semibold text-blue-300">
                {roleLabel}
              </p>
            </div>
          </div>

          {signOutError && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {signOutError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={17} />

            {isSigningOut
              ? "Signing out..."
              : "Sign out"}
          </button>
        </div>
      </div>
    </aside>
  );
}