import { Navigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import SignUpForm from "../components/auth/SignUpForm";
import { useAuth } from "../context/AuthContext";

function SignUpPage() {
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
      title="Create your account"
      description="Join your GamePlan workspace and begin managing assigned responsibilities."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <SignUpForm />
    </AuthLayout>
  );
}

export default SignUpPage;