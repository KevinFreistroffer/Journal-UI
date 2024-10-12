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
  Twitter,
  ChartNoAxesColumnIncreasing,
  HelpCircle,
  Clipboard,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip"; // Add these imports
import { cn } from "@/lib/utils"; // Make sure you have this utility function

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
  const [summary, setSummary] = useState<string[]>([]); // Changed to string[]
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showTweetThread, setShowTweetThread] = useState(false);
  const clipboard = useClipboard();
  const [createJournalState, createJournalAction] = useFormState(
    createJournal.bind(null, user?._id || ""),
    createJournalInitialState
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

        const body = await response.json();

        if (!response.ok) {
          setCategoryCreatedErrorMessage(body.message); // Set error message if creation failed
        } else {
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

  // useEffect(() => {
  //   if (isSidebarOpen) {
  //     const timer = setTimeout(() => {
  //       setIsTextVisible(true); // Show text after animation
  //     }, 200); // Match this duration with your CSS transition duration

  //     return () => clearTimeout(timer);
  //   } else {
  //     setIsTextVisible(false); // Hide text when sidebar is closed
  //   }
  // }, [isSidebarOpen]);

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

      const data: { summary: string[] } = await response.json();
      console.log("setting summary", data.summary, data.summary.length);
      setSummary(data.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary(["An error occurred while generating the summary."]);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTweet = () => {
    const tweetText = encodeURIComponent(summary.join(" "));
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, "_blank");
  };

  const generateTweetThread = () => {
    const chunks: string[] = [];
    let currentChunk = "";

    summary.forEach((sentence) => {
      if (currentChunk.length + sentence.length + 1 <= 280) {
        // Add sentence to current chunk if it fits
        currentChunk += (currentChunk ? " " : "") + sentence;
      } else {
        // If current chunk is not empty, push it and start a new one
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = sentence;
      }
    });

    // Push the last chunk if it's not empty
    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
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
    <div className="flex h-full min-h-screen mt-16">
      {/* Sidebar - fixed position, full height */}
      <div
        className={`fixed mt-16 top-0 left-0 h-full bg-gray-100 p-4 overflow-y-auto transition-all duration-300 ease-in-out z-10 ${
          isSidebarOpen ? "w-56" : "w-16"
        }`}
      >
        <Button
          className={`relative w-full p-0 cursor-pointer ${
            isSidebarOpen ? "justify-end" : "justify-center"
          }`}
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <ChevronLeft size={20} />
          ) : (
            <ChartNoAxesColumnIncreasing size={20} />
          )}
        </Button>
        {isSidebarOpen && (
          <div className="flex flex-col mt-4">
            <span className="text-md font-medium">Word Stats</span>
            <div className="mt-2 text-sm font-thin text-gray-600">
              <p>
                <span className="font-medium">Total Words:</span> {totalWords}
              </p>
              <p>
                <span className="font-medium">
                  Average Words Across All Journals:
                </span>{" "}
                {averageWords}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - adjusted to be a flex container */}
      <div
        className={`flex-1 p-6 overflow-y-auto flex transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-56" : "ml-24"
        }`}
      >
        {/* Journal writing section */}
        <div className="flex-1 flex justify-center">
          <div className="w-3/4">
            <h2 className="text-2xl font-semibold mb-4">Your Thoughts</h2>
            <form action={createJournalAction} className="space-y-4">
              <div>
                {/* <Label htmlFor="journal">Journal</Label> */}
                <Textarea
                  id="journal"
                  name="journal"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  required
                  cols={50}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="title" className="mb-1">
                  Title{" "}
                  <span className="text-gray-400 text-sm font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title"
                />
              </div>
              <div className="space-y-4 flex flex-col">
                <div className="flex flex-col">
                  <Label htmlFor="category" className="mb-1">
                    Categorize{" "}
                    <span className="text-gray-400 text-sm font-normal">
                      (optional)
                    </span>
                  </Label>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Select
                        onValueChange={setSelectedCategory}
                        value={selectedCategory}
                        name="category"
                      >
                        <SelectTrigger className="w-[200px] h-[20px] border-solid border-gray-300">
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
                        className="text-xs"
                      >
                        {isAddingCategory ? (
                          <>
                            <X size={20} className="mr-2" />
                            Cancel
                          </>
                        ) : (
                          <>
                            New <PlusIcon className="mr-2" size={16} />
                          </>
                        )}
                      </Button>
                    </div>

                    {isAddingCategory && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setNewCategoryName(newName);
                            setShowCreatedCategorySuccessIcon(false);
                            const exists = categories.some(
                              ({ category }) =>
                                category.toLowerCase() === newName.toLowerCase()
                            );
                            setCategoryExists(exists);
                            setCategoryCreatedErrorMessage(
                              exists ? "Category already exists." : ""
                            );
                          }}
                          placeholder="New category"
                          className="flex-grow"
                        />
                        <Button
                          type="button"
                          disabled={
                            isCreatingCategoryLoading ||
                            categoryExists ||
                            newCategoryName.trim() === ""
                          }
                          onClick={handleCreateCategory}
                        >
                          {isCreatingCategoryLoading ? <Spinner /> : "Add"}
                        </Button>
                      </div>
                    )}
                    {showCreatedCategorySuccessIcon && (
                      <div className="flex items-center mt-2">
                        <Check size={20} className="text-green-500 mr-2" />
                        <span className="text-green-500">
                          Category added successfully!
                        </span>
                      </div>
                    )}
                  </div>
                  {categoryCreatedErrorMessage && (
                    <p className="text-red-500 mt-1">
                      {categoryCreatedErrorMessage}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <Label htmlFor="favorite" className="mr-2">
                    Favorite this journal?
                  </Label>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="favorite"
                      name="favorite"
                      checked={favorite}
                      onChange={(e) => setFavorite(e.target.checked)}
                      className="sr-only" // Hide the actual checkbox
                    />
                    <div
                      className={cn(
                        "w-5 h-5 border-2 rounded-sm cursor-pointer transition-colors duration-200",
                        favorite
                          ? "bg-[#3b82f6] border-[#3b82f6]"
                          : "bg-white border-gray-300"
                      )}
                      onClick={() => setFavorite(!favorite)}
                    >
                      {favorite && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-start">
                <Button
                  type="submit"
                  disabled={isSaving || !title || !journal}
                  className="bg-blue-500 hover:bg-blue-600 text-white w-1/4 py-1 text-sm"
                >
                  {isSaving ? "Saving..." : "Save Journal"}
                </Button>
              </div>
              <div className="flex items-center mt-2">
                <Button
                  type="button"
                  onClick={summarizeJournal}
                  className="bg-blue-500 hover:bg-blue-600 text-white w-1/4 py-1 text-sm mr-2"
                  disabled={isSummarizing || !journal}
                >
                  {isSummarizing ? "Summarizing..." : "Summarize Journal"}
                </Button>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-5 h-5 text-gray-500 cursor-help border-solid border-black" />
                    </TooltipTrigger>
                    <TooltipContent className="border-solid border-black">
                      <p className="text-sm leading-relaxed">
                        Summarize your journal entry into fewer sentences.
                      </p>
                      <p className="text-xs leading-relaxed">
                        You can also tweet the summary directly!
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {showJournalSuccessIcon && (
                <div className="flex items-center mt-2">
                  <CheckCircle className="text-green-500 mr-2" />
                  <p className="text-green-500">Entry created successfully!</p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Summary section */}
        {summary && summary.length > 0 && (
          <div className="w-1/2 pl-6 flex flex-col">
            <div className="flex justify-between items-center mb-0">
              <Button
                type="button"
                onClick={() => setShowMetrics(!showMetrics)}
                variant="ghost"
                className="text-xs pb-0 mb-0"
              >
                {showMetrics ? "Hide" : "Show"}
              </Button>
            </div>
            {showMetrics && (
              <div className="flex-grow flex space-x-4 w-full">
                {/* Generated Summary column */}
                <div className="bg-gray-100 p-4 rounded-md shadow-md flex-1 flex flex-col relative">
                  <Button
                    type="button"
                    onClick={() => setShowMetrics(false)}
                    className="absolute top-2 right-2 p-0 bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X size={16} />
                  </Button>
                  <div className="mt-4 flex-grow">
                    <strong>Generated Summary:</strong>
                    <div className="mt-2 p-2 bg-white rounded relative min-h-[100px] flex flex-col justify-between">
                      <Button
                        type="button"
                        onClick={() => clipboard.copy(summary.join(" "))}
                        className="absolute cursor-pointer top-2 right-2 p-0 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
                        title="Copy Summary"
                      >
                        <Clipboard size={20} className="text-black" />
                      </Button>
                      <p className="text-sm mb-2 pr-8">{summary.join(" ")}</p>
                      <div className="flex justify-end mt-auto">
                        <p className="text-xs text-gray-600">
                          Total characters: {summary.join(" ").length}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 w-full">
                      <Button
                        type="button"
                        onClick={() => {
                          if (summary.join(" ").length <= 280) {
                            handleTweet();
                          } else {
                            setShowTweetThread(!showTweetThread);
                          }
                        }}
                        className="bg-blue-400 hover:bg-blue-500 text-white w-full py-2 px-0 cursor-pointer"
                      >
                        <Twitter size={16} className="mr-2" />
                        Tweet
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Tweet Thread column (if shown) */}
                {showTweetThread && (
                  <div className="bg-gray-100 p-4 rounded-md shadow-md flex-1 flex flex-col relative">
                    <Button
                      type="button"
                      onClick={() => setShowTweetThread(false)}
                      className="absolute top-2 right-2 p-0 bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <X size={16} />
                    </Button>
                    <div className="flex-grow">
                      <strong>Tweet Thread Preview:</strong>
                      <div className="mt-2 space-y-2">
                        {generateTweetThread().map((chunk, index) => (
                          <div key={index} className="p-2 bg-white rounded">
                            <p className="text-sm">
                              {index + 1}/{generateTweetThread().length}:{" "}
                              {chunk}
                            </p>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={handleTweet}
                        className="mt-4 bg-blue-400 hover:bg-blue-500 text-white"
                      >
                        <Twitter size={16} className="mr-2" />
                        Tweet
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WritePage;
