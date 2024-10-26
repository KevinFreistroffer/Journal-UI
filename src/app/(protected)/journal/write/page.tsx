"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollUpButton,
  ScrollDownButton,
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { localStorageService } from "@/lib/services/localStorageService";
import { Spinner } from "@/components/ui/spinner"; // Import a spinner component if you have one
import Link from "next/link";
// import { IFrontEndJournal } from "@/app/(protected)/dashboard/UserDashboard";
import { useFormState, useFormStatus } from "react-dom";
import { ICreateJournalState } from "./types";
import Sidebar from "@/components/ui/Sidebar/Sidebar"; // Corrected casing
// import { createCategory } from "@/actions/createCategory";
import { createJournal } from "@/actions/createJournal";
import { useClipboard } from "use-clipboard-copy";
import styles from "./styles.module.css";

// import { SummarizerManager } from "node-summarizer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip"; // Add these imports
import { cn } from "@/lib/utils"; // Make sure you have this utility function
import SummaryDialog from "@/components/SummaryDialog";
import { generateLoremIpsum } from "@/lib/utils"; // Add this import
import ScrollAreaComponent from "@/components/ui/ScrollArea/ScrollArea"; // Add this import

const createJournalInitialState: ICreateJournalState = {
  message: "",
  errors: {},
  success: false,
  user: null,
};

