"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Save,
  ChevronUpIcon, // Add this import
  AlertCircle,
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
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import DashboardContainer from "@/components/ui/DashboardContainer/DashboardContainer";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { MonitorIcon, MaximizeIcon, Minimize2, Maximize2 } from "lucide-react";
import { Eye } from "lucide-react"; // Add this import
import { ViewToggle } from "@/components/ui/ViewToggle/ViewToggle";
import debounce from "lodash/debounce";
import WordStatsModal from "./components/WordStatsModal";
import SaveJournalModal from "./components/SaveJournalModal";
import PreviewModal from "./components/PreviewModal";
import StorageAccessWarningModal from "./components/StorageAccessWarningModal";
import NoContentWarningModal from "./components/NoContentWarningModal";

interface IAutoSaveState {
  title: string;
  journal: string;
  lastSaved: Date;
}

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
      className={`w-auto md:w-10 text-white py-1 px-2 text-sm flex items-center justify-center ${
        disabled
          ? "bg-blue-300 hover:bg-blue-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      <Save className="w-4 h-4" />
    </Button>
  );
}

// Add new PublishButton component
function PublishButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className={`text-white w-auto md:w-auto py-1 px-4 text-sm flex items-center justify-center ${
        disabled
          ? "bg-green-300 hover:bg-green-300 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600"
      }`}
    >
      <span className="mr-2">Publish</span>
      <FileText className="w-4 h-4" />
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
  const [contentWidth, setContentWidth] = useState<"default" | "full">(
    "default"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Inside WritePage component, add this state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // Add this state to track the previous width setting
  const [previousWidth, setPreviousWidth] = useState<"default" | "full">(
    "default"
  );
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
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showStorageWarning, setShowStorageWarning] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  const [showNoContentWarning, setShowNoContentWarning] = useState(false);
  const [showAutoSavePrompt, setShowAutoSavePrompt] = useState(false);
  const [hasUserRespondedToAutoSave, setHasUserRespondedToAutoSave] =
    useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Add this media query hook
  const isLargeScreen = useMediaQuery("(min-width: 1245px)");

  // Add this media query hook near your other hooks
  const showSidebar = useMediaQuery("(min-width: 1012px)");

  // Add function to save to database
  const saveToDatabase = useCallback(async () => {
    if (!journal.trim()) return;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("entry", journal);
      formData.append("category", selectedCategories.join(","));

      await createJournalAction(formData);

      // Clear autosave data after successful save
      localStorageService.removeItem("journalAutoSave");
    } catch (error) {
      console.error("Error saving to database:", error);
    }
  }, [journal, title, selectedCategories, createJournalAction]);

  const isExtraSmallScreen = useMediaQuery("(max-width: 360px)");

  const handleAutoSaveResponse = (shouldRestore: boolean) => {
    setHasUserRespondedToAutoSave(true);
    setShowAutoSavePrompt(false);

    if (shouldRestore) {
      const savedData =
        localStorageService.getItem<IAutoSaveState>("journalAutoSave");
      if (savedData) {
        setTitle(savedData.title);
        if (quill) {
          quill.clipboard.dangerouslyPasteHTML(savedData.journal);
        }
        setLastSavedTime(new Date(savedData.lastSaved));
      }
    } else {
      // Clear autosaved content if user declines
      localStorageService.removeItem("journalAutoSave");
    }

    // Save user preference
    localStorageService.setItem("hasRespondedToAutoSave", "true");
  };

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
          sanitizeHtml(
            quill.root.innerHTML.replace(/'/g, "\\'").replace(/"/g, '\\"')
          )
        );
      });
    }
  }, [quill, quillRef]);

  useEffect(() => {
    const checkStorage = () => {
      try {
        localStorageService.setItem("test", "test");
        localStorageService.removeItem("test");
      } catch (e) {
        setShowStorageWarning(true);
      }
    };

    checkStorage();
  }, []);

  // Update the saveToStorage function
  const saveToStorage = useCallback((data: IAutoSaveState) => {
    try {
      console.log("Saving to storage:", data);
      localStorageService.setItem("journalAutoSave", data);
      setLastSavedTime(new Date());
      setIsAutosaving(false);
      console.log("Saved to storage:", data);

      // Show "Saved!" message
      setShowSavedMessage(true);

      // Hide "Saved!" message after 2 seconds
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving to storage:", error);
      setIsAutosaving(false);
    }
  }, []);

  // 1. First, update the debouncedSave definition
  const debouncedSave = useCallback(
    (data: IAutoSaveState) => {
      const save = () => {
        setIsAutosaving(true);
        saveToStorage(data);
      };
      debounce(save, 1000)();
    },
    [saveToStorage]
  );

  // Updated summarizeJournal function
  const summarizeJournal = async () => {
    if (!journal.trim()) {
      setShowNoContentWarning(true);
      return;
    }

    setIsSummarizing(true);
    setSummaryError(null);
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
    console.log(plainText);
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
    setSaveStatus("loading");
    setSaveError(null);

    try {
      const journalText = formData.get("entry") as string;
      const sanitizedJournalText = sanitizeHtml(journalText);
      const sentimentScore = analyzeSentiment(sanitizedJournalText).score;

      formData.append("category", selectedCategory);
      formData.append("sentimentScore", sentimentScore.toString());

      await createJournalAction(formData);
      setSaveStatus("success");

      // Close modal and reset form after 1.5 seconds on success
      setTimeout(() => {
        setShowSaveModal(false);
        setJournal("");
        setTitle("");
        setSelectedCategory("");
        setFavorite(false);
        setSaveStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Error submitting journal:", error);
      setSaveStatus("error");
      setSaveError(
        error instanceof Error ? error.message : "Failed to save journal"
      );
    }
  };

  // Update the autosave effect
  useEffect(() => {
    if (!autoSaveEnabled || (!journal.trim() && !title.trim())) {
      return;
    }

    // Set autosaving state
    setIsAutosaving(true);

    // Create the timeout for saving
    const saveTimeout = setTimeout(() => {
      debouncedSave({
        title,
        journal,
        lastSaved: new Date(),
      });
    }, 500);

    // Reset inactivity timer
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      if (journal.trim() || title.trim()) {
        saveToDatabase();
      }
    }, INACTIVITY_TIMEOUT);

    // Cleanup function
    return () => {
      clearTimeout(saveTimeout);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [
    journal,
    title,
    autoSaveEnabled,
    debouncedSave,
    INACTIVITY_TIMEOUT,
    saveToDatabase,
  ]); // Only include necessary dependencies

  // Modify the autosave effect to directly load saved content without showing modal
  useEffect(() => {
    const hasResponded = localStorageService.getItem<string>(
      "hasRespondedToAutoSave"
    );
    if (!hasResponded) {
      const savedData =
        localStorageService.getItem<IAutoSaveState>("journalAutoSave");
      if (savedData && (savedData.title || savedData.journal)) {
        setShowAutoSavePrompt(true);
      }
    }
  }, []);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Add the preview button near your other action buttons

  // Add this function to handle storage availability
  const getAvailableStorage = () => {
    try {
      localStorageService.setItem("test", "test");
      localStorageService.removeItem("test");
      return localStorageService;
    } catch {
      return null;
    }
  };

  // Add to your JSX, perhaps near the save button
  return isLoading ? (
    <div className="flex justify-center items-center min-h-screen h-screen">
      <Spinner />
    </div>
  ) : user && !user.isVerified ? (
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
    <DashboardContainer
      isSidebarOpen={isSidebarOpen && showSidebar}
      sidebar={
        showSidebar ? (
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
        ) : undefined
      }
      bottomBar={
        isExtraSmallScreen ? (
          <div className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-center z-[500] shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  {/* <Settings className="h-5 w-5" /> */}
                  <ChevronUpIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto m-4 mb-0">
                <div className="pt-6 min-h-[15rem]">
                  <h3 className="text-lg font-semibold mb-4">Data</h3>
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : undefined
      }
    >
      <div
        className={cn(
          "flex-1  overflow-y-auto flex flex-col transition-all duration-300 ease-in-out",
          isFullscreen
            ? "fixed inset-0 z-50 bg-white"
            : isSidebarOpen
            ? "md:ml-0"
            : "md:ml-0"
        )}
      >
        <div
          className={cn(
            "flex justify-center w-full ml-auto mr-auto transition-all duration-300",
            contentWidth === "default" ? "max-w-6xl" : "max-w-[95%]"
          )}
        >
          <div
            className={cn(
              "w-full transition-all duration-300",
              contentWidth === "default"
                ? "md:max-w-[51.0625rem]"
                : "md:max-w-full"
            )}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
              <h1 className="text-xl">Write anything</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="autosave" className="text-sm text-gray-600">
                    Autosave
                  </Label>
                  <input
                    type="checkbox"
                    id="autosave"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="hidden sm:block">
                  <ViewToggle
                    isFullscreen={isFullscreen}
                    contentWidth={contentWidth}
                    showDefaultWidth={isLargeScreen}
                    showFullWidth={isLargeScreen}
                    onToggle={(value) => {
                      if (value === "fullscreen") {
                        setPreviousWidth(contentWidth);
                        toggleFullscreen();
                      } else if (isFullscreen) {
                        toggleFullscreen();
                        setContentWidth(previousWidth);
                      } else {
                        setContentWidth(value as "default" | "full");
                      }
                    }}
                  />
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
              {showAutoSavePrompt && (
                <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">
                          Restore Previous Content?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          We found some previously saved content. Would you like
                          to restore it?
                          <span className="block mt-1 text-xs text-gray-500">
                            You can manage auto-save settings in your
                            preferences.
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoSaveResponse(false)}
                        className="text-sm"
                      >
                        Ignore
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAutoSaveResponse(true)}
                        className="text-sm"
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
                      onClick={() => setIsPreviewOpen(true)}
                      className="text-[11px] text-black/80 flex items-center hover:text-black bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                      disabled={!journal.trim()}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </button>

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
                      <PublishButton disabled={!journal.trim()} />
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
                <WordStatsModal
                  isOpen={isWordStatsModalOpen}
                  onOpenChange={setIsWordStatsModalOpen}
                  totalWords={totalWords}
                  averageWords={averageWords}
                />
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
        <SaveJournalModal
          isOpen={showSaveModal}
          onOpenChange={setShowSaveModal}
          onSubmit={saveToDatabase}
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          favorite={favorite}
          onFavoriteChange={setFavorite}
          title={title}
          journal={journal}
          saveStatus={saveStatus}
          saveError={saveError}
          onClose={() => setShowSaveModal(false)}
        />
        {/*Preview Dialog  */}
        <PreviewModal
          isOpen={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          title={title}
          journal={journal}
        />

        {/*  */}
        <StorageAccessWarningModal
          open={showStorageWarning}
          onOpenChange={setShowStorageWarning}
        />
        {/* Update the autosave indicator */}
        <div className="fixed bottom-4 right-4 flex items-center gap-2 text-sm">
          {isAutosaving ? (
            <span className="flex items-center text-gray-500">
              <Spinner className="w-3 h-3 mr-2" />
              Saving...
            </span>
          ) : showSavedMessage ? (
            <span className="flex items-center text-green-500 font-medium">
              <CheckCircle className="w-3 h-3 mr-2" />
              Saved!
            </span>
          ) : lastSavedTime ? (
            <span className="text-gray-500">
              Last saved: {lastSavedTime.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
        <NoContentWarningModal
          isOpen={showNoContentWarning}
          onOpenChange={setShowNoContentWarning}
        />
      </div>
    </DashboardContainer>
  );
}

export default WritePage;
