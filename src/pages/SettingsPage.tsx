// import {
//   Bell,
//   Camera,
//   Check,
//   Keyboard,
//   ShieldCheck,
//   Trash2,
//   Upload,
//   UserRound,
// } from "lucide-react";
// import {
//   type ChangeEvent,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import { useAuth } from "../context/AuthContext";

// type SettingsPageProps = {
//   isDarkMode: boolean;
// };

// const avatarColors = [
//   "#2563eb",
//   "#7c3aed",
//   "#db2777",
//   "#dc2626",
//   "#ea580c",
//   "#ca8a04",
//   "#16a34a",
//   "#0891b2",
//   "#475569",
//   "#111827",
// ];

// const MAX_FILE_SIZE = 2 * 1024 * 1024;

// const ALLOWED_IMAGE_TYPES = [
//   "image/jpeg",
//   "image/png",
//   "image/webp",
// ];

// export default function SettingsPage({
//   isDarkMode,
// }: SettingsPageProps) {
//   const {
//     profile,
//     user,
//     isAnonymous,
//     updateAvatarColor,
//     uploadAvatar,
//     removeAvatar,
//   } = useAuth();

//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   const [notificationsEnabled, setNotificationsEnabled] =
//     useState(
//       () =>
//         localStorage.getItem("gameplan-notifications") !==
//         "off",
//     );

//   const [selectedAvatarColor, setSelectedAvatarColor] =
//     useState(profile?.avatarColor || "#2563eb");

//   const [isSavingColor, setIsSavingColor] =
//     useState(false);

//   const [isUploadingPhoto, setIsUploadingPhoto] =
//     useState(false);

//   const [isRemovingPhoto, setIsRemovingPhoto] =
//     useState(false);

//   const [successMessage, setSuccessMessage] = useState<
//     string | null
//   >(null);

//   const [errorMessage, setErrorMessage] = useState<
//     string | null
//   >(null);

//   const canUpdateAvatar =
//   Boolean(user) && !isAnonymous;

//   const displayName =
//     profile?.fullName?.trim() ||
//     user?.email?.split("@")[0] ||
//     "Guest User";

//   const initials = getInitials(displayName);

//   const roleLabel = isAnonymous
//     ? "Guest"
//     : profile?.role === "supervisor"
//       ? "Supervisor"
//       : profile?.role === "member"
//         ? "Member"
//         : "Loading...";

//   useEffect(() => {
//     if (profile?.avatarColor) {
//       setSelectedAvatarColor(profile.avatarColor);
//     }
//   }, [profile?.avatarColor]);

//   function clearMessages() {
//     setSuccessMessage(null);
//     setErrorMessage(null);
//   }

//   function showSuccess(message: string) {
//     setErrorMessage(null);
//     setSuccessMessage(message);

//     window.setTimeout(() => {
//       setSuccessMessage(null);
//     }, 3000);
//   }

//   function toggleNotifications() {
//     setNotificationsEnabled((current) => {
//       const next = !current;

//       localStorage.setItem(
//         "gameplan-notifications",
//         next ? "on" : "off",
//       );

//       return next;
//     });
//   }

//   function handleChoosePhoto() {
//     if (!canUpdateAvatar || isUploadingPhoto) {
//       return;
//     }

//     clearMessages();
//     fileInputRef.current?.click();
//   }

//   async function handlePhotoSelected(
//     event: ChangeEvent<HTMLInputElement>,
//   ) {
//     const file = event.target.files?.[0];

//     event.target.value = "";

//     if (!file) {
//       return;
//     }

//     clearMessages();

//     if (!canUpdateAvatar) {
//       setErrorMessage(
//         "Guest users cannot upload profile photos.",
//       );
//       return;
//     }

//     if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
//       setErrorMessage(
//         "Please choose a JPG, PNG, or WebP image.",
//       );
//       return;
//     }

//     if (file.size > MAX_FILE_SIZE) {
//       setErrorMessage(
//         "Profile photos must be 2 MB or smaller.",
//       );
//       return;
//     }

//     setIsUploadingPhoto(true);

//     try {
//       const result = await uploadAvatar(file);

//       if (result.error) {
//         setErrorMessage(result.error);
//         return;
//       }

