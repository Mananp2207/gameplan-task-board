import { useState } from "react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();

  const {
    user,
    isLoadingAuth,
    continueAsGuest,
  } = useAuth();

  const [
    isStartingGuestSession,
    setIsStartingGuestSession,
  ] = useState(false);

  const [
    guestError,
    setGuestError,
  ] = useState<string | null>(null);

  if (isLoadingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
      </main>
    );
  }

  if (user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  async function handleContinueAsGuest() {
    try {
      setIsStartingGuestSession(true);
      setGuestError(null);

      const result =
        await continueAsGuest();

      if (result.error) {
        setGuestError(result.error);
        return;
      }

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      setGuestError(
        error instanceof Error
          ? error.message
          : "Unable to start a guest session.",
      );
    } finally {
      setIsStartingGuestSession(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to access your tasks, deadlines, team assignments, and workflow."
      footerText="Do not have an account?"
      footerLinkText="Create one"
      footerLinkTo="/signup"
    >
      <div className="space-y-5">
        <LoginForm />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Or
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {guestError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {guestError}
          </div>
        )}

        <button
          type="button"
          onClick={handleContinueAsGuest}
          disabled={isStartingGuestSession}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3.5 font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStartingGuestSession ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />
              Preparing guest workspace...
            </>
          ) : (
            <>
              <span aria-hidden="true">
                👤
              </span>
              Continue as Guest
            </>
          )}
        </button>

        <p className="text-center text-xs leading-5 text-slate-500">
          Guest tasks are stored securely
          in your anonymous session and are
          not shared with other guests.
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;