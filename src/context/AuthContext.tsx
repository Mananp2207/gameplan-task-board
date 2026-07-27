import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  Session,
  User,
} from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type UserRole =
  | "member"
  | "supervisor";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

type AuthResult = {
  error: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAnonymous: boolean;
  isLoadingAuth: boolean;
  authError: string | null;

  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;

  signIn: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;

  signOut: () => Promise<AuthResult>;

  continueAsGuest:
    () => Promise<AuthResult>;

  refreshProfile: () => Promise<void>;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

type AuthProviderProps = {
  children: ReactNode;
};

function mapProfile(
  profile: ProfileRow,
): UserProfile {
  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email ?? "",
    role: profile.role,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

function isAnonymousUser(
  user: User | null | undefined,
) {
  return user?.is_anonymous === true;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [
    isLoadingAuth,
    setIsLoadingAuth,
  ] = useState(true);

  const [authError, setAuthError] =
    useState<string | null>(null);

  async function loadProfile(
    userId: string,
  ) {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          email,
          role,
          created_at,
          updated_at
        `,
      )
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error(
        "Unable to load user profile:",
        error.message,
      );

      setProfile(null);
      return;
    }

    if (!data) {
      setProfile(null);
      return;
    }

    setProfile(
      mapProfile(data as ProfileRow),
    );
  }

  async function applySession(
    nextSession: Session | null,
  ) {
    setSession(nextSession);

    const nextUser =
      nextSession?.user ?? null;

    if (!nextUser) {
      setProfile(null);
      return;
    }

    /*
     * Guest users do not need a permanent
     * application profile loaded into the
     * frontend.
     */
    if (isAnonymousUser(nextUser)) {
      setProfile(null);
      return;
    }

    await loadProfile(nextUser.id);
  }

  async function createGuestSession():
    Promise<AuthResult> {
    setAuthError(null);

    const { data, error } =
      await supabase.auth
        .signInAnonymously();

    if (error) {
      const message =
        `Unable to create a guest session: ${error.message}`;

      setAuthError(message);

      return {
        error: message,
      };
    }

    await applySession(data.session);

    return {
      error: null,
    };
  }

  async function refreshProfile() {
    const currentUser =
      session?.user ?? null;

    if (
      !currentUser ||
      isAnonymousUser(currentUser)
    ) {
      setProfile(null);
      return;
    }

    await loadProfile(currentUser.id);
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        setIsLoadingAuth(true);
        setAuthError(null);

        const {
          data: {
            session: currentSession,
          },
          error,
        } =
          await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (error) {
          throw new Error(
            `Unable to restore the current session: ${error.message}`,
          );
        }

        await applySession(
          currentSession,
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          getErrorMessage(error);

        console.error(message);
        setAuthError(message);
        setSession(null);
        setProfile(null);
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
        }
      }
    }

    void initializeAuth();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!isMounted) {
            return;
          }

          window.setTimeout(() => {
            if (!isMounted) {
              return;
            }

            void applySession(
              nextSession,
            ).finally(() => {
              if (isMounted) {
                setIsLoadingAuth(false);
              }
            });
          }, 0);
        },
      );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(
    fullName: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
    setAuthError(null);

    const { error } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name:
              fullName.trim(),
          },
        },
      });

    const message =
      error?.message ?? null;

    setAuthError(message);

    return {
      error: message,
    };
  }

  async function signIn(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    setAuthError(null);

    const { error } =
      await supabase.auth
        .signInWithPassword({
          email: email.trim(),
          password,
        });

    const message =
      error?.message ?? null;

    setAuthError(message);

    return {
      error: message,
    };
  }

  async function signOut():
    Promise<AuthResult> {
    setAuthError(null);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);

      return {
        error: error.message,
      };
    }

    setSession(null);
    setProfile(null);

    return {
      error: null,
    };
  }

  async function continueAsGuest():
    Promise<AuthResult> {
    /*
     * Reuse the current guest session
     * instead of creating duplicate
     * anonymous accounts.
     */
    if (
      session?.user &&
      isAnonymousUser(session.user)
    ) {
      return {
        error: null,
      };
    }

    /*
     * A signed-in permanent user must be
     * signed out before starting a guest
     * session.
     */
    if (session) {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        const message =
          `Unable to sign out of the current account: ${error.message}`;

        setAuthError(message);

        return {
          error: message,
        };
      }
    }

    return createGuestSession();
  }

  const currentUser =
    session?.user ?? null;

  const value: AuthContextValue = {
    session,
    user: currentUser,
    profile,
    isAnonymous:
      isAnonymousUser(currentUser),
    isLoadingAuth,
    authError,
    signUp,
    signIn,
    signOut,
    continueAsGuest,
    refreshProfile,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}

function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while loading authentication.";
}