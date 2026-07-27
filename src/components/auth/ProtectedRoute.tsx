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
    isAnonymous,
    isLoadingAuth,
    authError,
  } = useAuth();

  if (isLoadingAuth) {
    return <AuthLoadingScreen />;
  }

  if (authError && !user) {
    return (
      <AuthErrorScreen
        message={authError}
      />
    );
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

  /*
   * Anonymous users do not need a profile row.
   * They can access the personal guest board.
   */
  if (isAnonymous) {
    if (
      allowedRoles &&
      allowedRoles.length > 0
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

  /*
   * Permanent email/password users should
   * have a profile.
   */
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
            You are signed in, but your
            GamePlan profile could not be
            loaded. Please sign out and try
            again.
          </p>
        </div>
      </main>
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(
      profile.role,
    )
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
          Preparing your GamePlan
          workspace...
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Restoring your session or creating
          a secure guest account.
        </p>
      </div>
    </main>
  );
}

function AuthErrorScreen({
  message,
}: {
  message: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
      <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
          ⚠️
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-white">
          Unable to start GamePlan
        </h1>

        <p className="mt-3 leading-7 text-slate-400">
          {message}
        </p>

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}

export default ProtectedRoute;