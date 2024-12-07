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
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  ChartNoAxesColumnIncreasing,
  HelpCircle,
  Save,
  ChevronUpIcon, // Add this import
  AlertCircle,
  Settings,
  ChevronRightIcon,
  Volume2,
  XCircle,
  Copy,
  ChevronDown,
  RefreshCw,
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
import SummaryModal from "./components/SummaryModal";
import { cn } from "@/lib/utils"; // Make sure you have this utility function
import { generateLoremIpsum } from "@/lib/utils"; // Add this import
import StorageControls from "./components/StorageControls";
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
import DashboardContainer from "@/components/ui/__layout__/DashboardContainer/DashboardContainer";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { MonitorIcon, MaximizeIcon, Minimize2, Maximize2 } from "lucide-react";
import { Eye } from "lucide-react"; // Add this import
import { ViewToggle } from "@/components/ui/ViewToggle/ViewToggle";
import debounce from "lodash/debounce";
import WordStatsModal from "./components/WordStatsModal";
import SaveJournalModal from "./components/SaveJournalModal/SaveJournalModal";
import PreviewModal from "./components/PreviewModal";
import StorageAccessWarningModal from "./components/StorageAccessWarningModal";
import NoContentWarningModal from "./components/NoContentWarningModal";
import SettingsModal from "./components/SettingsModal";
import { Switch } from "@/components/ui/Switch";
import { useTheme } from "next-themes";
import PublishButton from "./components/PublishButton";
import { XIcon } from "@/components/icons/XIcon";
import { PageContainer } from "@/components/ui/__layout__/PageContainer/PageContainer";
import DebugState from "@/components/ui/__debug__/State";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { updateUserPreferences } from "@/actions/updateUserPreferences"; // You'll need to create this
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link"; // Add this import at the top

interface IAutoSaveState {
  title: string;
  journal: string;
  categories: string[];
  lastSaved: Date;
}

const createJournalInitialState: ICreateJournalState = {
  message: "",
  errors: {},
  success: false,
  user: null,
};

// Add these types
type VoiceOption = {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  gender: string;
};

