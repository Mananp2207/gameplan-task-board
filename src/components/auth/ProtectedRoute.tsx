import type { ReactNode } from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  useAuth,
  type UserRole,
} from "../../context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();

  const {
    user,
    profile,
    isLoadingAuth,
  } = useAuth();

  if (isLoadingAuth) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-white">
            Profile unavailable
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            You are signed in, but your GamePlan profile could
            not be loaded. Please sign out and try again.
          </p>
        </div>
      </main>
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(profile.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

        <p className="mt-5 font-semibold text-slate-300">
          Loading GamePlan...
        </p>
      </div>
    </main>
  );
}

export default ProtectedRoute;