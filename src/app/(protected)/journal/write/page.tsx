"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuth } from "@/hooks/useAuth";
import { useJournal } from "@/hooks/useJournal";
import { IJournal, ICategory } from "@/lib/interfaces";
import {
  sanitizeHtml,
  getPlainTextFromHtml,
  decodeHtmlEntities,
} from "@/lib/utils";
// import { useRouter } from "next/navigation";
import {
  CheckCircle,
  ChartNoAxesColumnIncreasing,
  HelpCircle,
  Save, // Add this import
} from "lucide-react";
import { UNTITLED_JOURNAL } from "@/lib/constants";
import { localStorageService } from "@/lib/services/localStorageService";
import { Spinner } from "@/components/ui/Spinner"; // Import a spinner component if you have one
// import { IFrontEndJournal } from "@/app/(protected)/dashboard/UserDashboard";
import { useFormState, useFormStatus } from "react-dom";
import { ICreateJournalState } from "./types";
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
import SummaryDialog from "@/components/SummaryDialog";
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
import "./styles.css";
import Quill from "quill";
import MagicUrl from "quill-magic-url";
Quill.register("modules/magicUrl", MagicUrl);
import { MultiSelect } from "@/components/ui/MultiSelect/MutliSelect";
// Dynamically import ReactQuill to avoid SSR issues
import "./styles.css";
import styles from "./styles.module.css";
import { FileText, Download } from "lucide-react"; // Add these imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const createJournalInitialState: ICreateJournalState = {
  message: "",
  errors: {},
  success: false,
  user: null,
};

// Create a new SubmitButton component
function SubmitButton({
  setShowSaveModal,
  disabled,
}: {
  setShowSaveModal: React.Dispatch<React.SetStateAction<boolean>>;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="button"
      disabled={disabled || pending}
      onClick={() => setShowSaveModal(true)}
      className={` text-white w-auto md:w-24 py-1 px-4 text-sm flex items-center justify-center ${
        disabled
          ? "bg-blue-300 hover:bg-blue-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      <span className="mr-2">Save</span> <Save className="w-4 h-4" />
    </Button>
  );
}

function WritePage({ children }: { children: React.ReactNode }) {
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
        handleJournalChange(
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
    const plainText = getPlainTextFromHtml(value);
    if (plainText.trim() === "") {
      setJournal("");
    } else {
      setJournal(value);
    }
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
      formData.append("category", selectedCategory);
      formData.append("sentimentScore", sentimentScore.toString());
      createJournalAction(formData);
    } catch (error) {
      console.error("Error submitting journal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Add this helper function
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Add this function inside WritePage component, before the return statement
  const handleExport = async (format: "pdf" | "docx") => {
    try {
      const response = await fetch("/api/user/entry/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content: journal,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || UNTITLED_JOURNAL}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting document:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-grey-100">
      {/* Sidebar - only visible on md screens and above */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        icon={<ChartNoAxesColumnIncreasing size={20} />}
        headerDisplaysTabs={false}
        sections={[
          {
            title: "Word Stats",
            content: (
              <div className="mt-2 text-sm  text-gray-600">
                <p>
                  <span className="font-medium">Total Words:</span> {totalWords}
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
        className={`flex-1 p-6 pb-24 pt-16 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-56" : "md:ml-24"
        }`}
      >
        <div className=" flex justify-center w-full max-w-6xl ml-auto mr-auto">
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center">
              {" "}
              {/* Flex container for alignment */}
              <h1 className="text-xl">Write anything</h1> {/* Title */}
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
                <div
                  style={{
                    width: "100%",
                    maxHeight: "500px",
                    overflow: "auto",
                  }}
                >
                  <div ref={quillRef} />
                </div>
                <div className="flex justify-between items-center mb-6">
                  {/* Export and Word Stats buttons on the left */}
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-[11px] text-black/80 flex items-center hover:text-black bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="bg-white p-0"
                      >
                        <DropdownMenuItem className="p-0 text-xs">
                          <Button
                            type="button"
                            onClick={() => handleExport("pdf")}
                            className="w-full justify-start hover:bg-gray-100 transition-colors duration-200 text-xs"
                          >
                            Export as PDF
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-0">
                          <Button
                            type="button"
                            onClick={() => handleExport("docx")}
                            className="w-full justify-start hover:bg-gray-100 transition-colors duration-200 text-xs"
                          >
                            Export as DOCX
                          </Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                      type="button"
                      onClick={() => setIsWordStatsModalOpen(true)}
                      className="text-[11px] text-black/80 flex items-center hover:text-black bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                    >
                      <ChartNoAxesColumnIncreasing className="w-3 h-3 mr-1" />
                      View Word Stats
                    </button>
                  </div>
                </div>

                <div className="space-y-4 flex flex-col">
                  <div className="flex items-center justify-start space-y-2 md:space-y-0 md:space-x-2">
                    <div className="flex flex-col md:flex-row md:space-x-2 w-full space-y-2 md:space-y-0">
                      <SubmitButton
                        setShowSaveModal={setShowSaveModal}
                        disabled={!journal.trim()}
                      />
                      <Button
                        type="button"
                        disabled={!journal.trim()}
                        onClick={summarizeJournal}
                        className={`text-white w-auto md:w-auto md:min-w-[10rem] py-1 text-sm ${
                          !journal.trim()
                            ? "cursor-not-allowed bg-purple-300 hover:bg-purple-300"
                            : "bg-purple-500 hover:bg-purple-600"
                        }`}
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
                                className="bg-gray-800 text-white p-2 rounded-md shadow-lg z-50 max-w-xs opacity-1"
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

        {/* Summary Dialog */}
        <SummaryDialog
          isOpen={isSummaryModalOpen}
          onOpenChange={setIsSummaryModalOpen}
          summary={summary}
          onTweet={handleTweet}
          error={summaryError} // Pass the error to the dialog
        />

        {/* Save Modal */}
        <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
          <DialogContent className="sm:max-w-[475px] px-8">
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

                {/* Hidden inputs to carry over the title and entry */}
                <input type="hidden" name="title" value={title} />
                <input type="hidden" name="entry" value={journal} />
              </div>

              <DialogFooter className="flex justify-start">
                <div className="w-full flex  xs:flex-row gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-6 py-1 ${styles["save-modal-button"]}`}
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
                    className={`bg-gray-100 hover:bg-gray-200 cursor-pointer px-6 py-1 ${styles["save-modal-button"]}`}
                  >
                    Cancel
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default WritePage;
