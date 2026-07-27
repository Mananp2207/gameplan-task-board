import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type UserRole = "member" | "supervisor";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type AuthResult = {
  error: string | null;
};

type AvatarUploadResult = {
  avatarUrl: string | null;
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
  continueAsGuest: () => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
  updateAvatarColor: (avatarColor: string) => Promise<AuthResult>;
  uploadAvatar: (file: File) => Promise<AvatarUploadResult>;
  removeAvatar: () => Promise<AuthResult>;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole | null;
  avatar_color: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

const DEFAULT_AVATAR_COLOR = "#2563eb";
const AVATAR_BUCKET = "Avatars";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function mapProfile(profile: ProfileRow): UserProfile {
  return {
    id: profile.id,
    fullName: normalizeText(profile.full_name),
    email: normalizeText(profile.email),
    role: profile.role === "supervisor" ? "supervisor" : "member",
    avatarColor: normalizeText(profile.avatar_color) || DEFAULT_AVATAR_COLOR,
    avatarUrl: normalizeText(profile.avatar_url) || null,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

function isAnonymousUser(user: User | null | undefined) {
  return user?.is_anonymous === true;
}

function getFileExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();

  if (extensionFromName && ["jpg", "jpeg", "png", "webp"].includes(extensionFromName)) {
    return extensionFromName === "jpeg" ? "jpg" : extensionFromName;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function getStoragePathFromPublicUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          email,
          role,
          avatar_color,
          avatar_url,
          created_at,
          updated_at
        `,
      )
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Unable to load user profile:", error.message);
      setProfile(null);
      return;
    }

    if (!data) {
      setProfile(null);
      return;
    }

    setProfile(mapProfile(data as ProfileRow));
  }

  async function applySession(nextSession: Session | null) {
    setSession(nextSession);

    const nextUser = nextSession?.user ?? null;

    if (!nextUser || isAnonymousUser(nextUser)) {
      setProfile(null);
      return;
    }

    await loadProfile(nextUser.id);
  }

  async function createGuestSession(): Promise<AuthResult> {
    setAuthError(null);

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      const message = `Unable to create a guest session: ${error.message}`;
      setAuthError(message);
      return { error: message };
    }

    await applySession(data.session);
    return { error: null };
  }

  async function refreshProfile() {
    const currentUser = session?.user ?? null;

    if (!currentUser || isAnonymousUser(currentUser)) {
      setProfile(null);
      return;
    }

    await loadProfile(currentUser.id);
  }

  async function updateAvatarColor(avatarColor: string): Promise<AuthResult> {
    const currentUser = session?.user ?? null;

    if (!currentUser || isAnonymousUser(currentUser)) {
      return { error: "Guests cannot update avatars." };
    }

    const cleanedColor = avatarColor.trim();

    if (!/^#[0-9a-fA-F]{6}$/.test(cleanedColor)) {
      return { error: "Please select a valid avatar color." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_color: cleanedColor,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentUser.id);

    if (error) {
      return { error: error.message };
    }

    setProfile((current) =>
      current ? { ...current, avatarColor: cleanedColor } : current,
    );

    return { error: null };
  }

  async function uploadAvatar(file: File): Promise<AvatarUploadResult> {
    const currentUser = session?.user ?? null;

    if (!currentUser || isAnonymousUser(currentUser)) {
      return { avatarUrl: null, error: "Guests cannot upload profile photos." };
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      return {
        avatarUrl: null,
        error: "Please choose a JPG, PNG, or WebP image.",
      };
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return {
        avatarUrl: null,
        error: "Profile photos must be 2 MB or smaller.",
      };
    }

    const oldStoragePath = getStoragePathFromPublicUrl(profile?.avatarUrl);
    const extension = getFileExtension(file);
    const filePath = `${currentUser.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { avatarUrl: null, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);

    const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentUser.id);

    if (profileError) {
      await supabase.storage.from(AVATAR_BUCKET).remove([filePath]);
      return { avatarUrl: null, error: profileError.message };
    }

    setProfile((current) =>
      current ? { ...current, avatarUrl } : current,
    );

    if (oldStoragePath && oldStoragePath !== filePath) {
      void supabase.storage.from(AVATAR_BUCKET).remove([oldStoragePath]);
    }

    return { avatarUrl, error: null };
  }

  async function removeAvatar(): Promise<AuthResult> {
    const currentUser = session?.user ?? null;

    if (!currentUser || isAnonymousUser(currentUser)) {
      return { error: "Guests cannot remove profile photos." };
    }

    const oldStoragePath = getStoragePathFromPublicUrl(profile?.avatarUrl);

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentUser.id);

    if (error) {
      return { error: error.message };
    }

    setProfile((current) =>
      current ? { ...current, avatarUrl: null } : current,
    );

    if (oldStoragePath) {
      void supabase.storage.from(AVATAR_BUCKET).remove([oldStoragePath]);
    }

    return { error: null };
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        setIsLoadingAuth(true);
        setAuthError(null);

        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (error) {
          throw new Error(`Unable to restore the current session: ${error.message}`);
        }

        await applySession(currentSession);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = getErrorMessage(error);
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
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      window.setTimeout(() => {
        if (!isMounted) {
          return;
        }

        void applySession(nextSession).finally(() => {
          if (isMounted) {
            setIsLoadingAuth(false);
          }
        });
      }, 0);
    });

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

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    const message = error?.message ?? null;
    setAuthError(message);
    return { error: message };
  }

  async function signIn(email: string, password: string): Promise<AuthResult> {
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    const message = error?.message ?? null;
    setAuthError(message);
    return { error: message };
  }

  async function signOut(): Promise<AuthResult> {
    setAuthError(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);
      return { error: error.message };
    }

    setSession(null);
    setProfile(null);
    return { error: null };
  }

  async function continueAsGuest(): Promise<AuthResult> {
    if (session?.user && isAnonymousUser(session.user)) {
      return { error: null };
    }

    if (session) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        const message = `Unable to sign out of the current account: ${error.message}`;
        setAuthError(message);
        return { error: message };
      }
    }

    return createGuestSession();
  }

  const currentUser = session?.user ?? null;

  const value: AuthContextValue = {
    session,
    user: currentUser,
    profile,
    isAnonymous: isAnonymousUser(currentUser),
    isLoadingAuth,
    authError,
    signUp,
    signIn,
    signOut,
    continueAsGuest,
    refreshProfile,
    updateAvatarColor,
    uploadAvatar,
    removeAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while loading authentication.";
}