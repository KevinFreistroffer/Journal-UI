"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Pencil2Icon } from "@radix-ui/react-icons";

const AvatarUpload = ({
  clickableAvatar = false,
  handleSave,
}: {
  clickableAvatar: boolean;
  handleSave: (avatar: string) => void;
}) => {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar.data);
    }
  }, [user?.avatar]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatar(result);
        console.log("Avatar string size:", new Blob([result]).size, "bytes");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    if (clickableAvatar) {
      handleUploadClick();
    }
  };

  return (
    <div className="flex flex-col self-start sm:self-centers">
      <div
        className="mb-4 cursor-pointer relative"
        onClick={handleAvatarClick}
        title={clickableAvatar ? "Change avatar" : undefined}
      >
        {avatar ? (
          <>
            <Image
              src={avatar}
              alt="User Avatar"
              width={260}
              height={260}
              className="rounded-full object-cover aspect-square w-[260px] h-[260px]"
              title={clickableAvatar ? "Change avatar" : undefined}
            />
            {clickableAvatar && (
              <div className="absolute bottom-5 left-5 bg-white rounded-full p-2 shadow-md">
                <Pencil2Icon className="h-5 w-5 text-gray-600" />
              </div>
            )}
          </>
        ) : (
          <div
            className="aspect-square w-[260px] h-[260px] bg-gray-200 rounded-full flex items-center justify-center overflow-hidden"
            title={clickableAvatar ? "Change avatar" : undefined}
          >
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      {!clickableAvatar && (
        <button
          onClick={handleUploadClick}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
        >
          Upload Avatar
        </button>
      )}
      {avatar && (
        <button
          onClick={() => {
            handleSave(avatar);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Save Avatar
        </button>
      )}
    </div>
  );
};

export default AvatarUpload;
