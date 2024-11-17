"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Pencil1Icon } from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import Avatar from "../Avatar/Avatar";

const AvatarUpload = ({
  clickableAvatar = false,
  handleSave,
  handleDelete,
  size,
  align = "center",
}: {
  clickableAvatar: boolean;
  handleSave: (avatar: { data: string; contentType: string }) => void;
  handleDelete: () => void;
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
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

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
      event.target.value = '';
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
        setError(err instanceof Error ? err.message : "Failed to save avatar");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRemovePhoto = () => {
    setShowRemoveConfirm(true);
  };

  const confirmRemovePhoto = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await handleDelete();
      setAvatar(null);
      setShowRemoveConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setIsSaving(false);
    }
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
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <div className="mb-4 cursor-pointer relative group">
            {avatar ? (
              <Avatar
                avatarUrl={avatar}
                username={user?.username}
                name={user?.name}
                size={size || 200}
              />
            ) : (
              <div
                className={`aspect-square ${
                  size
                    ? `w-[${size}px] h-[${size}px]`
                    : "w-[clamp(120px,calc(120px_+_(100vw_-_768px)_*_0.1),200px)]"
                } bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden`}
              >
                <span className="text-gray-500 dark:text-gray-400">
                  No Image
                </span>
              </div>
            )}
            {clickableAvatar && (
              <div className="text-xs flex items-center gap-1 px-1 py-1 absolute bottom-[10%] left-0 bg-white dark:bg-gray-800 rounded-sm p-0 shadow-md dark:border dark:border-gray-700">
                <Pencil1Icon
                  className={`${
                    size
                      ? `h-[${Math.max(size * 0.1, 16)}px] w-[${Math.max(
                          size * 0.1,
                          16
                        )}px]`
                      : "h-3 w-3"
                  } text-gray-600 dark:text-gray-300`}
                />{" "}
                Edit
              </div>
            )}
          </div>
        </DropdownMenu.Trigger>
        {clickableAvatar && (
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="relative top-[-7px] pt-[.125rem] bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 min-w-[150px] text-sm outline-none before:content-[''] before:absolute before:top-[-5px] before:left-[10px] before:w-[10px] before:h-[10px] before:rotate-45 before:border-l before:border-t before:border-gray-200 dark:before:border-gray-700 before:bg-white dark:before:bg-gray-800">
              <DropdownMenu.Item
                className="text-xs px-4 pt-2 relative z-10 pb-1 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 rounded rounded-bl-none rounded-br-none text-gray-700"
                onSelect={handleUploadClick}
              >
                Upload a photo
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="text-xs px-4 pt-1 pb-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded rounded-tl-none rounded-tr-none text-red-500 dark:text-red-400"
                onSelect={handleRemovePhoto}
              >
                Remove photo
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </DropdownMenu.Root>
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
            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
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
                  "Save"
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <AlertDialog.Root
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <AlertDialog.Title className="text-lg font-bold mb-4 dark:text-white">
              Remove Avatar
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to remove your avatar? This action cannot be
              undone.
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={confirmRemovePhoto}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Removing...
                    </>
                  ) : (
                    "Remove Avatar"
                  )}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

export default AvatarUpload;
