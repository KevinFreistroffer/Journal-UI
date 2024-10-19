"use client";

import AvatarUpload from "@/components/ui/AvatarUpload/AvatarUpload";
import ChangePassword from "@/components/ui/ChangePassword";

const ProfilePage = () => {
  const handleSave = async (avatar: string) => {
    // TODO: Implement API call to save the avatar
    console.log("Saving avatar:", avatar);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <main className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Avatar</h2>
          <AvatarUpload clickableAvatar handleSave={handleSave} />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
