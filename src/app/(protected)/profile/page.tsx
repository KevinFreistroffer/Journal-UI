"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AvatarUpload from "@/components/ui/AvatarUpload/AvatarUpload";
import ChangePassword from "@/components/ui/ChangePassword";

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [avatarFileId, setAvatarFileId] = useState<string | null>(null);
  const { user } = useAuth();

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

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <main className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Avatar</h2>
          <AvatarUpload clickableAvatar handleSave={handleSave} />
          {isLoading && (
            <p className="mt-2 text-blue-500">Uploading avatar...</p>
          )}
          {message && (
            <p
              className={`mt-2 ${
                message.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
