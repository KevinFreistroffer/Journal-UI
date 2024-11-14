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
    if (!image || !crop) return null;

    const canvas = document.createElement("canvas");
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

    return {
      data: canvas.toDataURL("image/jpeg"),
      contentType: "image/jpeg",
    };
  };

  const handleCropComplete = () => {
    const croppedImage = getCroppedImg();
    if (croppedImage) {
      setAvatar(croppedImage.data);
      handleSave(croppedImage);
      setShowCropModal(false);
      setTempImage(null);
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
              className="mb-4 cursor-pointer relative"
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
                <div className="absolute bottom-5 left-5 bg-white rounded-full p-2 shadow-md cursor-pointer">
                  <Pencil2Icon className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </div>
          </DropdownMenu.Trigger>
          {clickableAvatar && (
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="bg-white rounded-lg shadow-lg p-2 min-w-[150px]">
                <DropdownMenu.Item
                  className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
                  onSelect={handleUploadClick}
                >
                  Upload a photo
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded text-red-500"
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
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply Crop
              </button>
              <button
                onClick={handleCropComplete}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default AvatarUpload;
