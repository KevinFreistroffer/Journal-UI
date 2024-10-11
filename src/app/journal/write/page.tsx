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
  HelpCircle,
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
import { Checkbox } from "@/components/ui/checkbox";

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
  const [showWordStats, setShowWordStats] = useState(true);

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
        {isSidebarOpen && (
          <div className="flex items-center mt-4">
            <Checkbox
              id="showWordStats"
              checked={showWordStats}
              onCheckedChange={(checked) =>
                setShowWordStats(checked as boolean)
              }
            />
            <label
              htmlFor="showWordStats"
              className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Word Stats
            </label>
          </div>
        )}
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center">
        {/* Metrics row at the top */}
        {showWordStats && (
          <div className="mb-4 text-sm text-gray-600 flex flex-col justify-end">
            <p className="mr-4">
              <strong>Total Words:</strong> {totalWords}
            </p>
            <p>
              <strong>Average Words:</strong> {averageWords}
            </p>
          </div>
        )}

        <div
          className={`flex flex-1 justify-center ${
            !summary ? "justify-center" : ""
          }`}
        >
          <div className={`${summary ? "w-1/2 pr-6" : "w-2/3"}`}>
            {/* Main form section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Create New Journal
              </h2>
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
                    cols={50}
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
                  <div className="flex items-center">
                    <Button
                      type="button"
                      onClick={summarizeJournal}
                      className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
                      disabled={isSummarizing || !journal}
                    >
                      {isSummarizing ? "Summarizing..." : "Summarize Journal"}
                    </Button>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-5 h-5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
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
                  {/* <Button
                    type="button"
                    onClick={() => clipboard.copy(summary)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    disabled={!summary}
                  >
                    Copy Summary
                  </Button> */}
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
          {summary && summary.length > 0 && (
            <div className="w-1/2 pl-6 flex flex-col">
              {/* Summary and Tweet Thread section */}
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
                  <div className="bg-gray-100 p-4 rounded-md shadow-md flex-1 flex flex-col">
                    <div className="mt-4 flex-grow">
                      <strong>Generated Summary:</strong>
                      <div className="mt-2 p-2 bg-white rounded">
                        <p className="text-sm mb-2">{summary.join(" ")}</p>
                        <div className="flex justify-end">
                          <p className="text-xs text-gray-600">
                            Total characters: {summary.join(" ").length}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex space-x-2 max-h-screen">
                        <Button
                          type="button"
                          onClick={() => {
                            if (summary.join(" ").length <= 280) {
                              handleTweet();
                            } else {
                              setShowTweetThread(!showTweetThread);
                            }
                          }}
                          className="bg-blue-400 hover:bg-blue-500 text-white"
                        >
                          <Twitter size={16} className="mr-2" />
                          {summary.join(" ").length <= 280
                            ? "Tweet"
                            : showTweetThread
                            ? "Hide Tweet Thread"
                            : "Show Tweet Thread"}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => clipboard.copy(summary.join(" "))}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Copy Summary
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Tweet Thread column (if shown) */}
                  {showTweetThread && (
                    <div className="bg-gray-100 p-4 rounded-md shadow-md flex-1 flex flex-col">
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

/*
The world we live in today is increasingly driven by technology, transforming the way we interact with one another and with the world around us.
From smartphones to artificial intelligence, advancements in technology have reshaped industries, improved healthcare, and revolutionized communication.
However, while the convenience and innovation brought by technology are undeniable, it also raises questions about privacy, security, and the ethical use of data.
Balancing progress with responsible use remains one of the key challenges of our era.

Education, too, has seen profound changes as digital tools become more integrated into learning environments.
Students now have access to a wealth of information online, and virtual classrooms have made education more accessible than ever before.
While traditional teaching methods still hold value, the shift toward e-learning platforms has enabled personalized and flexible learning.
Yet, as education becomes more reliant on technology, it's important to address the digital divide, ensuring that all students, regardless of socioeconomic background, have the tools they need to succeed.

On a personal level, technology continues to shape daily life in both subtle and significant ways.
Social media has changed how we connect with friends and family, providing instant access to global news and trends.
Streaming services have revolutionized how we consume entertainment, and smart devices have simplified household tasks.
However, with this convenience also comes a growing need to find balance—ensuring that technology enhances life without overwhelming it.
Finding time for offline experiences, genuine human connections, and personal well-being remains as important as ever in this digital age.
*/
