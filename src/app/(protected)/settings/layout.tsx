"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AvatarUpload from "@/components/ui/AvatarUpload/AvatarUpload";
import ChangePassword from "@/components/ui/ChangePassword";
import { Settings, UserCog, KeyRound, Bell, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import Sidebar from "@/components/ui/Sidebar/Sidebar";
import DashboardContainer from "@/components/ui/layout/DashboardContainer/DashboardContainer";
import Link from "next/link";
import ChangeUsernameModal from "./components/ChangeUsernameModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const SubmitButton = ({ isFormDirty }: { isFormDirty: boolean }) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || !isFormDirty}
      className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save Profile"}
    </button>
  );
};

const Layout = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { user, isLoading } = useAuth();
  const isMobileView = useMediaQuery("(max-width: 767px)");
  const isExtraSmallScreen = useMediaQuery("(max-width: 360px)");
  const [isChangeUsernameModalOpen, setIsChangeUsernameModalOpen] =
    useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const pathname = usePathname();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);

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

      setMessage({ type: "success", text: "Username updated successfully" });
      setIsChangeUsernameModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setUsernameError(`Error updating username: ${error}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "I confirm deletion of my account") return;

    if (!showFinalConfirmation) {
      setShowFinalConfirmation(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      window.location.href = "/";
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete account" });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setShowFinalConfirmation(false);
    }
  };

  /**
   * Renaming may take a few minutes to complete.
Your original username will be unavailable for 90 days following the rename.
   */

  return (
    <div
      id="profile-page"
      className="min-h-screen bg-background dark:bg-background px-4 py-10 sm:px-8 sm:py-6 overflow-x-hidden"
    >
      <div className="flex-col">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {user?.avatar?.data && (
              <Image
                key={user?.avatar?.data}
                src={user?.avatar?.data}
                alt={user?.name || "User avatar"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            <span className="font-light">
              {user?.name} {user?.username ? `(${user?.username})` : ""}
            </span>
          </span>
        </div>
        <div className="md:flex">
          {" "}
          <div
            className={`
            ${isMobileView ? "w-full" : "md:w-56"}
            ${!isMobileView ? "dark:border-r-1" : ""}
             overflow-y-auto transition-[width] duration-300 ease-in-out z-30
          `}
          >
            <div
              className={`flex flex-col transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="mb-8 pb-2 ">
                {/* <p>
                  <span className="font-medium dark:text-white">Settings</span>
                </p> */}
                <div className="mt-2 text-xs md:text-sm font-normal text-gray-600 dark:text-white space-y-2">
                  <div
                    className={`${
                      pathname === "/settings/profile"
                        ? "border-l-2 border-blue-500"
                        : ""
                    }`}
                  >
                    <Link
                      href="/settings/profile"
                      className={`block p-2 ${
                        pathname === "/settings/profile"
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Settings size={16} />
                        <span>Profile</span>
                      </div>
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangeUsernameModalOpen(true);
                    }}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <UserCog size={16} />
                      <span>Change username</span>
                    </div>
                  </button>
                  <Link
                    href="/settings/password"
                    className={`block p-2 ${
                      pathname === "/settings/password"
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    } rounded-md`}
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound size={16} />
                      <span>Change password</span>
                    </div>
                  </Link>
                  <Link
                    href="/settings/notifications"
                    className={`block p-2 ${
                      pathname === "/settings/notifications"
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    } rounded-md`}
                  >
                    <div className="flex items-center gap-2">
                      <Bell size={16} />
                      <span>Notifications</span>
                    </div>
                  </Link>
                  {!isMobileView && (
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-red-500"
                    >
                      <div className="flex items-center gap-2">
                        <Trash2 size={16} />
                        <span>Delete account</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            className={`flex-1 px-4 py-2 sm:px-6 sm:py-18 overflow-x-hidden ${
              isExtraSmallScreen ? "pr-10" : ""
            }`}
          >
            {children}
            {isMobileView && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex justify-center">
                  <Link
                    href="/settings/delete-account"
                    className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 border-2 border-red-500 rounded-md px-4 py-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete account</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ChangeUsernameModal
        isOpen={isChangeUsernameModalOpen}
        onOpenChange={setIsChangeUsernameModalOpen}
        onSubmit={handleUsernameSubmit}
        username={newUsername}
        onUsernameChange={(e) => setNewUsername(e.target.value)}
        error={usernameError}
      />
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Account</DialogTitle>
            <DialogDescription className="space-y-4 dark:text-gray-300">
              <p className="font-medium">
                Warning: This action cannot be undone.
              </p>
              <ul className="list-disc pl-4 space-y-2 text-sm">
                <li>All your data will be permanently deleted</li>
                <li>You will lose access to all your content</li>
                <li>Your username will be released</li>
              </ul>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Type &quot;I confirm deletion of my account&quot; to continue:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Type confirmation here"
                />
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={
                  deleteConfirmation !== "I confirm deletion of my account" ||
                  isDeleting
                }
                className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting
                  ? "Deleting..."
                  : showFinalConfirmation
                    ? "Yes, I'm absolutely sure - Delete Account"
                    : "Delete Account"}
              </button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;
