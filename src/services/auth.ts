import type {
  Session,
  User,
} from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type AuthResult = {
  error: string | null;
};

export type SessionResult = {
  session: Session | null;
  error: string | null;
};

export type UserResult = {
  user: User | null;
  error: string | null;
};

export async function getCurrentSession(): Promise<SessionResult> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  return {
    session,
    error: error?.message ?? null,
  };
}

export async function getCurrentUser(): Promise<UserResult> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    user,
    error: error?.message ?? null,
  };
}

export async function signInAnonymously(): Promise<SessionResult> {
  const { data, error } =
    await supabase.auth.signInAnonymously();

  return {
    session: data.session,
    error: error?.message ?? null,
  };
}

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const cleanedFullName = fullName.trim();
  const cleanedEmail = email
    .trim()
    .toLowerCase();

  if (!cleanedFullName) {
    return {
      error: "Full name is required.",
    };
  }

  if (!cleanedEmail) {
    return {
      error: "Email is required.",
    };
  }

  if (password.length < 6) {
    return {
      error:
        "Password must contain at least 6 characters.",
    };
  }

  const { error } =
    await supabase.auth.signUp({
      email: cleanedEmail,
      password,
      options: {
        data: {
          full_name: cleanedFullName,
        },
      },
    });

  return {
    error: error?.message ?? null,
  };
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const cleanedEmail = email
    .trim()
    .toLowerCase();

  if (!cleanedEmail) {
    return {
      error: "Email is required.",
    };
  }

  if (!password) {
    return {
      error: "Password is required.",
    };
  }

  const { error } =
    await supabase.auth.signInWithPassword({
      email: cleanedEmail,
      password,
    });

  return {
    error: error?.message ?? null,
  };
}

export async function signOut(): Promise<AuthResult> {
  const { error } =
    await supabase.auth.signOut();

  return {
    error: error?.message ?? null,
  };
}

export function isAnonymousUser(
  user: User | null | undefined,
): boolean {
  return user?.is_anonymous === true;
}