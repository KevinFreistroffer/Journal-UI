"use client";

import { useState, useEffect, useRef } from "react";
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
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useJournal } from "@/hooks/useJournal";
import { IJournal, ICategory } from "@/lib/interfaces";
// import { useRouter } from "next/navigation";
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
// import { IFrontEndJournal } from "@/app/dashboard/UserDashboard";
import { useFormState } from "react-dom";
import { ICreateJournalState } from "./types";
// import { createCategory } from "@/actions/createCategory";
import { createJournal } from "@/actions/createJournal";
import { useClipboard } from "use-clipboard-copy";
// import { SummarizerManager } from "node-summarizer";

const createJournalInitialState: ICreateJournalState = {
  message: "",
  errors: {},
  success: false,
  user: null,
};

function WritePage() {
  const { user, isLoading, setUser } = useAuth();
  const { setSelectedJournal } = useJournal();
  const [journals, setJournals] = useState<IJournal[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [journal, setJournal] = useState("");
  const [favorite, setFavorite] = useState<boolean>(false); // State for favorite checkbox
  const [isSaving, setIsSaving] = useState(false);
  const [showJournalSuccessIcon, setShowJournalSuccessIcon] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    useState(false); // State for dialog
  const [isCreatingCategoryLoading, setIsCreatingCategoryLoading] =
    useState(false); // State for loading indicator
  const [showCreatedCategorySuccessIcon, setShowCreatedCategorySuccessIcon] =
    useState(false); // State for success icon
  const [categoryCreatedErrorMessage, setCategoryCreatedErrorMessage] =
    useState(""); // State for error message
  const [isCategoryCreated, setIsCategoryCreated] = useState(false); // State to track if category is created
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false); // New state for text visibility
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [totalWords, setTotalWords] = useState(0); // State for total words in current journal
  const [averageWords, setAverageWords] = useState(0); // State for average words across all journals
  const [showMetrics, setShowMetrics] = useState(true); // State to control visibility of metrics section
  const [categoryExists, setCategoryExists] = useState(false); // State to track if the category already exists
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const clipboard = useClipboard();
  const [createJournalState, createJournalAction] = useFormState(
    createJournal.bind(null, user?._id || ""),
    createJournalInitialState
  );

  console.log(
    createJournalState,
    setIsSaving,
    setShowJournalSuccessIcon,
    isVerifiedModalOpen,
    isCreateCategoryDialogOpen
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
  console.log(handleCloseCategoryModal);
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
          setJournals(body.data.journals);
          setCategories(body.data.journalCategories);
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
    const savedJournal =
      localStorageService.getItem<IJournal>("selectedJournal");
    if (savedJournal) {
      setSelectedJournal(savedJournal);
    }
  }, [setSelectedJournal]);

  useEffect(() => {
    if (user && user.journals) {
      setJournals(user.journals);
      setCategories(user.journalCategories);

      const savedJournal =
        localStorageService.getItem<IJournal>("selectedJournal");
      if (savedJournal) {
        const updatedJournal = user.journals.find(
          (j) => j._id === savedJournal._id
        );
        if (updatedJournal) {
          setSelectedJournal(updatedJournal);
          localStorageService.setItem("selectedJournal", updatedJournal);
        }
      }
      setSelectedCategory("");
    }
  }, [user, setSelectedJournal]);

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
    // Calculate total words in the current journal
    const wordCount = journal.trim().split(/\s+/).filter(Boolean).length;
    setTotalWords(wordCount);

    // Calculate average words across all journals
    if (journals.length > 0) {
      const totalWordsInEntries = journals.reduce(
        (acc, journal) =>
          acc + journal.entry.trim().split(/\s+/).filter(Boolean).length,
        0
      );
      setAverageWords(Math.round(totalWordsInEntries / journals.length));
    } else {
      setAverageWords(0);
    }
  }, [journal, journals]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear timeout on component unmount
      }
    };
  }, []);

  // Updated summarizeJournal function
  const summarizeJournal = async () => {
    if (!journal.trim()) {
      alert("Please write a journal first.");
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch("/api/user/entry/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: journal }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("An error occurred while generating the summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

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
            href="/journals"
            className={`w-full flex items-center h-6 mt-4 mb-4 mr-0 ${
              isSidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <List />
            {isSidebarOpen && isTextVisible && (
              <span className="ml-2">Journals ({journals.length})</span>
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
            <h2 className="text-2xl font-semibold mb-4">Create New Journal</h2>
            <form action={createJournalAction} className="space-y-4">
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
                <Label htmlFor="journal">Journal</Label>
                <Textarea
                  id="journal"
                  name="journal"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
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
                      // className="w-2/3"
                      name="category"
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
                  Favorite this journal?
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
                  disabled={isSaving || !title || !journal}
                  className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
                >
                  {isSaving ? "Saving..." : "Create Journal"}
                </Button>
                <Button
                  type="button"
                  onClick={summarizeJournal}
                  className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
                  disabled={isSummarizing}
                >
                  {isSummarizing ? "Summarizing..." : "Summarize Journal"}
                </Button>
                <Button
                  type="button"
                  onClick={() => clipboard.copy(summary)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={!summary}
                >
                  Copy Summary
                </Button>
                {showJournalSuccessIcon && (
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
                <strong>Total Words in Current Journal:</strong> {totalWords}
              </p>
              <p className="text-sm">
                <strong>Average Words Across All Journals:</strong>{" "}
                {averageWords}
              </p>
              {summary && (
                <div className="mt-4">
                  <strong>Generated Summary:</strong>
                  <p className="text-sm mt-2 p-2 bg-white rounded">{summary}</p>
                </div>
              )}
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