//       showSuccess("Profile photo updated successfully.");
//     } catch (error) {
//       setErrorMessage(getErrorMessage(error));
//     } finally {
//       setIsUploadingPhoto(false);
//     }
//   }

//   async function handleRemovePhoto() {
//     if (
//       !canUpdateAvatar ||
//       !profile?.avatarUrl ||
//       isRemovingPhoto
//     ) {
//       return;
//     }

//     clearMessages();
//     setIsRemovingPhoto(true);

//     try {
//       const result = await removeAvatar();

//       if (result.error) {
//         setErrorMessage(result.error);
//         return;
//       }

//       showSuccess("Profile photo removed.");
//     } catch (error) {
//       setErrorMessage(getErrorMessage(error));
//     } finally {
//       setIsRemovingPhoto(false);
//     }
//   }

//   async function handleSaveAvatarColor() {
//     if (!canUpdateAvatar || isSavingColor) {
//       return;
//     }

//     clearMessages();
//     setIsSavingColor(true);

//     try {
//       const result = await updateAvatarColor(
//         selectedAvatarColor,
//       );

//       if (result.error) {
//         setErrorMessage(result.error);
//         return;
//       }

//       showSuccess("Avatar color updated.");
//     } catch (error) {
//       setErrorMessage(getErrorMessage(error));
//     } finally {
//       setIsSavingColor(false);
//     }
//   }

//   const cardClass = `rounded-3xl border p-6 shadow-sm ${
//     isDarkMode
//       ? "border-slate-800 bg-slate-900"
//       : "border-slate-200 bg-white"
//   }`;

//   const headingText = isDarkMode
//     ? "text-white"
//     : "text-slate-900";

//   const mutedText = isDarkMode
//     ? "text-slate-400"
//     : "text-slate-600";

//   return (
//     <div className="mx-auto max-w-5xl space-y-6">
//       <header>
//         <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
//           GamePlan
//         </p>

//         <h1
//           className={`mt-3 text-4xl font-extrabold ${headingText}`}
//         >
//           Settings
//         </h1>

//         <p className={`mt-3 ${mutedText}`}>
//           Review your account, profile, preferences, and
//           permissions.
//         </p>
//       </header>

//       {(successMessage || errorMessage) && (
//         <div
//           role="status"
//           className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
//             errorMessage
//               ? isDarkMode
//                 ? "border-red-900 bg-red-950/50 text-red-300"
//                 : "border-red-200 bg-red-50 text-red-700"
//               : isDarkMode
//                 ? "border-green-900 bg-green-950/50 text-green-300"
//                 : "border-green-200 bg-green-50 text-green-700"
//           }`}
//         >
//           {errorMessage || successMessage}
//         </div>
//       )}

//       <section className={cardClass}>
//         <div className="flex items-start gap-4">
//           <UserRound
//             className="mt-1 shrink-0 text-blue-600"
//             aria-hidden="true"
//           />

//           <div className="min-w-0 flex-1">
//             <h2 className={`text-xl font-bold ${headingText}`}>
//               Profile
//             </h2>

//             <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
//               <div className="relative shrink-0">
//                 <div
//                   className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full text-3xl font-extrabold text-white shadow-md"
//                   style={{
//                     backgroundColor:
//                       profile?.avatarColor ||
//                       selectedAvatarColor,
//                   }}
//                 >
//                   {profile?.avatarUrl ? (
//                     <img
//                       src={profile.avatarUrl}
//                       alt={`${displayName} profile`}
//                       className="h-full w-full object-cover"
//                     />
//                   ) : (
//                     initials
//                   )}
//                 </div>

//                 {canUpdateAvatar && (
//                   <button
//                     type="button"
//                     onClick={handleChoosePhoto}
//                     disabled={isUploadingPhoto}
//                     aria-label="Change profile photo"
//                     className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//                   >
//                     <Camera size={18} aria-hidden="true" />
//                   </button>
//                 )}
//               </div>

//               <dl
//                 className={`grid flex-1 gap-4 text-sm ${mutedText}`}
//               >
//                 <div>
//                   <dt
//                     className={`font-semibold ${headingText}`}
//                   >
//                     Name
//                   </dt>
//                   <dd className="mt-1">{displayName}</dd>
//                 </div>

