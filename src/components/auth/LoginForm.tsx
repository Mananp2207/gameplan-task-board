import {
  type FormEvent,
  useState,
} from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const locationState =
    location.state as LocationState | null;

  const redirectPath =
    locationState?.from?.pathname || "/";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage(
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        "Please enter your password.",
      );
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const result = await signIn(
      normalizedEmail,
      password,
    );

    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(
        formatLoginError(result.error),
      );
      return;
    }

    navigate(redirectPath, {
      replace: true,
    });
  }

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit}
    >
      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          Email address
        </label>

        <div className="relative">
          <Mail
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />

          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="name@example.com"
            disabled={isSubmitting}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="login-password"
            className="block text-sm font-bold text-slate-700"
          >
            Password
          </label>

          <span className="text-xs font-semibold text-slate-400">
            Minimum 6 characters
          </span>
        </div>

        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />

          <input
            id="login-password"
            type={
              showPassword ? "text" : "password"
            }
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            disabled={isSubmitting}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (currentValue) => !currentValue,
              )
            }
            disabled={isSubmitting}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isSubmitting && (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        )}

        {isSubmitting
          ? "Signing in..."
          : "Sign in"}
      </button>
    </form>
  );
}

function formatLoginError(error: string) {
  const normalizedError =
    error.toLowerCase();

  if (
    normalizedError.includes(
      "invalid login credentials",
    )
  ) {
    return "The email address or password is incorrect.";
  }

  if (
    normalizedError.includes(
      "email not confirmed",
    )
  ) {
    return "Please confirm your email address before signing in.";
  }

  return error;
}

export default LoginForm;