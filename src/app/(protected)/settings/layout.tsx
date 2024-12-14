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
import Avatar from "@/components/ui/Avatar/Avatar";
import ChangePasswordModal from "./components/ChangePasswordModal";
import { PageContainer } from "@/components/ui/__layout__/PageContainer/PageContainer";
import DeleteAccountModal from "./components/DeleteAccountModal";

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
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

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
    <PageContainer showLoadingIndicator={false}>
      <div
        id="settings"
        className="min-h-[calc(100vh-theme(spacing.header))] bg-background dark:bg-[var(--color-darker1)] px-4 py-10 sm:px-8 sm:py-6 overflow-x-hidden relative z-0"
      >
        <div className="flex-col relative z-0">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {isLoading ? (
                <div className="w-full h-full animate-pulse" />
              ) : (
                <Avatar
                  avatarUrl={user?.avatar?.data}
                  username={user?.username}
                  name={user?.name}
                />
              )}
            </div>
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {isLoading ? (
                <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <span className="font-light">
                  {user?.name} {user?.username ? `(${user?.username})` : ""}
                </span>
              )}
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
                    {isLoading ? (
                      <div className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`${
                            pathname === "/settings/profile"
                              ? "border-l-2 border-blue-500"
                              : ""
                          }`}
                        >
                          <Link
                            href="/settings/profile"
                            className={`block p-2 text-xs ${
                              pathname === "/settings/profile"
                                ? "bg-gray-100 dark:bg-[var(--color-darker4)]"
                                : "hover:bg-gray-100 dark:hover:bg-[var(--color-darker4)]"
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
                          className="w-full text-left p-2 text-xs hover:bg-gray-100 dark:hover:bg-[var(--color-darker4)] rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <UserCog size={16} />
                            <span>Change username</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsChangePasswordModalOpen(true)}
                          className="w-full text-left p-2 text-xs hover:bg-gray-100 dark:hover:bg-[var(--color-darker4)] rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <KeyRound size={16} />
                            <span>Change password</span>
                          </div>
                        </button>
                        <Link
                          href="/settings/notifications"
                          className={`block p-2 text-xs ${
                            pathname === "/settings/notifications"
                              ? "bg-gray-100 dark:bg-[var(--color-darker4)]"
                              : "hover:bg-gray-100 dark:hover:bg-[var(--color-darker4)]"
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
                            className="w-full text-left p-2 text-xs hover:bg-gray-100 dark:hover:bg-[var(--color-darker4)] rounded-md text-red-500"
                          >
                            <div className="flex items-center gap-2">
                              <Trash2 size={16} />
                              <span>Delete account</span>
                            </div>
                          </button>
                        )}
                      </>
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
                <div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="text-left p-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-red-500"
                    >
                      <div className="flex items-center gap-2">
                        <Trash2 size={16} />
                        <span>Delete account</span>
                      </div>
                    </button>
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
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onOpenChange={setIsChangePasswordModalOpen}
        />
        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          deleteConfirmation={deleteConfirmation}
          setDeleteConfirmation={setDeleteConfirmation}
          handleDeleteAccount={handleDeleteAccount}
          isDeleting={isDeleting}
          showFinalConfirmation={showFinalConfirmation}
        />
      </div>
    </PageContainer>
  );
};

export default Layout;