//                 <div>
//                   <dt
//                     className={`font-semibold ${headingText}`}
//                   >
//                     Email
//                   </dt>
//                   <dd className="mt-1 break-all">
//                     {user?.email ||
//                       profile?.email ||
//                       "Guest session"}
//                   </dd>
//                 </div>

//                 <div>
//                   <dt
//                     className={`font-semibold ${headingText}`}
//                   >
//                     Role
//                   </dt>
//                   <dd className="mt-1">{roleLabel}</dd>
//                 </div>
//               </dl>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className={cardClass}>
//         <div className="flex items-start gap-4">
//           <Upload
//             className="mt-1 shrink-0 text-blue-600"
//             aria-hidden="true"
//           />

//           <div className="min-w-0 flex-1">
//             <h2 className={`text-xl font-bold ${headingText}`}>
//               Profile photo
//             </h2>

//             <p className={`mt-2 text-sm ${mutedText}`}>
//               {canUpdateAvatar
//                 ? "Upload a JPG, PNG, or WebP image up to 2 MB."
//                 : "Guests cannot upload or change profile photos."}
//             </p>

//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/jpeg,image/png,image/webp"
//               onChange={handlePhotoSelected}
//               className="hidden"
//             />

//             <div className="mt-5 flex flex-wrap gap-3">
//               <button
//                 type="button"
//                 onClick={handleChoosePhoto}
//                 disabled={
//                   !canUpdateAvatar || isUploadingPhoto
//                 }
//                 className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 <Upload size={18} aria-hidden="true" />

//                 {isUploadingPhoto
//                   ? "Uploading..."
//                   : profile?.avatarUrl
//                     ? "Change photo"
//                     : "Upload photo"}
//               </button>

//               {profile?.avatarUrl && canUpdateAvatar && (
//                 <button
//                   type="button"
//                   onClick={handleRemovePhoto}
//                   disabled={isRemovingPhoto}
//                   className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
//                     isDarkMode
//                       ? "border-red-900 text-red-300 hover:bg-red-950"
//                       : "border-red-200 text-red-600 hover:bg-red-50"
//                   }`}
//                 >
//                   <Trash2 size={18} aria-hidden="true" />

//                   {isRemovingPhoto
//                     ? "Removing..."
//                     : "Remove photo"}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className={cardClass}>
//         <h2 className={`text-xl font-bold ${headingText}`}>
//           Avatar color
//         </h2>

//         <p className={`mt-2 text-sm ${mutedText}`}>
//           This color is shown behind your initials when no
//           profile photo is available.
//         </p>

//         <div className="mt-6 flex flex-wrap gap-3">
//           {avatarColors.map((color) => {
//             const isSelected =
//               selectedAvatarColor === color;

//             return (
//               <button
//                 key={color}
//                 type="button"
//                 disabled={!canUpdateAvatar}
//                 aria-label={`Select avatar color ${color}`}
//                 aria-pressed={isSelected}
//                 onClick={() =>
//                   setSelectedAvatarColor(color)
//                 }
//                 className={`flex h-12 w-12 items-center justify-center rounded-full border-4 transition ${
//                   isSelected
//                     ? isDarkMode
//                       ? "scale-110 border-white"
//                       : "scale-110 border-slate-900"
//                     : "border-transparent hover:scale-105"
//                 } ${
//                   canUpdateAvatar
//                     ? "cursor-pointer"
//                     : "cursor-not-allowed opacity-40"
//                 }`}
//                 style={{
//                   backgroundColor: color,
//                 }}
//               >
//                 {isSelected && (
//                   <Check
//                     size={21}
//                     className="text-white"
//                     strokeWidth={3}
//                     aria-hidden="true"
//                   />
//                 )}
//               </button>
//             );
//           })}
//         </div>

//         <button
//           type="button"
//           onClick={handleSaveAvatarColor}
//           disabled={
//             !canUpdateAvatar ||
//             isSavingColor ||
//             selectedAvatarColor ===
//               profile?.avatarColor
//           }
//           className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           {isSavingColor
//             ? "Saving..."
//             : "Save avatar color"}
//         </button>
//       </section>

//       <section className={cardClass}>
//         <div className="flex items-center justify-between gap-6">
//           <div className="flex items-start gap-4">
//             <Bell
//               className="mt-1 shrink-0 text-blue-600"
//               aria-hidden="true"
//             />

