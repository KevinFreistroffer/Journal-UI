"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEntry } from "@/hooks/useEntry";
import { IEntry } from "@/lib/interfaces";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  List,
  Grid,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { localStorageService } from "@/lib/services/localStorageService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner"; // Import a spinner component if you have one
import Link from "next/link";

export interface IFrontEndEntry extends IEntry {
  id: number;
}

type Category = {
  id: number;
  name: string;
  selected: boolean;
};

function UserDashboard() {
  const { user, isLoading, setUser } = useAuth();
  const { setSelectedEntry } = useEntry();
  const [entries, setEntrys] = useState<IFrontEndEntry[]>([]);
  const [filteredEntrys, setFilteredEntrys] = useState<IFrontEndEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [entryViewMode, setEntryViewMode] = useState<"list" | "icons">("list");
  const [isSaving, setIsSaving] = useState(false);
  const [showCategorySuccessIcon, setShowCategorySuccessIcon] = useState(false);
  const [showEntrySuccessIcon, setShowEntrySuccessIcon] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<IFrontEndEntry | null>(
    null
  );
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false); // New state for text visibility

  useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        setIsTextVisible(true); // Show text after animation
      }, 200); // Match this duration with your CSS transition duration

      return () => clearTimeout(timer);
    } else {
      setIsTextVisible(false); // Hide text when sidebar is closed
    }
  }, [isSidebarOpen]);

  const renderSkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </CardHeader>
      <CardContent>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
      </CardContent>
    </Card>
  );

  const handleEntryClick = (e: React.MouseEvent, entrie: IFrontEndEntry) => {
    e.preventDefault();
    setSelectedEntry(entrie);
    localStorageService.setItem("selectedEntry", entrie);
    router.push(`/entry/${entrie.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, entrie: IFrontEndEntry) => {
    e.stopPropagation();
    setEntryToDelete(entrie);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (entryToDelete && user) {
      try {
        const response = await fetch(`api/user/entry/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            userId: user._id,
            entryIds: [entryToDelete.id],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete entrie");
        }

        const body = await response.json();
        const userData = body.data;
        setUser(userData);
        setEntrys(userData.entries);
        setFilteredEntrys(userData.entries);
        setIsDeleteDialogOpen(false);
        setEntryToDelete(null);
      } catch (error) {
        console.error("Error deleting entrie:", error);
      }
    }
  };

  useEffect(() => {
    const savedEntry =
      localStorageService.getItem<IFrontEndEntry>("selectedEntry");
    if (savedEntry) {
      setSelectedEntry(savedEntry);
    }
  }, [setSelectedEntry]);

  useEffect(() => {
    if (user && user.entries) {
      const formattedEntrys = user.entries.map((entrie, index) => ({
        id: index + 1,
        title: entrie.title,
        entry: entrie.entry,
        category: entrie.category || "My Entries",
        date: entrie.date,
        selected: entrie.selected,
      }));
      setEntrys(formattedEntrys);
      setFilteredEntrys(formattedEntrys);

      const savedEntry =
        localStorageService.getItem<IFrontEndEntry>("selectedEntry");
      if (savedEntry) {
        const updatedEntry = formattedEntrys.find(
          (j) => j.id === savedEntry.id
        );
        if (updatedEntry) {
          setSelectedEntry(updatedEntry);
          localStorageService.setItem("selectedEntry", updatedEntry);
        }
      }

      const uniqueCategories = Array.from(
        new Set(formattedEntrys.map((j) => j.category))
      );
      const categoriesArray = uniqueCategories.map((cat, index) => ({
        id: index + 1,
        name: cat,
        selected: false,
      }));

      if (categoriesArray.length === 0) {
        categoriesArray.push({ id: 1, name: "My Entries", selected: false });
      }

      setCategories(categoriesArray);
      setSelectedCategory("");
    }
  }, [user, setSelectedEntry]);

  useEffect(() => {
    if (user && !user.isVerified) {
      setIsVerifiedModalOpen(true);
    }
  }, [user]);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const newEntry = {
      title,
      entry,
      category:
        categories.length > 0
          ? selectedCategory.trim() !== ""
            ? selectedCategory
            : "Uncategorized"
          : "Uncategorized",
      userId: user?._id,
    };

    try {
      const response = await fetch(`api/user/entry/create`, {
        method: "POST",
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        throw new Error("Failed to create entrie");
      }

      if (response.status === 200) {
        const body = await response.json();

        const userData = body.data;
        setUser(userData);
        setEntrys(userData.entries);
        setFilteredEntrys(userData.entries);
        if (userData.entryCategories && userData.entryCategories.length > 0) {
          setCategories(
            userData.entryCategories.map(
              (
                cat: { category: string; selected: boolean },
                index: number
              ) => ({
                id: index + 1,
                name: cat.category,
                selected: cat.selected,
              })
            )
          );
        }
        setTitle("");
        setEntry("");
        setShowCategorySuccessIcon(true);
        setTimeout(() => setShowCategorySuccessIcon(false), 3000);
      }
    } catch (error) {
      console.error("Error creating entrie:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory) {
      const newCat: Category = {
        id: categories.length + 1,
        name: newCategory,
        selected: false,
      };
      setCategories([...categories, newCat]);
      setNewCategory("");
      setShowCategorySuccessIcon(true);
      setTimeout(() => setShowCategorySuccessIcon(false), 3000);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    if (categoryName) {
      setFilteredEntrys(
        entries.filter((entrie) => entrie.category === categoryName)
      );
    } else {
      setFilteredEntrys(entries);
    }
  };

  const clearCategoryFilter = () => {
    setSelectedCategory("");
    setFilteredEntrys(entries);
  };

  // const { openModal } = useContext(ModalContext);

  // const handleOpenModal = () => {
  //   openModal(<div>Your custom content here!</div>);
  // };

  // Check if the user is verified
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner /> {/* Show a loading spinner while loading */}
      </div>
    );
  }

  if (user && !user.isVerified) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Account Not Verified</h1>
          <p className="mb-4">
            Please verify your account to access the dashboard.
          </p>
          <Button
            onClick={() => {
              /* Add logic to resend verification email or redirect */
            }}
          >
            Resend Verification Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } flex flex-col bg-gray-100 p-4 overflow-y-auto transition-all duration-300 ease-in-out relative`}
      >
        <Button
          className={`relative w-full p-0 mb-6 ${
            isSidebarOpen ? "justify-end " : "justify-center "
          }`}
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </Button>
        <div className="flex flex-col items-center">
          <Link
            href="/entries"
            className={`w-full flex items-center h-6 mt-4 mb-4 mr-0 ${
              isSidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <List />
            {isSidebarOpen && isTextVisible && (
              <span className="ml-2">Entries</span>
            )}
          </Link>
          <Link
            href="/categories"
            className={`w-full flex items-center h-6 mt-4 mb-4 mr-0 ${
              isSidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <Grid />
            {isSidebarOpen && isTextVisible && (
              <span className="ml-2">Categories</span>
            )}
          </Link>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-end mb-4">
          <Button onClick={handleCreateEntry}>Create Entrie</Button>
        </div>
        <h1 className="text-3xl font-bold mb-6">Entrie Dashboard</h1>
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column: Create New Entry */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Create New Entry</h2>
            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="entry">Entry</Label>
                <Textarea
                  id="entry"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={setSelectedCategory}
                  defaultValue={selectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.length > 0 ? (
                      categories.map((cat, index) => (
                        <SelectItem key={index} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="disabled" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <Button
                  type="submit"
                  disabled={isSaving || !title || !entry}
                  className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
                >
                  {isSaving ? "Saving..." : "Create Entrie"}
                </Button>
                {showEntrySuccessIcon && (
                  <>
                    <CheckCircle className="text-green-500 animate-fade-in-out" />
                    <p className="text-green-500">
                      Entrie created successfully!
                    </p>
                  </>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Entrie List */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Entries</h2>
            <div className="flex space-x-2 mb-4">
              <Button
                variant={entryViewMode === "list" ? "default" : "outline"}
                onClick={() => setEntryViewMode("list")}
              >
                <List className="w-4 h-4 mr-2" />
                List View
              </Button>
              <Button
                variant={entryViewMode === "icons" ? "default" : "outline"}
                onClick={() => setEntryViewMode("icons")}
              >
                <Grid className="w-4 h-4 mr-2" />
                Icon View
              </Button>
            </div>
            <div
              className={`${
                entryViewMode === "list"
                  ? "space-y-4"
                  : "grid grid-cols-2 gap-4"
              } h-[calc(100vh-300px)] overflow-y-auto`}
            >
              {isLoading ? (
                Array(3)
                  .fill(null)
                  .map((_, index) => (
                    <div key={index}>{renderSkeletonCard()}</div>
                  ))
              ) : filteredEntrys && filteredEntrys.length > 0 ? (
                filteredEntrys.map((entrie, index) => (
                  <div
                    key={`entrie-${index}`}
                    onClick={(e) => handleEntryClick(e, entrie)}
                  >
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          {entrie.title}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(e, entrie)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>
                          {entrie.entry
                            ? entrie.entry.substring(0, 100) + "..."
                            : "No entry"}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Category: {entrie.category}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))
              ) : (
                <p>No entries found</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              entrie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default UserDashboard;
