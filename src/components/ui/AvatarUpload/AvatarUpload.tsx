"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Pencil2Icon } from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import * as Dialog from "@radix-ui/react-dialog";

const AvatarUpload = ({
  clickableAvatar = false,
  handleSave,
  size,
  align = "center",
}: {
  clickableAvatar: boolean;
  handleSave: (avatar: { data: string; contentType: string }) => void;
  size?: number;
  align?: "start" | "center" | "end";
}) => {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [tempImage, setTempImage] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setTempImage(result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = () => {
    const image = imgRef.current;
    if (!image) return null;

    const canvas = document.createElement("canvas");

    if (!crop) {
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.drawImage(image, 0, 0, image.width, image.height);
    } else {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }

    return {
      data: canvas.toDataURL("image/jpeg"),
      contentType: "image/jpeg",
    };
  };

  const handleCropComplete = async () => {
    const croppedImage = getCroppedImg();
    if (croppedImage) {
      setIsSaving(true);
      setError(null);
      try {
        await handleSave(croppedImage);
        setAvatar(croppedImage.data);
        setShowCropModal(false);
        setTempImage(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save avatar');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRemovePhoto = () => {
    setAvatar(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    if (clickableAvatar && !avatar) {
      handleUploadClick();
    }
  };

  return (
    <div className={`flex flex-col items-${align}`}>
      {avatar ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <div
              className="mb-4 cursor-pointer relative group"
              title={clickableAvatar ? "Change avatar" : undefined}
            >
              <Image
                src={avatar}
                alt="User Avatar"
                width={size || 200}
                height={size || 200}
                className={`rounded-full object-cover aspect-square ${
                  size
                    ? `w-[${size}px] h-[${size}px]`
                    : "w-[clamp(120px,calc(120px_+_(100vw_-_768px)_*_0.1),200px)]"
                }`}
              />
              {clickableAvatar && (
                <>
                  <div className="absolute bottom-5 left-5 bg-white rounded-full p-2 shadow-md cursor-pointer">
                    <Pencil2Icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6L7.5 9L11 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              )}
            </div>
          </DropdownMenu.Trigger>
          {clickableAvatar && (
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 p-2 min-w-[150px] text-sm">
                <DropdownMenu.Item
                  className="px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 rounded text-gray-700"
                  onSelect={handleUploadClick}
                >
                  Upload a photo
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500 dark:text-red-400"
                  onSelect={handleRemovePhoto}
                >
                  Remove photo
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          )}
        </DropdownMenu.Root>
      ) : (
        <div
          className={`aspect-square ${
            size
              ? `w-[${size}px] h-[${size}px]`
              : "w-[clamp(120px,calc(120px_+_(100vw_-_768px)_*_0.1),200px)]"
          } bg-gray-200 rounded-full flex items-center justify-center overflow-hidden`}
          title={clickableAvatar && !avatar ? "Change avatar" : undefined}
        >
          <span className="text-gray-500">No Image</span>
        </div>
      )}
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
      <Dialog.Root open={showCropModal} onOpenChange={setShowCropModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl">
            <Dialog.Title className="text-lg font-bold mb-4">
              Crop Image
            </Dialog.Title>
            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}
            {tempImage && (
              <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={1}>
                <Image
                  ref={imgRef}
                  src={tempImage}
                  alt="Crop preview"
                  width={size || 200}
                  height={size || 200}
                />
              </ReactCrop>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const croppedImage = getCroppedImg();
                  if (croppedImage) {
                    setAvatar(croppedImage.data);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isSaving}
              >
                Apply Crop
              </button>
              <button
                onClick={handleCropComplete}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default AvatarUpload;