// Create a new SubmitButton component
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-blue-500 hover:bg-blue-600 text-white w-1/4 py-1 text-sm"
    >
      {pending ? (
        <div className="flex items-center">
          <Spinner className="mr-2 h-4 w-4" />
          <span>Saving...</span>
        </div>
      ) : (
        "Save Journal"
      )}
    </Button>
  );
}

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
    createJournal.bind(null, user?._id || "", selectedCategory),
    createJournalInitialState
  );
  const [showWordStats, setShowWordStats] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null); // New error state
  const [showTitle, setShowTitle] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [isCategoryScrollAreaVisible, setIsCategoryScrollAreaVisible] =
    useState(false); // Updated state for scroll area visibility
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    console.log("createJournalState", createJournalState);
  }, [createJournalState]);

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
      const totalWordsInEntries = journals.reduce((acc, journal) => {
        console.log(journal);
        return acc + journal.entry.trim().split(/\s+/).filter(Boolean).length;
      }, 0);
      setAverageWords(Math.round(totalWordsInEntries / journals.length));
    } else {
      setAverageWords(0);
    }
  }, [journal, journals]);

  // Updated summarizeJournal function
  const summarizeJournal = async () => {
    if (!journal.trim()) {
      alert("Please write a journal first.");
      return;
    }

    setIsSummarizing(true);
    setSummaryError(null); // Reset error state before attempting to summarize
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
      setSummary(data.summary);
      setIsSummaryModalOpen(true);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryError("An error occurred while generating the summary.");
      // Don't open the modal if there's an error
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTweet = async () => {
    try {
      const response = await fetch("/api/user/x/tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: summary.join(" ") }),
      });

      if (!response.ok) {
        throw new Error("Failed to send tweet");
      }

      const data = await response.json();

      // You can add some UI feedback here, like a success message
    } catch (error) {
      console.error("Error sending tweet:", error);
      // You can add some UI feedback here, like an error message
    }
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

  const handleJournalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJournal(e.target.value);
  };

  const handleJournalPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");

    setJournal((prevJournal) => {
      return prevJournal + pastedText;
    });
  };

  const generateSampleText = () => {
    const sampleText = generateLoremIpsum(3); // Generate 3 paragraphs
    setJournal(sampleText);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear timeout on component unmount
      }
    };
  }, []);

  // Add effect to handle form submission state
  useEffect(() => {
    if (createJournalState.success) {
      setShowSuccessMessage(true);
      if (createJournalState.user) {
        setUser(createJournalState.user);
      }

      // Hide the message after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [createJournalState, setUser]);

  // Check if the user is verified
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen h-screen">
        <Spinner />
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

  // Create a wrapper function for the form action
  const handleSubmit = async (formData: FormData) => {
    try {
      await createJournalAction(formData);
    } catch (error) {
      console.error("Error submitting journal:", error);
    }
  };

  return (
    <div className="flex h-full min-h-screen mt-16">
      {/* Sidebar - only visible on md screens and above */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        icon={<ChartNoAxesColumnIncreasing size={20} />}
        sections={[
          {
            title: "Word Stats",
            content: (
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
            ),
          },
        ]}
      />

      {/* Main Content */}
      <div
        className={`flex-1 p-6 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-56" : "md:ml-24"
        }`}
      >
        {/* Journal writing section */}
        <div className="flex-1 flex justify-center">
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center">
              {" "}
              {/* Flex container for alignment */}
              <h1 className="text-xl">Write anything</h1> {/* Title */}
              <div className="flex flex-col items-end">
                {" "}
                {/* Container for label and scroll component */}
                <Label
                  htmlFor="category"
                  className="mb-1 cursor-pointer" // Make label clickable
                  onClick={() =>
                    setIsCategoryScrollAreaVisible(!isCategoryScrollAreaVisible)
                  } // Toggle visibility on click
                >
                  Categorize it?{" "}
                  <span className="text-gray-400 text-sm font-normal">
                    (optional)
                  </span>
                </Label>
                {isCategoryScrollAreaVisible && ( // Conditionally render the new scroll component
                  <ScrollAreaComponent // Replace with your new scroll component
                    rootClassName="absolute top-0 right-0"
                    content={categories.map((category) => ({
                      id: category._id,
                      label: category.category,
                      value: category.category,
                    }))} // Pass categories as a prop
                    onSelect={(item) => {
                      setSelectedCategory(item.value as string);
                      setIsCategoryScrollAreaVisible(false);
                    }} // Pass the setSelectedCategory function as onSelect prop
                  />
                )}
              </div>
            </div>
            <form action={handleSubmit} className="space-y-4">
              {/* Title Input Above Textarea */}
              <div className="flex flex-col">
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (optional)"
                />
              </div>
              <div className="flex flex-col mb-4">
                {/* <Label htmlFor="journal" className="mb-1">
                  Journal Entry
                </Label> */}
                <Textarea
                  id="journal"
                  name="entry"
                  value={journal}
                  onChange={handleJournalChange}
                  onPaste={handleJournalPaste}
                  placeholder="Write your journal entry here..."
                  className="h-64 mb-6"
                />

                <div className="mt-4 fixed top-20 right-10">
                  <Button
                    type="button"
                    onClick={generateSampleText}
                    className="bg-gray-500 "
                  >
                    Generate
                  </Button>
                </div>

                <div className="space-y-4 flex flex-col">
                  <div className="flex flex-col">
                    <Label
                      // htmlFor="category"
                      className="mb-1 cursor-pointer" // Make label clickable
                      onClick={() =>
                        setIsCategoryScrollAreaVisible(
                          !isCategoryScrollAreaVisible
                        )
                      } // Toggle visibility on click
                    >
                      Categorize it?{" "}
                      <span className="text-gray-400 text-sm font-normal">
                        (optional)
                      </span>
                    </Label>

                    {isCategoryScrollAreaVisible && ( // Conditionally render the ScrollAreaComponent
                      <div>
                        {" "}
                        {/* Attach ref to the scroll area container */}
                        <ScrollAreaComponent
                          rootClassName="absolute top-0 right-0"
                          content={categories.map((category) => ({
                            id: category._id,
                            label: category.category,
                            value: category.category,
                          }))} // Pass categories as a prop
                          onSelect={(item) => {
                            console.log("item", item);
                            setSelectedCategory(item.value as string);
                            setIsCategoryScrollAreaVisible(false);
                          }} // Pass the setSelectedCategory function as onSelect prop
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
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
                <div className="flex items-center justify-start">
                  <SubmitButton />
                </div>
                <div className="flex items-center mt-2">
                  <Button
                    type="button"
                    onClick={summarizeJournal}
                    className="bg-blue-500 hover:bg-blue-600 text-white w-1/4 py-1 text-sm mr-2"
                    disabled={isSummarizing || !journal}
                  >
                    {isSummarizing ? "Summarizing..." : "Generate Summary"}
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
                {showSuccessMessage && createJournalState.success && (
                  <div className="flex items-center mt-2">
                    <CheckCircle className="text-green-500 mr-2" />
                    <p className="text-green-500">Entry created successfully!</p>
                  </div>
                )}
                {/* Word Stats section for small screens */}
                <div className="md:hidden mt-4">
                  <button
                    type="button"
                    onClick={() => setShowWordStats(!showWordStats)}
                    className="flex items-center justify-between w-full p-2 bg-gray-200 rounded-md"
                  >
                    <span className="font-medium">Word Stats</span>
                    {showWordStats ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                  {showWordStats && (
                    <div className="mt-2 p-4 bg-gray-100 rounded-md">
                      <p>
                        <span className="font-medium">Total Words:</span>{" "}
                        {totalWords}
                      </p>
                      <p>
                        <span className="font-medium">
                          Average Words Across All Journals:
                        </span>{" "}
                        {averageWords}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Summary Dialog */}
      <SummaryDialog
        isOpen={isSummaryModalOpen}
        onOpenChange={setIsSummaryModalOpen}
        summary={summary}
        onTweet={handleTweet}
        error={summaryError} // Pass the error to the dialog
      />
    </div>
  );
}

export default WritePage;