//             <div>
//               <h2 className={`text-xl font-bold ${headingText}`}>
//                 Notifications
//               </h2>

//               <p className={`mt-1 text-sm ${mutedText}`}>
//                 Store your notification preference on this
//                 device.
//               </p>
//             </div>
//           </div>

//           <button
//             type="button"
//             role="switch"
//             aria-label="Enable or disable notifications"
//             aria-checked={notificationsEnabled}
//             onClick={toggleNotifications}
//             className={`rounded-full px-4 py-2 text-sm font-bold transition ${
//               notificationsEnabled
//                 ? "bg-blue-600 text-white"
//                 : isDarkMode
//                   ? "bg-slate-700 text-slate-200"
//                   : "bg-slate-200 text-slate-700"
//             }`}
//           >
//             {notificationsEnabled
//               ? "Enabled"
//               : "Disabled"}
//           </button>
//         </div>
//       </section>

//       <section className={cardClass}>
//         <div className="flex items-start gap-4">
//           <Keyboard
//             className="mt-1 shrink-0 text-blue-600"
//             aria-hidden="true"
//           />

//           <div>
//             <h2 className={`text-xl font-bold ${headingText}`}>
//               Keyboard shortcuts
//             </h2>

//             <p className={`mt-3 text-sm ${mutedText}`}>
//               <strong>N</strong> creates a task,{" "}
//               <strong>D</strong> changes the theme, and{" "}
//               <strong>Escape</strong> closes an open task
//               window.
//             </p>
//           </div>
//         </div>
//       </section>

//       <section className={cardClass}>
//         <div className="flex items-start gap-4">
//           <ShieldCheck
//             className="mt-1 shrink-0 text-blue-600"
//             aria-hidden="true"
//           />

//           <div>
//             <h2 className={`text-xl font-bold ${headingText}`}>
//               Permissions
//             </h2>

//             <p className={`mt-3 text-sm ${mutedText}`}>
//               Members and supervisors can upload, change, or
//               remove their own profile photo. Guest users
//               cannot update avatars or profile photos.
//             </p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// function getInitials(
//   fullName: string | null | undefined,
// ) {
//   const safeName = fullName?.trim() ?? "";

//   if (!safeName) {
//     return "?";
//   }

//   const words = safeName.split(/\s+/).filter(Boolean);

//   if (words.length === 1) {
//     return words[0].slice(0, 2).toUpperCase();
//   }

//   return `${words[0][0]}${
//     words[words.length - 1][0]
//   }`.toUpperCase();
// }

// function getErrorMessage(error: unknown) {
//   if (error instanceof Error) {
//     return error.message;
//   }

//   return "Something went wrong while updating the profile.";
// }

