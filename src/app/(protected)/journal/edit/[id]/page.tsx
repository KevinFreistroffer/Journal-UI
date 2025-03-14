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
import { ChevronDownIcon, CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { decodeHtmlEntities, sanitizeHtml } from "@/lib/utils";
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
  Save, // Add this import
} from "lucide-react";
import { localStorageService } from "@/lib/services/localStorageService";
import { Spinner } from "@/components/ui/Spinner"; // Import a spinner component if you have one
import Link from "next/link";
// import { IFrontEndJournal } from "@/app/(protected)/dashboard/UserDashboard";
import { useFormState, useFormStatus } from "react-dom";
import { ICreateJournalState } from "../../write/types";
import Sidebar from "@/components/ui/Sidebar/Sidebar"; // Corrected casing
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
import SummaryModal from "@/app/(protected)/journal/write/components/SummaryModal";
import { generateLoremIpsum } from "@/lib/utils"; // Add this import
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { analyzeSentiment } from "@/lib/utils"; // Add this import
import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons"; // Add these if not already imported
// Add these imports at the top
import "react-quill/dist/quill.snow.css";
import { useQuill } from "react-quilljs";
import { MultiSelect } from "@/components/ui/MultiSelect/MutliSelect";
import Quill from "quill";
import MagicUrl from "quill-magic-url";
import "../../write/styles.css";
import { PageContainer } from "@/components/ui/__layout__/PageContainer/PageContainer";
import DashboardContainer from "@/components/ui/__layout__/DashboardContainer/DashboardContainer";
import { useTheme } from "next-themes"; // Import the useTheme hook

Quill.register("modules/magicUrl", MagicUrl);

// Dynamically import ReactQuill to avoid SSR issues

// Add this constant for Quill modules/formats
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["clean"],
  ],
};

const createJournalInitialState: ICreateJournalState = {
  message: "",
  errors: {},
  success: false,
  user: null,
};

// Create a new SubmitButton component
function SubmitButton({
  setShowSaveModal,
}: {
  setShowSaveModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => setShowSaveModal(true)}
      className="bg-blue-500 hover:bg-blue-600 text-white w-auto md:w-24 py-1 px-4 text-sm flex items-center justify-center"
    >
      <span className="mr-2">Save</span> <Save className="w-4 h-4" />
    </Button>
  );
}

