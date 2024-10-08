"use client";

import { useState, useEffect, useRef, use } from "react";
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
import { IEntry, ICategory } from "@/lib/interfaces";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  List,
  Grid,
  PlusIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { localStorageService } from "@/lib/services/localStorageService";
import { Spinner } from "@/components/ui/spinner"; // Import a spinner component if you have one
import Link from "next/link";
import { IFrontEndEntry } from "@/app/dashboard/UserDashboard";
import { useFormState } from "react-dom";
import { ICreateCategoryState, ICreateEntryState } from "./types";
import { createCategory } from "@/actions/createCategory";
import { createEntry } from "@/actions/createEntry";

const createEntryInitialState: ICreateEntryState = {
  message: "",
  errors: {},
  success: false,
  user: null,
};

function WritePage() {
  const { user, isLoading, setUser } = useAuth();
  const { setSelectedEntry } = useEntry();
  const [entries, setEntries] = useState<IEntry[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [favorite, setFavorite] = useState<boolean>(false); // State for favorite checkbox
  const [isSaving, setIsSaving] = useState(false);
  const [showEntrySuccessIcon, setShowEntrySuccessIcon] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    useState(false); // State for dialog
  const [isCreatingCategoryLoading, setIsCreatingCategoryLoading] =
    useState(false); // State for loading indicator
  const [showCreatedCategorySuccessIcon, setShowCreatedCategorySuccessIcon] =
    useState(false); // State for success icon
  const [categoryCreatedErrorMessage, setCategoryCreatedErrorMessage] =
    useState(""); // State for error message
  const [isCategoryCreated, setIsCategoryCreated] = useState(false); // State to track if category is created
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false); // New state for text visibility
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [totalWords, setTotalWords] = useState(0); // State for total words in current entry
  const [averageWords, setAverageWords] = useState(0); // State for average words across all entries
  const [showMetrics, setShowMetrics] = useState(true); // State to control visibility of metrics section
  const [categoryExists, setCategoryExists] = useState(false); // State to track if the category already exists

  const [createEntryState, createEntryAction] = useFormState(
    createEntry.bind(null, user?._id || ""),
    createEntryInitialState
  );

  // const { openModal } = useContext(ModalContext);

  // const handleOpenModal = () => {
  //   openModal(<div>Your custom content here!</div>);
  // };

  const handleCloseCategoryModal = () => {
    setShowCreatedCategorySuccessIcon(false); // Hide success icon
    setIsCreateCategoryDialogOpen(false); // Close dialog immediately
    setIsCategoryCreated(false); // Reset category created state
    setNewCategoryName("");
    setCategoryCreatedErrorMessage("");
    setIsCreatingCategoryLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Clear the timeout if the dialog is closed
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    // ... existing code ...

    // Reset error and success messages at the start of the function
    setCategoryCreatedErrorMessage(""); // Clear any existing error message
    setShowCreatedCategorySuccessIcon(false); // Hide success icon

    if (newCategoryName) {
      setIsCreatingCategoryLoading(true); // Show loading indicator

      const categoryExists = categories.some(
        ({ category }) =>
          category.toLowerCase() === newCategoryName.toLowerCase()
      );
      if (categoryExists) {
        setCategoryCreatedErrorMessage("Category already exists."); // Set error message if category exists
        setIsCreatingCategoryLoading(false); // Hide loading indicator
        return;
      }

      console.log(user, {
        userId: user?._id,
        category: newCategoryName,
      });

      try {
        const response = await fetch(
          "/api/user/category/create?returnUser=true",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user?._id,
              category: newCategoryName,
            }),
          }
        );

        console.log("response", response.status, response.ok);

        const body = await response.json();
        console.log("body", body);

        if (!response.ok) {
          setCategoryCreatedErrorMessage(body.message); // Set error message if creation failed
        } else {
          console.log("response.ok", response.ok);
          console.log("response.status", response.status);

          console.log("created category data", body);
          setUser(body.data);
          setEntries(body.data.entries);
          setCategories(body.data.entryCategories);
          setNewCategoryName("");
          setShowCreatedCategorySuccessIcon(true); // Show success icon
          setIsCategoryCreated(true); // Set category created state

          // Hide the success icon after 3 seconds
          timeoutRef.current = setTimeout(() => {
            setShowCreatedCategorySuccessIcon(false);
          }, 3000);
        }
      } catch (error) {
        console.error("Error creating category:", error);
        setCategoryCreatedErrorMessage(
          "An error occurred while creating the category."
        ); // Set a generic error message
      } finally {
        setIsCreatingCategoryLoading(false); // Hide loading indicator
      }
    }
  };

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

  useEffect(() => {
    const savedEntry = localStorageService.getItem<IEntry>("selectedEntry");
    if (savedEntry) {
      setSelectedEntry(savedEntry);
    }
  }, [setSelectedEntry]);

  useEffect(() => {
    if (user && user.entries) {
      setEntries(user.entries);
      setCategories(user.entryCategories);

      const savedEntry = localStorageService.getItem<IEntry>("selectedEntry");
      if (savedEntry) {
        const updatedEntry = user.entries.find((j) => j._id === savedEntry._id);
        if (updatedEntry) {
          setSelectedEntry(updatedEntry);
          localStorageService.setItem("selectedEntry", updatedEntry);
        }
      }
      setSelectedCategory("");
    }
  }, [user, setSelectedEntry]);

  useEffect(() => {
    if (user && !user.isVerified) {
      setIsVerifiedModalOpen(true);
    }
  }, [user]);

  useEffect(() => {
    if (newCategoryName.trim() !== "" && isCategoryCreated) {
      setIsCategoryCreated(false);
    }
  }, [newCategoryName, isCategoryCreated]);

  useEffect(() => {
    // Calculate total words in the current entry
    const wordCount = entry.trim().split(/\s+/).filter(Boolean).length;
    setTotalWords(wordCount);

    // Calculate average words across all entries
    if (entries.length > 0) {
      const totalWordsInEntries = entries.reduce(
        (acc, curr) =>
          acc + curr.entry.trim().split(/\s+/).filter(Boolean).length,
        0
      );
      setAverageWords(Math.round(totalWordsInEntries / entries.length));
    } else {
      setAverageWords(0);
    }
  }, [entry, entries]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear timeout on component unmount
      }
    };
  }, []);

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
      {/* Sidebar - hidden on small screens, visible from medium screens and up */}
      <div
        className={`hidden md:flex flex-col bg-gray-100 p-4 overflow-y-auto transition-all duration-300 ease-in-out relative ${
          isSidebarOpen ? "md:w-64" : "md:w-16"
        }`}
      >
        <Button
          className={`relative w-full p-0 mb-6 ${
            isSidebarOpen ? "justify-end" : "justify-center"
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
              <span className="ml-2">Entries ({entries.length})</span>
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
              <span className="ml-2">Categories ({categories.length})</span>
            )}
          </Link>
        </div>
      </div>
      {/* Main Content */}
      <div className="w-full p-6 overflow-y-auto max-w-4xl mx-auto flex">
        <div className="w-2/3 flex flex-col">
          {" "}
          {/* Main form section */}
          {/* <h1 className="text-3xl font-bold mb-6">Entrie Dashboard</h1> */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Create New Entry</h2>
            <form action={createEntryAction} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="entry">Entry</Label>
                <Textarea
                  id="entry"
                  name="entry"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Select
                      onValueChange={setSelectedCategory}
                      value={selectedCategory}
                      className="w-2/3"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {categories.length > 0 ? (
                          categories.map((cat, index) => (
                            <SelectItem key={index} value={cat.category}>
                              {cat.category}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="disabled" disabled>
                            No categories available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="w-1/3"
                    >
                      {isAddingCategory ? (
                        <>
                          <X size={20} className="mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <PlusIcon className="mr-2" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>

                  {isAddingCategory && (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setNewCategoryName(newName);
                          setShowCreatedCategorySuccessIcon(false); // Hide success icon on input change

                          // Check if the category already exists
                          const exists = categories.some(
                            ({ category }) =>
                              category.toLowerCase() === newName.toLowerCase()
                          );
                          setCategoryExists(exists); // Update categoryExists state

                          // Set error message if the category exists
                          if (exists) {
                            setCategoryCreatedErrorMessage(
                              "Category already exists."
                            ); // Show error message
                          } else {
                            setCategoryCreatedErrorMessage(""); // Clear error message if it doesn't exist
                          }
                        }}
                        placeholder="New category"
                        className="w-2/3"
                      />
                      <Button
                        type="button" // Change to submit type
                        className="w-1/3"
                        disabled={
                          isCreatingCategoryLoading ||
                          categoryExists ||
                          newCategoryName.trim() === ""
                        } // Disable button if loading, category exists, or input is empty
                        onClick={handleCreateCategory}
                      >
                        {isCreatingCategoryLoading ? ( // Show spinner if loading
                          <Spinner />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </div>
                  )}
                  {showCreatedCategorySuccessIcon && (
                    <div className="flex items-center">
                      <Check size={20} className="text-green-500 mr-2" />
                      <span className="text-green-500">
                        Category added successfully!
                      </span>
                    </div>
                  )}
                </div>
                {categoryCreatedErrorMessage && ( // Show error message if it exists
                  <p className="text-red-500 mt-1">
                    {categoryCreatedErrorMessage}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <Label htmlFor="favorite" className="mr-2">
                  Favorite this entry?
                </Label>
                <input
                  type="checkbox"
                  id="favorite"
                  name="favorite"
                  checked={favorite}
                  onChange={(e) => {
                    console.log(e.target.checked, typeof e.target.checked);
                    setFavorite(e.target.checked);
                  }}
                />
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
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2" />
                    <p className="text-green-500">
                      Entrie created successfully!
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="w-1/3 pl-6 flex flex-col">
          {" "}
          {/* Metrics section */}
          <div className="flex justify-end items-center mb-0 ">
            <Button
              type="button"
              onClick={() => setShowMetrics(!showMetrics)}
              variant="ghost"
              className="text-xs pb-0 mb-0"
            >
              {showMetrics ? "Hide" : "Show"}
            </Button>
          </div>
          {showMetrics && ( // Conditionally render metrics section
            <div className="bg-gray-100 p-4 rounded-md shadow-md flex-grow">
              <p className="text-sm">
                <strong>Total Words in Current Entry:</strong> {totalWords}
              </p>
              <p className="text-sm">
                <strong>Average Words Across All Entries:</strong>{" "}
                {averageWords}
              </p>
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          width: "100%",
          backgroundColor: "white",
          padding: "1rem",
          textAlign: "center",
          zIndex: 1000,
        }}
      >
        <h1>{isCategoryCreated.toString()}</h1>
      </div>
    </div>
  );
}

export default WritePage;
