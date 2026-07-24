import { Navigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { user, isLoadingAuth } = useAuth();

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

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to access your tasks, deadlines, team assignments, and workflow."
      footerText="Do not have an account?"
      footerLinkText="Create one"
      footerLinkTo="/signup"
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default LoginPage;