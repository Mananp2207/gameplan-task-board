import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  description: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
};

function AuthLayout({
  children,
  title,
  description,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-blue-700 shadow-lg">
                G
              </div>

              <div>
                <p className="text-xl font-extrabold">
                  GamePlan
                </p>

                <p className="text-sm text-blue-100">
                  Team task management
                </p>
              </div>
            </Link>
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-200">
              Plan. Assign. Deliver.
            </p>

            <h1 className="mt-6 text-5xl font-black leading-tight">
              Keep every member of your team moving in the
              same direction.
            </h1>

            <p className="mt-6 text-lg leading-8 text-blue-100">
              Manage responsibilities, deadlines, urgent work,
              reviews, and completed tasks from one organized
              workspace.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <FeatureStat
                value="4"
                label="Workflow stages"
              />

              <FeatureStat
                value="2"
                label="User roles"
              />

              <FeatureStat
                value="1"
                label="Shared workspace"
              />
            </div>
          </div>

          <p className="relative z-10 text-sm text-blue-200">
            Built for supervisors and team members.
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
                  G
                </div>

                <div>
                  <p className="font-extrabold text-slate-900">
                    GamePlan
                  </p>

                  <p className="text-xs text-slate-500">
                    Team task management
                  </p>
                </div>
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
                  GamePlan
                </p>

                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                  {title}
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {description}
                </p>
              </div>

              <div className="mt-8">
                {children}
              </div>

              <p className="mt-8 text-center text-sm text-slate-600">
                {footerText}{" "}
                <Link
                  to={footerLinkTo}
                  className="font-bold text-blue-600 transition hover:text-blue-700"
                >
                  {footerLinkText}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type FeatureStatProps = {
  value: string;
  label: string;
};

function FeatureStat({
  value,
  label,
}: FeatureStatProps) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-sm text-blue-100">
        {label}
      </p>
    </div>
  );
}

export default AuthLayout;