// Add this new component near your other modal components
const ResetConfirmationModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="dark:bg-white dark:bg-opacity-50" />
      <DialogContent className="sm:max-w-[425px] w-[95vw] mx-auto bg-white dark:bg-black dark:border-gray-800 dark:text-white">
        <DialogHeader>
          <DialogTitle>Reset Everything?</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This will clear all your current content and delete any locally
            stored drafts. This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="w-auto"
            >
              Reset
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function WritePage({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, setIsLoading, setUser } = useAuth();
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
  const [autoRestore, setAutoRestore] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("autoRestore");
      return saved === null ? true : JSON.parse(saved);
    }
    return true;
  });
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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showLastSaved, setShowLastSaved] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showLastSaved");
      return saved === null ? true : JSON.parse(saved);
    }
    return true;
  });
  const { theme } = useTheme();

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isJournalSpeaking, setIsJournalSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [showStorageDisabledWarning, setShowStorageDisabledWarning] =
    useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

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
      formData.append("favorite", favorite.toString());

      await createJournalAction(formData);

      // Clear autosave data after successful save
      localStorageService.removeItem("journalAutoSave");
    } catch (error) {
      console.error("Error saving to database:", error);
    }
  }, [journal, title, selectedCategories, favorite, createJournalAction]);

  const isExtraSmallScreen = useMediaQuery("(max-width: 360px)");

  // Add this effect near your other useEffect hooks
  useEffect(() => {
    if (isLoading && user) {
      setIsLoading(false);
    } else if (!user) {
      router.push("/login");
    }
  }, [user, isLoading, setIsLoading, router]);

  // Effect for initial data restoration (title and preference check)
  useEffect(() => {
    const autoSavePreference = localStorageService.getItem<{
      hasResponded: boolean;
      shouldRestore: boolean;
      timestamp: string;
    }>("autoSavePreference");

    const savedData =
      localStorageService.getItem<IAutoSaveState>("journalAutoSave");

    if (
      !autoSavePreference &&
      savedData &&
      (savedData.title || savedData.journal)
    ) {
      // Show prompt if user hasn't made a choice yet
      setShowAutoSavePrompt(true);
    } else if (
      (autoSavePreference?.shouldRestore || autoRestore) &&
      savedData
    ) {
      // Restore content if either the user previously chose to restore or autoRestore is enabled
      setTitle(savedData.title);
      setLastSavedTime(new Date(savedData.lastSaved));
      if (savedData.journal) {
        setJournal(savedData.journal);
      }
    }
  }, [autoRestore]); // Add autoRestore to dependencies

  // Separate effect for Quill content restoration
  useEffect(() => {
    if (!quill) return;

    // Add a small delay to ensure Quill is fully initialized
    const timer = setTimeout(() => {
      const autoSavePreference = localStorageService.getItem<{
        hasResponded: boolean;
        shouldRestore: boolean;
        timestamp: string;
      }>("autoSavePreference");

      if (autoSavePreference?.shouldRestore) {
        const savedData =
          localStorageService.getItem<IAutoSaveState>("journalAutoSave");
        if (savedData?.journal) {
          quill.root.innerHTML = savedData.journal;
          quill.setSelection(quill.getLength(), 0);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [quill]); // Run when Quill is initialized

  // Also update the text-change effect to properly handle content changes
  useEffect(() => {
    if (!quill) return;

    const handleChange = () => {
      const content = quill.root.innerHTML;
      setJournal(content);
    };

    quill.on("text-change", handleChange);

    return () => {
      quill.off("text-change", handleChange);
    };
  }, [quill]);

  // Update handleAutoSaveResponse
  const handleAutoSaveResponse = (shouldRestore: boolean) => {
    setHasUserRespondedToAutoSave(true);
    setShowAutoSavePrompt(false);

    // Save user preference with timestamp
    localStorageService.setItem("autoSavePreference", {
      hasResponded: true,
      shouldRestore,
      timestamp: new Date().toISOString(),
    });

    if (shouldRestore) {
      const savedData =
        localStorageService.getItem<IAutoSaveState>("journalAutoSave");
      if (savedData) {
        setTitle(savedData.title);
        if (quill) {
          setTimeout(() => {
            quill.root.innerHTML = savedData.journal;
            quill.setSelection(quill.getLength(), 0);
            setJournal(savedData.journal);
          }, 100);
        }
        setLastSavedTime(new Date(savedData.lastSaved));
      }
    } else {
      localStorageService.removeItem("journalAutoSave");
    }
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

  const handleCreateCategory = async (categoryName: string) => {
    // ... existing code ...

    // Reset error and success messages at the start of the function
    setCategoryCreatedErrorMessage(""); // Clear any existing error message
    setShowCreatedCategorySuccessIcon(false); // Hide success icon

    if (categoryName) {
      setIsCreatingCategoryLoading(true); // Show loading indicator

      const categoryExists = categories.some(
        ({ category }) => category.toLowerCase() === categoryName.toLowerCase()
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
              category: categoryName,
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

  // Add effect to persist autoRestore setting
  useEffect(() => {
    localStorage.setItem("autoRestore", JSON.stringify(autoRestore));
  }, [autoRestore]);

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
      // Clean the journal content before saving
      const cleanData = {
        ...data,
        journal: data.journal
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\"),
      };

      localStorageService.setItem("journalAutoSave", cleanData);
      setLastSavedTime(new Date());
      setIsAutosaving(false);

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

  // Add this effect to handle sidebar and viewport changes
  // TODO this doesn't seem to be running at all. Resizing doesn't trigger it.
  useEffect(() => {
    if (!showSidebar && isSidebarOpen && summary.length > 0) {
      // When viewport becomes small and sidebar is open
      setIsSummaryModalOpen(true);
      setIsSidebarOpen(false);
    } else if (showSidebar && isSummaryModalOpen && summary.length > 0) {
      // When viewport becomes large and modal is showing
      setIsSummaryModalOpen(false);
      setIsSidebarOpen(true);
    }
  }, [showSidebar, isSidebarOpen, isSummaryModalOpen, summary.length]);

  // Update the summarizeJournal function to be simpler
  const summarizeJournal = async () => {
    if (!(journal.trim() || title.trim())) {
      setShowNoContentWarning(true);
      return;
    }

    setIsSummarizing(true);
    setSummaryError(null);
    // Open sidebar immediately
    setIsSidebarOpen(true);

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

      // Decode HTML entities and remove escaped characters from each summary item
      const cleanedSummary = data.summary.map((item) =>
        decodeHtmlEntities(item)
          .replace(/\\n/g, " ")
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\/g, "")
      );

      setSummary(cleanedSummary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryError("An error occurred while generating the summary.");
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
        categories: selectedCategories,
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
    selectedCategories,
    INACTIVITY_TIMEOUT,
    saveToDatabase,
  ]); // Only include necessary dependencies

  // Update the autosave effect to handle content restoration
  useEffect(() => {
    if (!quill) return;

    const autoSavePreference = localStorageService.getItem<{
      hasResponded: boolean;
      shouldRestore: boolean;
      timestamp: string;
    }>("autoSavePreference");

    const savedData =
      localStorageService.getItem<IAutoSaveState>("journalAutoSave");

    if (autoSavePreference?.shouldRestore && savedData?.journal) {
      // Clean the content before restoring
      const cleanContent = savedData.journal
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");

      quill.root.innerHTML = cleanContent;
      quill.setSelection(quill.getLength(), 0);
      setJournal(cleanContent);
    }
  }, [quill]);

  // Also update the text-change effect
  useEffect(() => {
    if (!quill) return;

    const handleChange = () => {
      const content = quill.root.innerHTML
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
      setJournal(content);
    };

    quill.on("text-change", handleChange);

    return () => {
      quill.off("text-change", handleChange);
    };
  }, [quill]);

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

  // Add this effect to load voices
  useEffect(() => {
    const loadVoices = () => {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices().map((voice) => ({
        voice: voice,
        name: voice.name,
        lang: voice.lang,
        gender: voice.name.toLowerCase().includes("female") ? "Female" : "Male",
      }));
      setAvailableVoices(voices);
      // Set default voice
      if (voices.length > 0 && !selectedVoice) {
        setSelectedVoice(voices[0].name);
      }
    };

    loadVoices();
    // Some browsers need a little time to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  // Update your speakSummary function
  const speakSummary = useCallback(() => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(summary.join(". "));

    const selectedVoiceOption = availableVoices.find(
      (v) => v.name === selectedVoice
    );
    if (selectedVoiceOption) {
      utterance.voice = selectedVoiceOption.voice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    synth.speak(utterance);
  }, [summary, selectedVoice, availableVoices]);

  const cancelSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakJournal = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      // Get plain text from the journal HTML content
      const plainText = getPlainTextFromHtml(journal);

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = "en-US";

      utterance.onstart = () => setIsJournalSpeaking(true);
      utterance.onend = () => setIsJournalSpeaking(false);
      utterance.onerror = () => setIsJournalSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const cancelJournalSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsJournalSpeaking(false);
    }
  };

  // Add this cleanup effect
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Find the grid of action buttons and add this new button:

  // Add to your JSX, perhaps near the save button

  // Add this function to check storage availability
  const isStorageAvailable = (
    type: "localStorage" | "sessionStorage"
  ): boolean => {
    try {
      const storage = window[type];
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Add this effect to check storage and user preferences
  useEffect(() => {
    if (!user) return;

    const hasStorage =
      isStorageAvailable("localStorage") &&
      isStorageAvailable("sessionStorage");

    if (!hasStorage && !user.hasAcknowledgedStorageWarning) {
      setShowStorageDisabledWarning(true);
    }
  }, [user]);

  // Add this handler
  const handleAcknowledgeStorageWarning = async () => {
    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?._id,
          hasAcknowledgedStorageWarning: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      setShowStorageDisabledWarning(false);
    } catch (error) {
      console.error("Error updating user preferences:", error);
    }
  };

  // Add this new function to handle reset
  const handleReset = () => {
    // Clear form inputs
    setTitle("");
    setJournal("");
    setSelectedCategories([]);
    setFavorite(false);

    // Clear Quill editor
    if (quill) {
      quill.setText("");
    }

    // Clear local storage
    localStorageService.removeItem("journalAutoSave");
    localStorageService.removeItem("autoSavePreference");

    // Reset other relevant state
    setLastSavedTime(null);
    setSummary([]);
  };

  // Add this new function near your other API-calling functions
  const createNewCategory = async (categoryName: string) => {
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
            category: categoryName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create category");
      }

      // Update user and categories state with the new data
      setUser(data.data);
      setCategories(data.data.journalCategories);

      return data.data.journalCategories[
        data.data.journalCategories.length - 1
      ];
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  };

  // Add early return for loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Add early return for no user
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">
            Access Denied
          </h1>
          <p className="mb-4 dark:text-gray-300">
            Please{" "}
            <Link
              href="/login"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
            >
              sign in
            </Link>{" "}
            to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Add early return for unverified user
  if (!user.isVerified) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">
            Account Not Verified
          </h1>
          <p className="mb-4 dark:text-gray-300">
            Please verify your account to access the dashboard.
          </p>
          <Button
            onClick={() => {
              /* Add logic to resend verification email */
            }}
          >
            Resend Verification Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardContainer
      isSidebarOpen={isSidebarOpen && showSidebar}
      sidebar={
        showSidebar ? (
          <Sidebar
            isOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            icon={<ChevronRightIcon size={20} />}
            headerDisplaysTabs={false}
            width="wide"
            sections={[
              {
                title: "Summary",
                content: (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-100">
                    {isSummarizing ? (
                      <div className="flex items-center space-x-2">
                        <Spinner className="w-4 h-4" />
                        <span>Generating summary...</span>
                      </div>
                    ) : summary.length > 0 ? (
                      <>
                        <div className="text-gray-500 dark:text-gray-400 space-y-2 dark:bg-gray-800/50 rounded-lg p-4">
                          <div className="flex flex-col">
                            <div className="max-h-[300px] overflow-y-auto mb-4">
                              {summary.map((paragraph, index) => (
                                <p key={index} className="leading-relaxed mb-2">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              {availableVoices.length > 0 && (
                                <Select
                                  value={selectedVoice}
                                  onValueChange={setSelectedVoice}
                                >
                                  <SelectTrigger className="h-8 w-[180px]">
                                    <SelectValue placeholder="Select voice" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <div className="max-h-[300px] overflow-y-auto">
                                      {availableVoices.map((voice) => (
                                        <SelectItem
                                          key={voice.name}
                                          value={voice.name}
                                        >
                                          {voice.name} ({voice.gender})
                                        </SelectItem>
                                      ))}
                                    </div>
                                  </SelectContent>
                                </Select>
                              )}

                              {isSpeaking ? (
                                <button
                                  onClick={cancelSpeech}
                                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-red-500 hover:text-red-600"
                                  title="Stop speaking"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={speakSummary}
                                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                  title="Read summary aloud"
                                  disabled={!selectedVoice}
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  clipboard.copy(summary.join("\n\n"));
                                }}
                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors ml-auto"
                                title="Copy summary"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleTweet}
                          className="mt-4 w-auto bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                          size="sm"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <XIcon />
                            Post
                          </div>
                        </Button>
                      </>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        No summary generated yet.
                      </p>
                    )}
                  </div>
                ),
              },
            ]}
          />
        ) : undefined
      }
      bottomBar={
        user && user.isVerified && isExtraSmallScreen ? (
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
          "flex-1 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out md:ml-0",
          isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-black" : ""
        )}
      >
        <DebugState
          position="bottom-right"
          state={{
            isSidebarOpen,
            contentWidth,
            previousWidth,
            isFullscreen,
            sentenceCount: journal
              .split(/[.!?]+/)
              .filter((sentence) => sentence.trim().length > 0).length,
          }}
        />
        <div
          className={cn(
            "flex justify-end p-4",
            !isFullscreen ? "pt-0 pr-0" : ""
          )}
        >
          <div className="flex items-center mr-4">
            {showLastSaved && lastSavedTime && (
              <div className="text-xs text-gray-500">
                {isAutosaving && <span>Saving...</span>}
                {!isAutosaving && (
                  <span>Last saved {lastSavedTime.toLocaleTimeString()}</span>
                )}
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <ViewToggle
              isFullscreen={isFullscreen}
              contentWidth={contentWidth}
              showDefaultWidth={isLargeScreen}
              showFullWidth={isLargeScreen}
              onToggle={(value) => {
                if (contentWidth !== value) {
                  if (isFullscreen) {
                    // If currently fullscreen, exit fullscreen and restore previous width
                    setIsFullscreen(false);

                    setContentWidth(previousWidth);
                  } else if (value === "fullscreen") {
                    // If not fullscreen and fullscreen is requested, enter fullscreen
                    setPreviousWidth(contentWidth);
                    setIsFullscreen(true);
                  } else if (value === "default") {
                    // Handle regular width toggles when not in fullscreen mode
                    setContentWidth("default");
                  } else {
                    setContentWidth("full");
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div
            className={cn(
              "flex justify-center w-full transition-all duration-300",
              contentWidth === "default"
                ? "max-w-6xl"
                : "max-w-[calc(100%-4rem)]",
              showSidebar && isSidebarOpen ? "ml-40" : "md:ml-0 lg:-ml-16",
              "pb-20"
            )}
          >
            <div
              className={cn(
                "w-full transition-all duration-300 relative",
                contentWidth === "default"
                  ? "md:max-w-[51.0625rem]"
                  : "md:max-w-full"
              )}
            >
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl">What&apos;s the story?</h1>
                <div className="flex items-center gap-2">
                  <StorageControls
                    onSave={() => {
                      if (
                        journal.trim() ||
                        title.trim() ||
                        categories.length > 0
                      ) {
                        saveToStorage({
                          journal,
                          title,
                          categories: selectedCategories,
                          lastSaved: new Date(),
                        });
                      }
                    }}
                    autoSaveEnabled={autoSaveEnabled}
                    onAutoSaveChange={(enabled) => {
                      setAutoSaveEnabled(enabled);
                      // If autosave is being turned ON and there's content, save immediately
                      if (enabled && (journal.trim() || title.trim())) {
                        saveToStorage({
                          journal,
                          title,
                          categories: selectedCategories,
                          lastSaved: new Date(),
                        });
                      }
                    }}
                  />
                  <SettingsModal
                    open={isSettingsModalOpen}
                    onOpenChange={setIsSettingsModalOpen}
                    showLastSaved={showLastSaved}
                    onShowLastSavedChange={setShowLastSaved}
                    autoRestore={autoRestore}
                    onAutoRestoreChange={setAutoRestore}
                  />
                </div>
              </div>
              <form action={handleSubmit} className="space-y-4">
                {/* Title Input standalone again */}
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
                            Would you like to restore your previously saved
                            content?
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
                    <div className="flex items-center w-full px-4 sm:px-0">
                      <div className="grid grid-cols-3 w-full gap-2 sm:flex sm:w-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={cn(
                                "text-[11px] flex items-center justify-center px-2 py-1 rounded-md transition-colors duration-200",
                                !(journal.trim() || title.trim())
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-500"
                                  : "text-black/80 hover:text-black bg-gray-100 hover:bg-gray-200 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                              )}
                              disabled={!(journal.trim() || title.trim())}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              <span className="truncate sm:text-clip">
                                Export
                              </span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="bg-white p-0 dark:bg-black dark:border-gray-800"
                          >
                            <DropdownMenuItem
                              className="p-0 text-xs"
                              disabled={!(journal.trim() || title.trim())}
                            >
                              <Button
                                type="button"
                                variant={"ghost"}
                                onClick={() => handleExport("pdf")}
                                className="w-full justify-start hover:bg-gray-100 transition-colors duration-200 text-xs dark:bg-transparent dark:hover:bg-gray-800 dark:text-white rounded-bl-none rounded-br-none"
                                disabled={!(journal.trim() || title.trim())}
                              >
                                Export as PDF
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="p-0"
                              disabled={!(journal.trim() || title.trim())}
                            >
                              <Button
                                type="button"
                                variant={"ghost"}
                                onClick={() => handleExport("docx")}
                                className="w-full justify-start hover:bg-gray-100 transition-colors duration-200 text-xs dark:bg-transparent dark:hover:bg-gray-800 dark:text-white bg-transparent"
                                disabled={!(journal.trim() || title.trim())}
                              >
                                Export as DOCX
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <button
                          type="button"
                          onClick={() => setIsPreviewOpen(true)}
                          className={cn(
                            "text-[11px] flex items-center justify-center px-2 py-1 rounded-md transition-colors duration-200",
                            !(journal.trim() || title.trim())
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-500"
                              : "text-black/80 hover:text-black bg-gray-100 hover:bg-gray-200 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white "
                          )}
                          disabled={!(journal.trim() || title.trim())}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          <span className="truncate sm:text-clip">Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsWordStatsModalOpen(true)}
                          className="text-[11px] text-black/80 flex items-center justify-center hover:text-black bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white  "
                        >
                          <ChartNoAxesColumnIncreasing className="w-3 h-3 mr-1" />
                          <span className="truncate sm:text-clip">
                            Word Stats
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={
                            isJournalSpeaking
                              ? cancelJournalSpeech
                              : speakJournal
                          }
                          className={cn(
                            "text-[11px] flex items-center justify-center px-2 py-1 rounded-md transition-colors duration-200",
                            !journal.trim()
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-500"
                              : isJournalSpeaking
                              ? "text-red-500 hover:text-red-600 bg-gray-100 hover:bg-gray-200 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700"
                              : "text-black/80 hover:text-black bg-gray-100 hover:bg-gray-200 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                          )}
                          disabled={!journal.trim()}
                        >
                          {isJournalSpeaking ? (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              <span className="truncate sm:text-clip">
                                Stop
                              </span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 mr-1" />
                              <span className="truncate sm:text-clip">
                                Listen
                              </span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsResetModalOpen(true)}
                          className={cn(
                            "text-[11px] flex items-center justify-center px-2 py-1 rounded-md transition-colors duration-200",
                            !(journal.trim() || title.trim())
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-500"
                              : "text-black/80 hover:text-black bg-gray-100 hover:bg-gray-200 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                          )}
                          disabled={!(journal.trim() || title.trim())}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          <span className="truncate sm:text-clip">Reset</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 flex flex-col">
                    <div className="flex items-center justify-start space-y-2 md:space-y-0 md:space-x-2">
                      <div className="flex flex-col md:flex-row md:space-x-2 w-full space-y-2 md:space-y-0">
                        <PublishButton
                          disabled={!journal.trim()}
                          onPublish={() => setShowSaveModal(true)}
                        />
                        <Button
                          type="button"
                          disabled={!journal.trim()}
                          onClick={summarizeJournal}
                          className={cn(
                            "text-white w-auto md:w-auto md:min-w-[10rem] py-1 text-sm",
                            !(journal.trim() || title.trim())
                              ? theme === "dark"
                                ? "cursor-not-allowed bg-purple-900/50 hover:bg-purple-900/50"
                                : "cursor-not-allowed bg-purple-300 hover:bg-purple-300"
                              : theme === "dark"
                              ? "bg-purple-900 hover:bg-purple-800"
                              : "bg-purple-500 hover:bg-purple-600"
                          )}
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
                                  className="rounded-md shadow-lg z-50 max-w-xs opacity-1"
                                >
                                  <p className="text-sm leading-relaxed">
                                    Summarize your journal entry into fewer
                                    sentences.
                                  </p>
                                  {/* <p className="text-xs leading-relaxed text-gray-600">
                                  You can also tweet the summary directly!
                                </p> */}
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
        <SaveJournalModal
          isOpen={showSaveModal}
          handleCreateCategory={handleCreateCategory}
          userId={user?._id}
          onOpenChange={setShowSaveModal}
          onSubmit={saveToDatabase}
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          onCreateCategory={createNewCategory}
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
        <StorageAccessWarningModal
          open={showStorageWarning}
          onOpenChange={setShowStorageWarning}
        />
        {/* Update the autosave indicator */}
        <NoContentWarningModal
          isOpen={showNoContentWarning}
          onOpenChange={setShowNoContentWarning}
        />
        <Dialog
          open={showStorageDisabledWarning}
          onOpenChange={setShowStorageDisabledWarning}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Storage Access Required</DialogTitle>
              <DialogDescription>
                Your browser has storage access disabled. Without this, your
                content cannot be automatically saved. You must manually publish
                your entries to save them.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                onClick={handleAcknowledgeStorageWarning}
                variant="default"
              >
                I Understand
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <ResetConfirmationModal
          isOpen={isResetModalOpen}
          onOpenChange={setIsResetModalOpen}
          onConfirm={handleReset}
        />
      </div>
    </DashboardContainer>
  );
}

export default WritePage;
