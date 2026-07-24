import {
  type FormEvent,
  useState,
} from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function SignUpForm() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] =
    useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();

    if (normalizedName.length < 2) {
      setErrorMessage(
        "Please enter your full name.",
      );
      return;
    }

    if (!normalizedEmail) {
      setErrorMessage(
        "Please enter your email address.",
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        "Your password must contain at least 6 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "The passwords do not match.",
      );
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const result = await signUp(
      normalizedName,
      normalizedEmail,
      password,
    );

    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(
        formatSignUpError(result.error),
      );
      return;
    }

    setSuccessMessage(
      "Your account was created. Check your email for a confirmation link, then sign in.",
    );

    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    window.setTimeout(() => {
      navigate("/login", {
        replace: true,
        state: {
          accountCreated: true,
        },
      });
    }, 2500);
  }

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit}
    >
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
        New accounts are created as{" "}
        <span className="font-bold">
          members
        </span>
        . A supervisor can promote approved users later.
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <span>{successMessage}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="signup-name"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          Full name
        </label>

        <div className="relative">
          <UserRound
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />

          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
            placeholder="Your full name"
            disabled={isSubmitting}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="signup-email"
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
            id="signup-email"
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

      <PasswordField
        id="signup-password"
        label="Password"
        value={password}
        onChange={setPassword}
        showPassword={showPassword}
        onTogglePassword={() =>
          setShowPassword(
            (currentValue) => !currentValue,
          )
        }
        autoComplete="new-password"
        placeholder="Create a password"
        disabled={isSubmitting}
      />

      <PasswordField
        id="signup-confirm-password"
        label="Confirm password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        showPassword={showConfirmPassword}
        onTogglePassword={() =>
          setShowConfirmPassword(
            (currentValue) => !currentValue,
          )
        }
        autoComplete="new-password"
        placeholder="Enter your password again"
        disabled={isSubmitting}
      />

      <button
        type="submit"
        disabled={
          isSubmitting || Boolean(successMessage)
        }
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isSubmitting && (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        )}

        {isSubmitting
          ? "Creating account..."
          : "Create account"}
      </button>
    </form>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  autoComplete: string;
  placeholder: string;
  disabled: boolean;
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  autoComplete,
  placeholder,
  disabled,
}: PasswordFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <label
          htmlFor={id}
          className="block text-sm font-bold text-slate-700"
        >
          {label}
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
          id={id}
          type={
            showPassword ? "text" : "password"
          }
          autoComplete={autoComplete}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        <button
          type="button"
          onClick={onTogglePassword}
          disabled={disabled}
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
  );
}

function formatSignUpError(error: string) {
  const normalizedError =
    error.toLowerCase();

  if (
    normalizedError.includes(
      "user already registered",
    )
  ) {
    return "An account with this email address already exists.";
  }

  if (
    normalizedError.includes(
      "password should be at least",
    )
  ) {
    return "Your password must contain at least 6 characters.";
  }

  return error;
}

export default SignUpForm;