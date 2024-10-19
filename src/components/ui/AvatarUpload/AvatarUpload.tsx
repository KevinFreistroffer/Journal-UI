"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const AvatarUpload = ({
  clickableAvatar = false,
  handleSave,
}: {
  clickableAvatar: boolean;
  handleSave: (avatar: string) => void;
}) => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
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
    <div className="flex flex-col items-center">
      <div className="mb-4 cursor-pointer" onClick={handleAvatarClick}>
        {avatar ? (
          <Image
            src={avatar}
            alt="User Avatar"
            width={100}
            height={100}
            className="rounded-full object-cover w-24 h-24"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
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
