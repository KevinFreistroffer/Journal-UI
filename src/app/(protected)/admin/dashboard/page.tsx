"use client";

import { useState, useEffect } from "react";
import DashboardContainer from "@/components/ui/__layout__/DashboardContainer/DashboardContainer";
import { useAuth } from "@/hooks/useAuth";
import { IUser } from "@/lib/interfaces";
import { Users, Settings } from "lucide-react"; // Import icons
import Sidebar from "@/components/ui/Sidebar/Sidebar";
import { useTheme } from "next-themes"; // Import the useTheme hook
import ProtectedPageWrapper from "@/components/ui/PageWrappers/ProtectedPageWrapper";

type Sex = "male" | "female" | "non-binary" | undefined;

interface User
  extends Omit<
    IUser,
    | "password"
    | "resetPasswordToken"
    | "resetPasswordTokenExpires"
    | "resetPasswordAttempts"
  > {
  id: string; // for client-side handling
}

function AdminDashboard() {
  const { isLoading, setIsLoading, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [activeSection, setActiveSection] = useState<"users" | "settings">(
    "users"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme } = useTheme(); // Use the useTheme hook to get the theme

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
    fetchUsers();
  }, [user, setIsLoading]);

  const fetchUsers = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/user/users");

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      if (!data || !data.data) {
        console.error("Invalid response format: missing data field", data);
        setUsers([]);
        return;
      }

      setUsers(data.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleSave = async (updatedUser: User) => {
    try {
      await fetch(`/api/user/users/${updatedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleToggleDisable = async (user: User) => {
    try {
      await fetch(`/api/user/users/${user.id}/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDisabled: !user.disabled }),
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    }
  };

  const renderContent = () => {
    if (activeSection === "settings") {
      return (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <p>Admin settings coming soon...</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Users</h1>
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full bg-white dark:bg-transparent shadow-md rounded-lg border border-gray-200 dark:border-gray-700 border-gray-300">
              <thead className="bg-transparent">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading || isFetching ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-red-600"
                    >
                      No users found. This might indicate a system error as
                      there should always be at least one admin user.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition-colors duration-200`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          className="w-full bg-transparent border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          type="text"
                          value={user.username}
                          onChange={(e) =>
                            setUsers((prevUsers) =>
                              prevUsers.map((u) =>
                                u.id === user.id
                                  ? { ...u, username: e.target.value }
                                  : u
                              )
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          className="w-full bg-transparent border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          type="text"
                          value={user.name}
                          onChange={(e) =>
                            setUsers((prevUsers) =>
                              prevUsers.map((u) =>
                                u.id === user.id
                                  ? { ...u, name: e.target.value }
                                  : u
                              )
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          className="w-full bg-transparent border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          type="text"
                          value={user.bio}
                          onChange={(e) =>
                            setUsers((prevUsers) =>
                              prevUsers.map((u) =>
                                u.id === user.id
                                  ? { ...u, bio: e.target.value }
                                  : u
                              )
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          className="w-full bg-transparent border border-gray-300 rounded px-2 py-1"
                          type="text"
                          value={user.sex}
                          onChange={(e) =>
                            setUsers((prevUsers) =>
                              prevUsers.map((u) =>
                                u.id === user.id
                                  ? { ...u, sex: e.target.value as Sex }
                                  : u
                              )
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          className="w-full bg-transparent border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          type="text"
                          value={user.company}
                          onChange={(e) =>
                            setUsers((prevUsers) =>
                              prevUsers.map((u) =>
                                u.id === user.id
                                  ? { ...u, company: e.target.value }
                                  : u
                              )
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          className="w-full bg-transparent border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          type="text"
                          value={user.location}
                          onChange={(e) =>
                            setUsers((prevUsers) =>
                              prevUsers.map((u) =>
                                u.id === user.id
                                  ? { ...u, location: e.target.value }
                                  : u
                              )
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          className="w-full bg-transparent border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          type="text"
                          value={user.website}
                          onChange={(e) =>
                            setUsers((prevUsers) =>
                              prevUsers.map((u) =>
                                u.id === user.id
                                  ? { ...u, website: e.target.value }
                                  : u
                              )
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          className="w-full bg-transparent border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          type="checkbox"
                          checked={user.disabled}
                          onChange={(e) =>
                            setUsers((prevUsers) =>
                              prevUsers.map((u) =>
                                u.id === user.id
                                  ? { ...u, disabled: e.target.checked }
                                  : u
                              )
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col space-y-2">
      <button
        onClick={() => setActiveSection("users")}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          activeSection === "users"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <Users size={20} />
        <span>Users</span>
      </button>
      <button
        onClick={() => setActiveSection("settings")}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          activeSection === "settings"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </div>
  );

  return (
    // <ProtectedPageWrapper>
    <DashboardContainer
      isSidebarOpen={isSidebarOpen}
      sidebar={
        <Sidebar
          isOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          icon={<Settings size={20} />}
          headerDisplaysTabs={false}
          sections={[
            {
              title: "Admin Navigation",
              content: sidebarContent,
            },
          ]}
          theme={!theme ? "light" : (theme as "light" | "dark")} // Add the theme prop here
        />
      }
    >
      {renderContent()}
    </DashboardContainer>
    // </ProtectedPageWrapper>
  );
}

export default AdminDashboard;
