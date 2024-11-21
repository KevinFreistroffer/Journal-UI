"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AvatarUpload from "@/components/ui/AvatarUpload/AvatarUpload";
import ChangePassword from "@/components/ui/ChangePassword";
import { Settings, UserCog, KeyRound, Bell, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import Sidebar from "@/components/ui/Sidebar/Sidebar";
import DashboardContainer from "@/components/ui/__layout__/DashboardContainer/DashboardContainer";
import Link from "next/link";
import ChangeUsernameModal from "../components/ChangeUsernameModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Image from "next/image";
import { useNotification } from "@/context/NotificationContext";
import { IUser } from "@/lib/interfaces";
import { isValidUser } from "@/lib/utils";

const SubmitButton = ({ isFormDirty }: { isFormDirty: boolean }) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || !isFormDirty}
      className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save Profile"}
    </button>
  );
};

const ProfilePage = () => {
  const { showSuccess, showError } = useNotification();
  const [avatarFileId, setAvatarFileId] = useState<string | null>(null);
  const { user, isLoading, setUser } = useAuth();
  const isMobileView = useMediaQuery("(max-width: 767px)");

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    company: "",
    location: "",
    website: "",
    sex: "",
  });

  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isChangeUsernameModalOpen, setIsChangeUsernameModalOpen] =
    useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      console.log("user = ", user.avatar);
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        company: user.company || "",
        location: user.location || "",
        website: user.website || "",
        sex: user.sex || "",
      });
      setIsFormDirty(false);
    }
  }, [user]);

  const handleSaveAvatar = async (avatar: {
    data: string;
    contentType: string;
  }) => {
    console.log("avatar = ", avatar);
    try {
      const response = await fetch("/api/user/avatar/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar, userId: user?._id }),
      });

      if (!response.ok) {
        showError(`Failed to update avatar: ${response.statusText}`);
      } else {
        const result = await response.json();
        console.log("result = ", result);
        setAvatarFileId(result.fileId);
        if (user && avatar && avatar.contentType) {
          setUser({
            ...user,
            avatar: {
              ...user.avatar,
              data: avatar.data,
              contentType: avatar.contentType,
              fileId: result.fileId,
            },
          });
        }

        showSuccess("Avatar updated successfully");
      }
    } catch (error) {
      showError(`Error updating avatar: ${error}`);
    }
  };
  const handleDeleteAvatar = async () => {
    try {
      const response = await fetch("/api/user/avatar/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?._id,
          avatarId: "1",
          // avatarId: user?.avatar?.fileId,
        }),
      });

      if (!response.ok) {
        showError(`Failed to delete avatar: ${response.statusText}`);
        return;
      }

      // Update local user state to remove avatar
      if (user) {
        setUser({
          ...user,
          avatar: { data: "", contentType: "", fileId: "" },
        });
      }

      showSuccess("Avatar deleted successfully");
    } catch (error) {
      showError(`Error deleting avatar: ${error}`);
    }
  };
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create an object with only the changed fields
    const changedFields = Object.keys(formData).reduce((acc, key) => {
      const typedKey = key as keyof typeof formData;
      if (formData[typedKey] !== (user?.[typedKey] || "")) {
        acc[typedKey] = formData[typedKey];
      }
      return acc;
    }, {} as Partial<typeof formData>);

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...changedFields, userId: user?._id }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const result = await response.json();
      console.log("result = ", result);

      showSuccess("Profile updated successfully");

      if (result.code === 200) {
        if (result.user && isValidUser(result.user)) {
          setUser(result.user);
        } else {
          showError("Invalid user data received from server");
        }
      }
    } catch (error) {
      showError(`Error updating profile: ${error}`);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.type === 'checkbox'
        ? (formData[e.target.name as keyof typeof formData] === e.target.value ? '' : e.target.value)
        : e.target.value,
    };
    setFormData(newFormData);

    const isDirty = Object.keys(newFormData).some((key) => {
      const typedKey = key as keyof typeof newFormData;
      return newFormData[typedKey] !== (user?.[typedKey] || "");
    });
    setIsFormDirty(isDirty);
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);

    try {
      const response = await fetch("/api/user/update-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          username: newUsername,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      showSuccess("Username updated successfully");
      setIsChangeUsernameModalOpen(false);
    } catch (error) {
      setUsernameError(`Error updating username: ${error}`);
    }
  };

  /**
   * Renaming may take a few minutes to complete.
Your original username will be unavailable for 90 days following the rename.
   */

  return (
    <div
      id="profile-page"
      className={`min-h-[calc(100vh-theme(spacing.header))] bg-background dark:bg-background`}
    >
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 pb-2" />
        ) : (
          <h1 className="text-2xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">
            Profile
          </h1>
        )}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
          <div className="w-full md:w-2/3 md:min-w-[255px] order-2 md:order-1">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-4">
                {isLoading ? (
                  // Placeholder form fields
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i}>
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    ))
                ) : (
                  <>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 dark:text-white dark:border-gray-700 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 dark:text-white dark:border-gray-700 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 dark:text-white dark:border-gray-700 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="location"
                        className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 dark:text-white dark:border-gray-700 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="website"
                        className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        Website
                      </label>
                      <input
                        type="text"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 dark:text-white dark:border-gray-700 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sex
                      </label>
                      <div className="flex gap-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="sex"
                            value="male"
                            checked={formData.sex === "male"}
                            onChange={handleInputChange}
                            className="form-checkbox text-blue-600 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">Male</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="sex"
                            value="female"
                            checked={formData.sex === "female"}
                            onChange={handleInputChange}
                            className="form-checkbox text-blue-600 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">Female</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="sex"
                            value="other"
                            checked={formData.sex === "other"}
                            onChange={handleInputChange}
                            className="form-checkbox text-blue-600 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">Other</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!isLoading && <SubmitButton isFormDirty={isFormDirty} />}
            </form>
          </div>

          <div className="w-full md:w-80 order-1 md:order-2">
            <div className="mb-8 flex flex-col items-start md:items-center text-left md:text-center">
              {isLoading ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="mt-2 h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </>
              ) : (
                <div>
                  <p className="text-xs font-medium text-black dark:text-white text-left mb-2">
                    Profile picture
                  </p>
                  <AvatarUpload
                    clickableAvatar
                    handleSave={handleSaveAvatar}
                    handleDelete={handleDeleteAvatar}
                    align={isMobileView ? "start" : "center"}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