import {
  Bell,
  Camera,
  Check,
  Keyboard,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import {
  type ChangeEvent,
  useEffect,
  useState,
} from "react";
import { useAuth } from "../context/AuthContext";

type SettingsPageProps = {
  isDarkMode: boolean;
};

const avatarColors = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#475569",
  "#111827",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function SettingsPage({
  isDarkMode,
}: SettingsPageProps) {
  const {
    profile,
    user,
    isAnonymous,
    updateAvatarColor,
    uploadAvatar,
    removeAvatar,
  } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(
      () =>
        localStorage.getItem("gameplan-notifications") !==
        "off",
    );

  const [selectedAvatarColor, setSelectedAvatarColor] =
    useState(profile?.avatarColor || "#2563eb");

  const [isSavingColor, setIsSavingColor] =
    useState(false);

  const [isUploadingPhoto, setIsUploadingPhoto] =
    useState(false);

  const [isRemovingPhoto, setIsRemovingPhoto] =
    useState(false);

  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const canUpdateAvatar =
  Boolean(user) && !isAnonymous;

  const displayName =
    profile?.fullName?.trim() ||
    user?.email?.split("@")[0] ||
    "Guest User";

  const initials = getInitials(displayName);

  const roleLabel = isAnonymous
    ? "Guest"
    : profile?.role === "supervisor"
      ? "Supervisor"
      : profile?.role === "member"
        ? "Member"
        : "Loading...";

  useEffect(() => {
    if (profile?.avatarColor) {
      setSelectedAvatarColor(profile.avatarColor);
    }
  }, [profile?.avatarColor]);

  function clearMessages() {
    setSuccessMessage(null);
    setErrorMessage(null);
  }

  function showSuccess(message: string) {
    setErrorMessage(null);
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  }

  function toggleNotifications() {
    setNotificationsEnabled((current) => {
      const next = !current;

      localStorage.setItem(
        "gameplan-notifications",
        next ? "on" : "off",
      );

      return next;
    });
  }

  async function handlePhotoSelected(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    clearMessages();

    if (!canUpdateAvatar) {
      setErrorMessage(
        "Guest users cannot upload profile photos.",
      );
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage(
        "Please choose a JPG, PNG, or WebP image.",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        "Profile photos must be 2 MB or smaller.",
      );
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const result = await uploadAvatar(file);

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      showSuccess("Profile photo updated successfully.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleRemovePhoto() {
    if (
      !canUpdateAvatar ||
      !profile?.avatarUrl ||
      isRemovingPhoto
    ) {
      return;
    }

    clearMessages();
    setIsRemovingPhoto(true);

    try {
      const result = await removeAvatar();

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      showSuccess("Profile photo removed.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsRemovingPhoto(false);
    }
  }

  async function handleSaveAvatarColor() {
    if (!canUpdateAvatar || isSavingColor) {
      return;
    }

    clearMessages();
    setIsSavingColor(true);

    try {
      const result = await updateAvatarColor(
        selectedAvatarColor,
      );

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      showSuccess("Avatar color updated.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingColor(false);
    }
  }

  const cardClass = `rounded-3xl border p-6 shadow-sm ${
    isDarkMode
      ? "border-slate-800 bg-slate-900"
      : "border-slate-200 bg-white"
  }`;

  const headingText = isDarkMode
    ? "text-white"
    : "text-slate-900";

  const mutedText = isDarkMode
    ? "text-slate-400"
    : "text-slate-600";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
          GamePlan
        </p>

        <h1
          className={`mt-3 text-4xl font-extrabold ${headingText}`}
        >
          Settings
        </h1>

        <p className={`mt-3 ${mutedText}`}>
          Review your account, profile, preferences, and
          permissions.
        </p>
      </header>

      {(successMessage || errorMessage) && (
        <div
          role="status"
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            errorMessage
              ? isDarkMode
                ? "border-red-900 bg-red-950/50 text-red-300"
                : "border-red-200 bg-red-50 text-red-700"
              : isDarkMode
                ? "border-green-900 bg-green-950/50 text-green-300"
                : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {errorMessage || successMessage}
        </div>
      )}

      <input
        id="profile-photo-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoSelected}
        disabled={!canUpdateAvatar || isUploadingPhoto}
        className="sr-only"
      />

      <section className={cardClass}>
        <div className="flex items-start gap-4">
          <UserRound
            className="mt-1 shrink-0 text-blue-600"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <h2 className={`text-xl font-bold ${headingText}`}>
              Profile
            </h2>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div
                  className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full text-3xl font-extrabold text-white shadow-md"
                  style={{
                    backgroundColor:
                      profile?.avatarColor ||
                      selectedAvatarColor,
                  }}
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={`${displayName} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                {canUpdateAvatar && (
                  <label
                    htmlFor="profile-photo-upload"
                    aria-label="Change profile photo"
                    aria-disabled={isUploadingPhoto}
                    className={`absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-md transition ${
                      isUploadingPhoto
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:bg-blue-700"
                    }`}
                  >
                    <Camera size={18} aria-hidden="true" />
                  </label>
                )}
              </div>

              <dl
                className={`grid flex-1 gap-4 text-sm ${mutedText}`}
              >
                <div>
                  <dt
                    className={`font-semibold ${headingText}`}
                  >
                    Name
                  </dt>
                  <dd className="mt-1">{displayName}</dd>
                </div>

                <div>
                  <dt
                    className={`font-semibold ${headingText}`}
                  >
                    Email
                  </dt>
                  <dd className="mt-1 break-all">
                    {user?.email ||
                      profile?.email ||
                      "Guest session"}
                  </dd>
                </div>

                <div>
                  <dt
                    className={`font-semibold ${headingText}`}
                  >
                    Role
                  </dt>
                  <dd className="mt-1">{roleLabel}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-start gap-4">
          <Upload
            className="mt-1 shrink-0 text-blue-600"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <h2 className={`text-xl font-bold ${headingText}`}>
              Profile photo
            </h2>

            <p className={`mt-2 text-sm ${mutedText}`}>
              {canUpdateAvatar
                ? "Upload a JPG, PNG, or WebP image up to 2 MB."
                : "Guests cannot upload or change profile photos."}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <label
                htmlFor="profile-photo-upload"
                aria-disabled={!canUpdateAvatar || isUploadingPhoto}
                className={`inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition ${
                  !canUpdateAvatar || isUploadingPhoto
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-blue-700"
                }`}
              >
                <Upload size={18} aria-hidden="true" />

                {isUploadingPhoto
                  ? "Uploading..."
                  : profile?.avatarUrl
                    ? "Change photo"
                    : "Upload photo"}
              </label>

              {profile?.avatarUrl && canUpdateAvatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isRemovingPhoto}
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isDarkMode
                      ? "border-red-900 text-red-300 hover:bg-red-950"
                      : "border-red-200 text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Trash2 size={18} aria-hidden="true" />

                  {isRemovingPhoto
                    ? "Removing..."
                    : "Remove photo"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className={`text-xl font-bold ${headingText}`}>
          Avatar color
        </h2>

        <p className={`mt-2 text-sm ${mutedText}`}>
          This color is shown behind your initials when no
          profile photo is available.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {avatarColors.map((color) => {
            const isSelected =
              selectedAvatarColor === color;

            return (
              <button
                key={color}
                type="button"
                disabled={!canUpdateAvatar}
                aria-label={`Select avatar color ${color}`}
                aria-pressed={isSelected}
                onClick={() =>
                  setSelectedAvatarColor(color)
                }
                className={`flex h-12 w-12 items-center justify-center rounded-full border-4 transition ${
                  isSelected
                    ? isDarkMode
                      ? "scale-110 border-white"
                      : "scale-110 border-slate-900"
                    : "border-transparent hover:scale-105"
                } ${
                  canUpdateAvatar
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-40"
                }`}
                style={{
                  backgroundColor: color,
                }}
              >
                {isSelected && (
                  <Check
                    size={21}
                    className="text-white"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleSaveAvatarColor}
          disabled={
            !canUpdateAvatar ||
            isSavingColor ||
            selectedAvatarColor ===
              profile?.avatarColor
          }
          className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSavingColor
            ? "Saving..."
            : "Save avatar color"}
        </button>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Bell
              className="mt-1 shrink-0 text-blue-600"
              aria-hidden="true"
            />

            <div>
              <h2 className={`text-xl font-bold ${headingText}`}>
                Notifications
              </h2>

              <p className={`mt-1 text-sm ${mutedText}`}>
                Store your notification preference on this
                device.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-label="Enable or disable notifications"
            aria-checked={notificationsEnabled}
            onClick={toggleNotifications}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              notificationsEnabled
                ? "bg-blue-600 text-white"
                : isDarkMode
                  ? "bg-slate-700 text-slate-200"
                  : "bg-slate-200 text-slate-700"
            }`}
          >
            {notificationsEnabled
              ? "Enabled"
              : "Disabled"}
          </button>
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-start gap-4">
          <Keyboard
            className="mt-1 shrink-0 text-blue-600"
            aria-hidden="true"
          />

          <div>
            <h2 className={`text-xl font-bold ${headingText}`}>
              Keyboard shortcuts
            </h2>

            <p className={`mt-3 text-sm ${mutedText}`}>
              <strong>N</strong> creates a task,{" "}
              <strong>D</strong> changes the theme, and{" "}
              <strong>Escape</strong> closes an open task
              window.
            </p>
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-start gap-4">
          <ShieldCheck
            className="mt-1 shrink-0 text-blue-600"
            aria-hidden="true"
          />

          <div>
            <h2 className={`text-xl font-bold ${headingText}`}>
              Permissions
            </h2>

            <p className={`mt-3 text-sm ${mutedText}`}>
              Members and supervisors can upload, change, or
              remove their own profile photo. Guest users
              cannot update avatars or profile photos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function getInitials(
  fullName: string | null | undefined,
) {
  const safeName = fullName?.trim() ?? "";

  if (!safeName) {
    return "?";
  }

  const words = safeName.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while updating the profile.";
}