"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AvatarUpload from "@/components/ui/AvatarUpload/AvatarUpload";
import ChangePassword from "@/components/ui/ChangePassword";
import { Settings } from "lucide-react";

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [avatarFileId, setAvatarFileId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    company: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        company: user.company || "",
        location: user.location || "",
        website: user.website || "",
      });
    }
  }, [user]);

  const handleSave = async (avatar: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/avatar/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar, userId: user?._id }),
      });

      if (!response.ok) {
        setMessage({
          type: "error",
          text: `Failed to update avatar: ${response.statusText}`,
        });
      } else {
        const result = await response.json();
        setAvatarFileId(result.fileId);

        setMessage({ type: "success", text: "Avatar updated successfully" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: `Error updating avatar: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userId: user?._id }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      setMessage({ type: "success", text: "Profile updated successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: `Error updating profile: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="mb-8 flex flex-col items-center text-center">
              {isAuthLoading ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="mt-2 h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <AvatarUpload clickableAvatar handleSave={handleSave} />
                  <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.username || user?.email || "User"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-4">
                {isAuthLoading ? (
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
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="website"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {!isAuthLoading && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Profile"}
                </button>
              )}
            </form>

            {message && (
              <p
                className={`mt-4 text-center ${
                  message.type === "success" ? "text-green-500" : "text-red-500"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
