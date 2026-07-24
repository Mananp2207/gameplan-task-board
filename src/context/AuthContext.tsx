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

export type UserRole = "member" | "supervisor";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoadingAuth: boolean;
  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

const AuthContext =
  createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function mapProfile(
  profile: ProfileRow,
): UserProfile {
  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [isLoadingAuth, setIsLoadingAuth] =
    useState(true);

  async function loadProfile(userId: string) {
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
      .single();

    if (error) {
      console.error(
        "Unable to load user profile:",
        error.message,
      );

      setProfile(null);
      return;
    }

    setProfile(mapProfile(data as ProfileRow));
  }

  async function refreshProfile() {
    if (!session?.user.id) {
      setProfile(null);
      return;
    }

    await loadProfile(session.user.id);
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(
          "Unable to restore session:",
          error.message,
        );
      }

      setSession(currentSession);

      if (currentSession?.user.id) {
        await loadProfile(
          currentSession.user.id,
        );
      }

      if (isMounted) {
        setIsLoadingAuth(false);
      }
    }

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);

        if (nextSession?.user.id) {
          window.setTimeout(() => {
            void loadProfile(
              nextSession.user.id,
            );
          }, 0);
        } else {
          setProfile(null);
        }

        setIsLoadingAuth(false);
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
  ) {
    const { error } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

    return {
      error: error?.message ?? null,
    };
  }

  async function signIn(
    email: string,
    password: string,
  ) {
    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    return {
      error: error?.message ?? null,
    };
  }

  async function signOut() {
    const { error } =
      await supabase.auth.signOut();

    if (!error) {
      setSession(null);
      setProfile(null);
    }

    return {
      error: error?.message ?? null,
    };
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    isLoadingAuth,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}