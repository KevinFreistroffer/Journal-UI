"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ICategory } from "@/lib/interfaces";
import { Checkbox } from "@/components/ui/Checkbox"; // Assuming you have these UI components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link"; // Changed from: import { Link } from "next/link"
import { Trash2 } from "lucide-react"; // Add this import at the top with other imports
import { useMediaQuery } from "@/hooks/useMediaQuery"; // Add this import if you don't have it
import DashboardContainer from "@/components/ui/DashboardContainer/DashboardContainer";
import Sidebar from "@/components/ui/Sidebar/Sidebar";
import { Settings } from "lucide-react";
import { Edit2 } from "lucide-react"; // Add this import
import { LayoutGrid, Table } from "lucide-react"; // Add these to your existing lucide-react imports

// Add this utility function at the top of the file
const getJournalCountForCategory = (category: string, journals: any[]) => {
  return (
    journals?.filter((journal) => journal.category === category).length || 0
  );
};

const CategoriesPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    category: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isMobile = useMediaQuery("(max-width: 639px)"); // sm breakpoint
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    if (user) {
      setCategories(user.journalCategories);
    }
  }, [user]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/user/category/create?returnUser=true",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?._id,
            category: newCategoryName,
          }),
        }
      );

      const body = await response.json();
      if (!response.ok) throw new Error(body.message);

      setUser(body.data);
      setCategories(body.data.journalCategories);
      setNewCategoryName("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create category"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/category/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          categoryId: editingCategory.id,
          newName: editingCategory.category,
        }),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.message);

      setUser(body.data);
      setCategories(body.data.journalCategories);
      setEditingCategory(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update category"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategories = async () => {
    if (!selectedCategories.length) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/category/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          categoryIds: selectedCategories,
        }),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.message);

      setUser(body.data);
      setCategories(body.data.journalCategories);
      setSelectedCategories([]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete categories"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardContainer
      sidebar={
        <Sidebar
          isOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          icon={<Settings size={20} />}
          sections={[]}
        />
      }
      isSidebarOpen={isSidebarOpen}
    >
      {" "}
      <div className="p-12 space-y-4 min-h-screen relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Delete button */}
            {!isMobile && selectedCategories.length > 0 && (
              <Button
                variant="ghost"
                onClick={handleDeleteCategories}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}

            {/* View toggle buttons - only show on larger screens */}
            <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm"
                    : "hover:bg-gray-200"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("table")}
                className={`p-1.5 ${
                  viewMode === "table"
                    ? "bg-white shadow-sm"
                    : "hover:bg-gray-200"
                }`}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* New category form on the right */}
          <form onSubmit={handleCreateCategory} className="flex gap-2">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              New
            </Button>
          </form>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        {/* Grid view */}
        {viewMode === "grid" && (
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="group relative bg-white rounded-lg border p-4 hover:shadow-md transition-all"
              >
                {/* Checkbox overlay in top-left */}
                <div className="absolute top-3 left-3">
                  <Checkbox
                    checked={selectedCategories.includes(category._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([
                          ...selectedCategories,
                          category._id,
                        ]);
                      } else {
                        setSelectedCategories(
                          selectedCategories.filter((id) => id !== category._id)
                        );
                      }
                    }}
                  />
                </div>

                {/* Edit button in top-right */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto hover:bg-transparent"
                    onClick={() =>
                      setEditingCategory({
                        id: category._id,
                        category: category.category,
                      })
                    }
                  >
                    <Edit2 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </Button>
                </div>

                {/* Category content */}
                <div className="pt-8">
                  {editingCategory?.id === category._id ? (
                    <div className="space-y-2">
                      <Input
                        value={editingCategory.category}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            category: e.target.value,
                          })
                        }
                        className="py-1 px-2 h-8"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleUpdateCategory}
                          disabled={isLoading}
                          className="h-8"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCategory(null)}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {category.category}
                      </h3>
                      <span className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                        {getJournalCountForCategory(
                          category.category,
                          user?.journals || []
                        )}{" "}
                        journals
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table view - now available on all screen sizes */}
        {(viewMode === "table" || isMobile) && (
          <div className="overflow-x-auto border rounded-lg relative">
            <div className="min-w-[500px]">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 z-10 bg-gray-50 w-14 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Checkbox
                        checked={
                          categories.length > 0 &&
                          selectedCategories.length === categories.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories(
                              categories.map((cat) => cat._id)
                            );
                          } else {
                            setSelectedCategories([]);
                          }
                        }}
                      />
                    </th>
                    <th className="w-14 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edit
                    </th>
                    <th className="w-full px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td className="sticky left-0 z-10 bg-white w-14 px-6 py-4 whitespace-nowrap">
                        <Checkbox
                          checked={selectedCategories.includes(category._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([
                                ...selectedCategories,
                                category._id,
                              ]);
                            } else {
                              setSelectedCategories(
                                selectedCategories.filter(
                                  (id) => id !== category._id
                                )
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="w-14 px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto hover:bg-transparent"
                          onClick={() =>
                            setEditingCategory({
                              id: category._id,
                              category: category.category,
                            })
                          }
                        >
                          <Edit2 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                        </Button>
                      </td>
                      <td className="w-full px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                        {editingCategory?.id === category._id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingCategory.category}
                              onChange={(e) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  category: e.target.value,
                                })
                              }
                              className="py-1 px-2 h-8"
                            />
                            <Button
                              size="sm"
                              onClick={handleUpdateCategory}
                              disabled={isLoading}
                              className="h-8"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingCategory(null)}
                              className="h-8"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            {category.category}
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              {getJournalCountForCategory(
                                category.category,
                                user?.journals || []
                              )}
                            </span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile FAB */}
        {isMobile && selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            className="fixed bottom-6 right-6 rounded-full p-4 shadow-lg h-14 w-14 hover:scale-105 transition-all text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
            onClick={handleDeleteCategories}
            disabled={isLoading}
          >
            <Trash2 className="h-6 w-6 text-red-500" />
          </Button>
        )}
      </div>
    </DashboardContainer>
  );
};

export default CategoriesPage;