function WritePage({ params }: { params?: { id: string } }) {
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
    createJournal.bind(null, user?._id || ""),
    createJournalInitialState
  );
  const [showWordStats, setShowWordStats] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null); // New error state
  const [showTitle, setShowTitle] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorySelectIsOpen, setCategorySelectIsOpen] =
    useState<boolean>(false);
  const [shouldFavorite, setShouldFavorite] = useState(false);
  const { quill, quillRef } = useQuill({
    modules: {
      magicUrl: true,
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ align: [] }],

        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],

        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [
          "link",
          // "image",
          // "video"
        ],
        [{ color: [] }, { background: [] }],

        ["clean"],
      ],
    },
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [isWordStatsModalOpen, setIsWordStatsModalOpen] = useState(false);

  const { theme } = useTheme(); // Use the useTheme hook to get the theme

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML("");
    }
  }, [quill]);

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
        return acc + journal.entry.trim().split(/\s+/).filter(Boolean).length;
      }, 0);
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

  // Add or update the useEffect to handle successful submission
  useEffect(() => {
    if (createJournalState.success) {
      setShowSaveModal(false);
      setJournal(""); // Clear the journal
      setTitle(""); // Clear the title
      setSelectedCategory(""); // Reset category
      setFavorite(false); // Reset favorite
    }
  }, [createJournalState.success]);

  useEffect(() => {
    if (quill) {
      quill.on("text-change", (delta, oldDelta, source) => {
        // Get text only
        // Get delta contents
        // Get innerHTML using quill
        setJournal(
          quill.root.innerHTML.replace(/'/g, "\\'").replace(/"/g, '\\"')
        );
      });
    }
  }, [quill, quillRef]);

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

      if (data.summary[0] === journal) {
        setSummaryError("The journal is too short to summarize.");
        return;
      }
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

  const handleJournalChange = (value: string) => {
    setJournal(value);
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

  // Create a wrapper function for the form action
  const handleSubmit = async (formData: FormData) => {
    try {
      await createJournalAction(formData);
    } catch (error) {
      console.error("Error submitting journal:", error);
    }
  };

  // Update the handleFinalSubmit function
  const handleFinalSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Get sentiment score for the journal entry
      const journalText = formData.get("entry") as string;
      const sanitizedJournalText = sanitizeHtml(journalText);

      const sentimentScore = analyzeSentiment(sanitizedJournalText).score;

      // Add sentiment score to form data
      formData.append("entry", sanitizedJournalText);
      formData.append("category", selectedCategory);
      formData.append("sentimentScore", sentimentScore.toString());

      createJournalAction(formData);
    } catch (error) {
      console.error("Error submitting journal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new useEffect to handle journal fetching
  useEffect(() => {
    if (params?.id && user?.journals) {
      const existingJournal = user.journals.find((j) => j._id === params.id);
      if (existingJournal) {
        // Populate the form with existing journal data
        setTitle(existingJournal.title || "");
        const decodedJournal = decodeHtmlEntities(existingJournal.entry);

        if (quill) {
          quill.clipboard.dangerouslyPasteHTML(decodedJournal);
        }
        setJournal(decodedJournal);
        setFavorite(existingJournal.favorite || false);

        // Handle categories if they exist
        if (
          existingJournal.categories &&
          existingJournal.categories.length > 0
        ) {
          setSelectedCategories(
            existingJournal.categories.map((c) => c.category)
          );
        }
      }
    }
  }, [params?.id, user?.journals, quill]);

  return (
    <DashboardContainer isSidebarOpen={isSidebarOpen}>
      {user && !user.isVerified ? (
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
      ) : (
        <div className="flex h-full min-h-screen mt-16">
          {/* Sidebar - only visible on md screens and above */}
          <Sidebar
            isOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            icon={<ChartNoAxesColumnIncreasing size={20} />}
            headerDisplaysTabs={false}
            theme={theme as "dark" | "light"} // Add the theme prop here
            sections={[
              {
                title: "Word Stats",
                content: (
                  <div className="mt-2 text-sm  text-gray-600">
                    <p>
                      <span className="font-medium">Total Words:</span>{" "}
                      {totalWords}
                    </p>
                    <p>
                      <span className="font-medium ">
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
            className={`flex-1 p-6 pb-24 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "md:ml-56" : "md:ml-24"
            }`}
          >
            {/* Journal writing section */}
            <div className=" flex justify-center w-full max-w-6xl ml-auto mr-auto">
              <div className="w-full md:w-3/4">
                <div className="flex justify-between items-center">
                  {" "}
                  {/* Flex container for alignment */}
                  <h1 className="text-xl">Edit</h1>
                  <div className="flex flex-col items-center mb-2">
                    {" "}
                    {/* Container for label and scroll component */}
                    <div className="flex items-center ">
                      {/* <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger
                        asChild
                        className="border h-full w-7 p-1  rounded-tl rounded-bl cursor-pointer"
                      >
                        {shouldFavorite ? (
                          <StarFilledIcon
                            onClick={() => setShouldFavorite(false)}
                            className="w-4 h-4"
                          />
                        ) : (
                          <StarIcon
                            onClick={() => setShouldFavorite(true)}
                            className="w-2 h-2"
                          />
                        )}
                      </TooltipTrigger>
                      <TooltipContent
                        className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
                        sideOffset={4}
                      >
                        Favorite

                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider> */}

                      {/* <Popover.Root
                    open={categorySelectIsOpen}
                    onOpenChange={setCategorySelectIsOpen}
                  >
                    <Popover.Trigger asChild>
                      <button
                        style={{
                          border: "1px solid var(--border-gray-200)",
                          borderLeft: "none",
                        }}
                        className="flex pl-2 pr-2 items-center justify-center text-sm h-7 border  rounded-tr rounded-br m-0 box-border"
                      >
                        Categorize <ChevronDownIcon className="ml-1 w-4 h-4" />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        className="bg-white rounded-md shadow-lg border border-gray-200 w-[200px] z-50"
                        sideOffset={5}
                        align="end"
                      >
                        <div className="font-bold px-4 py-3 text-sm border-b border flex justify-between items-center">
                          Categories
                          <button
                            onClick={() => setCategorySelectIsOpen(false)}
                            className="hover:bg-gray-100 p-1 rounded-sm"
                          >
                            <Cross1Icon className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="max-w-full">
                          {categories
                            .filter((cat) => cat.category !== "All")
                            .map((category, index) => (
                              <button
                                key={index}
                                className="break-words px-4 py-3 text-sm text-left hover:bg-gray-100 rounded-sm flex items-center justify-between min-w-0"
                                onClick={() => {
                                  setSelectedCategory(category.category);
                                  setCategorySelectIsOpen(false);
                                }}
                              >
                                <span className="overflow-wrap-anywhere">
                                  {category.category}
                                </span>
                                {selectedCategory === category.category && (
                                  <CheckIcon className="w-4 h-4 flex-shrink-0 ml-2" />
                                )}
                              </button>
                            ))}
                          <button
                            onClick={() => {
                              setIsAddingCategory(true);
                              setCategorySelectIsOpen(false);
                            }}
                            className="w-full px-4 py-3 text-sm text-left hover:bg-gray-100 border-t border-gray-200 flex items-center text-blue-500"
                          >
                            <PlusIcon className="w-4 h-4 flex-shrink-0 mr-2" />
                            <span className="break-words flex-1 min-w-0">
                              Create new
                            </span>
                          </button>
                        </div>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root> */}
                      {/* <Label htmlFor="category" className="mb-1">
                    Categorize it?{" "}
                    <span className="text-gray-400 text-sm font-normal">
                      (optional)
                    </span>
                  </Label>

                  <select
                    id="category"
                    name="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-[200px]"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.category}>
                        {category.category}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-2 mt-2">
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
                  </div> */}
                    </div>
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
                      className="rounded-b-none outline-none"
                      focusVisible={false}
                    />
                  </div>
                  <div className="flex flex-col mb-4">
                    {/* <Label htmlFor="journal" className="mb-1">
                  Journal Entry
                </Label> */}
                    {/* <div className="h-80 mb-24">
                  <ReactQuill
                    theme="snow"
                    value={journal}
                    onChange={handleJournalChange}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Write your journal entry here..."
                    className={`h-full`}
                  />
                </div> */}
                    <div
                      style={{
                        width: "100%",
                        maxHeight: "500px",
                        overflow: "auto",
                      }}
                    >
                      <div ref={quillRef} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsWordStatsModalOpen(true)}
                      className="mb-6 text-[11px] text-black/80 flex items-center self-end hover:text-black bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                    >
                      <ChartNoAxesColumnIncreasing className="w-3 h-3 mr-1" />
                      View Word Stats
                    </button>
                    <div className="mt-2 fixed top-20 right-10 w-auto mb-4">
                      <Button
                        type="button"
                        onClick={generateSampleText}
                        className="bg-gray-500"
                      >
                        Generate
                      </Button>
                    </div>

                    <div className="space-y-4 flex flex-col">
                      <div className="flex flex-col">
                        {/* <Label htmlFor="category" className="mb-1">
                      Categorize it?{" "}
                      <span className="text-gray-400 text-sm font-normal">
                        (optional)
                      </span>
                    </Label>

                    <select
                      id="category"
                      name="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-[200px]"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.category}>
                          {category.category}
                        </option>
                      ))}
                    </select> */}
                      </div>
                      {/* <div className="flex items-center space-x-2">
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
                  </div> */}

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
                                  category.toLowerCase() ===
                                  newName.toLowerCase()
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
                    {/* <div className="flex items-center">
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
                </div> */}
                    <div className="flex items-center justify-start space-y-2 md:space-y-0 md:space-x-2">
                      <div className="flex flex-col md:flex-row md:space-x-2 w-full space-y-2 md:space-y-0">
                        <SubmitButton setShowSaveModal={setShowSaveModal} />
                        <Button
                          type="button"
                          onClick={summarizeJournal}
                          className="bg-purple-500 hover:bg-purple-600 text-white w-auto md:w-auto md:min-w-[10rem] py-1 text-sm"
                        >
                          <div className="flex items-center justify-center gap-1 mx-auto">
                            <span>
                              {isSummarizing
                                ? "Summarizing..."
                                : "Generate Summary"}
                            </span>
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="w-4 h-4 text-white/80 hover:text-white" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="bg-gray-800 text-white p-2 rounded-md shadow-lg z-50 max-w-xs"
                                >
                                  <p className="text-sm leading-relaxed">
                                    Summarize your journal entry into fewer
                                    sentences.
                                  </p>
                                  <p className="text-xs leading-relaxed text-gray-300">
                                    You can also tweet the summary directly!
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </Button>
                      </div>
                    </div>
                    {showSuccessMessage && createJournalState.success && (
                      <div className="flex items-center mt-2">
                        <CheckCircle className="text-green-500 mr-2" />
                        <p className="text-green-500">
                          Entry created successfully!
                        </p>
                      </div>
                    )}
                    {/* Word Stats link and modal for small screens */}
                    <div className="md:hidden mt-2 flex justify-end">
                      <Dialog
                        open={isWordStatsModalOpen}
                        onOpenChange={setIsWordStatsModalOpen}
                      >
                        <DialogContent className="sm:max-w-[425px] w-[95vw] mx-auto">
                          <DialogHeader>
                            <DialogTitle>Word Stats</DialogTitle>
                          </DialogHeader>
                          <div className="mt-2 space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="font-medium text-sm">
                                Total Words
                              </span>
                              <span>{totalWords}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="font-medium text-sm">
                                Average Words Per Journal
                              </span>
                              <span>{averageWords}</span>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              onClick={() => setIsWordStatsModalOpen(false)}
                              className="w-14 mt-4 bg-black text-white hover:bg-gray-700 p-1 inline-flex items-center justify-center"
                            >
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Summary Dialog */}
          <SummaryModal
            isOpen={isSummaryModalOpen}
            onOpenChange={setIsSummaryModalOpen}
            summary={summary}
            onTweet={handleTweet}
            error={summaryError} // Pass the error to the dialog
          />

          {/* Save Modal */}
          <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
            <DialogContent className="sm:max-w-[475px]">
              <DialogHeader>
                <DialogTitle>Optional Settings</DialogTitle>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleFinalSubmit(formData);
                }}
              >
                <div className="grid gap-4 py-4 mb-6">
                  {/* Category Selection */}
                  <div className="space-y-2 mb-2">
                    <Label htmlFor="category" className="text-sm">
                      Categorize
                      {/* <span className="text-gray-400 text-xs font-normal">
                    (optional)
                  </span> */}
                    </Label>
                    <MultiSelect
                      options={categories.map((cat) => ({
                        value: cat.category,
                        label: cat.category,
                      }))}
                      selectedValues={selectedCategories}
                      onChange={setSelectedCategories}
                      placeholder="Select categories..."
                      className="overflow-wrap-anywhere text-sm"
                    />
                  </div>

                  {/* Favorite Toggle */}
                  <div className="flex items-center space-x-3">
                    <Label htmlFor="favorite" className="cursor-pointer">
                      Favorite this entry?
                    </Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="favorite-no"
                          name="favorite"
                          value="false"
                          checked={!favorite}
                          onChange={() => setFavorite(false)}
                          className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="favorite-no"
                          className="ml-2 text-sm text-gray-600"
                        >
                          No
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="favorite-yes"
                          name="favorite"
                          value="true"
                          checked={favorite}
                          onChange={() => setFavorite(true)}
                          className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="favorite-yes"
                          className="ml-2 text-sm text-gray-600"
                        >
                          Yes
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Hidden inputs to carry over the title and entry */}
                  <input type="hidden" name="title" value={title} />
                  <input type="hidden" name="entry" value={journal} />
                </div>

                <DialogFooter className="flex justify-start">
                  <div className="w-full flex flex-col xs:flex-row gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-8 py-4"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <Spinner className="mr-2 h-4 w-4" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        "Save"
                      )}
                    </Button>{" "}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSaveModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 cursor-pointer px-8 py-4"
                    >
                      Cancel
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardContainer>
  );
}

export default WritePage;
