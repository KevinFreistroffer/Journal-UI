"use client";

import { useState, useEffect, Fragment, useContext } from "react";
import { Spinner } from "@/components/ui/Spinner"; // Import a spinner component if you have one
// import HelperText from "@/components/ui/HelperText/HelperText";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { FaSortDown } from "react-icons/fa";
import {
  List,
  Grid,
  BookOpenText,
  XIcon,
  Trash2,
  ChevronLeft,
  Settings,
  ChevronRightIcon,
  ChevronUpIcon,
  Menu,
} from "lucide-react";
import { useSearch } from "@/context/SearchContext";
// import StarIcon from "@/components/ui/StarIcon/StarIcon";
// import { Tooltip } from "@radix-ui/themes";
import { localStorageService } from "@/lib/services/localStorageService";
import { Checkbox } from "@/components/ui/Checkbox"; // Import the Checkbox component
import { PartialWidthPageContainer } from "@/components/ui/PartialWidthPageContainer"; // Import the PageWrapper component
import { ModalContext } from "@/context/GlobalModalContext"; // Import ModalContext
import GlobalModal from "@/components/ui/GlobalModal"; // Import GlobalModal
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import Carrot from "@/components/ui/Carrot/Carrot";
import Sentiment from "sentiment";
import nlp from "compromise";
import Sidebar from "@/components/ui/Sidebar/Sidebar";
// import { Input } from "@/components/ui/input"; // Import the Input component

import SearchInput from "@/components/ui/SearchInput/SearchInput";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import {
  ViewGridIcon,
  ViewHorizontalIcon,
  ReaderIcon,
  TrashIcon,
  ViewVerticalIcon,
} from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";
import Joyride, {
  CallBackProps,
  STATUS,
  TooltipRenderProps,
} from "react-joyride";
import HelperText from "@/components/ui/HelperText/HelperText";
import { HAS_ACKNOWLEDGED_HELPER_TEXT } from "@/lib/constants";
import { StarIcon, StarFilledIcon } from "@radix-ui/react-icons"; // Import Radix UI Star icons
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSentimentWord,
  analyzeSentiment,
  getSentimentColor,
} from "@/lib/utils"; // Add this import at the top of the file
import { ChevronDownIcon, CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import * as Dialog from "@radix-ui/react-dialog";
import State from "@/components/ui/debug/State"; // Add this import at the top of the file
import { PlusIcon } from "@radix-ui/react-icons";
import SpinnerIcon from "@/components/SpinnerIcon";
import DashboardContainer from "@/components/ui/DashboardContainer/DashboardContainer";
import SidebarContent from "@/components/ui/SidebarContent/SidebarContent";

// Add this function near the top of the file with other utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();

  // Function to add ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();

  if (year === currentYear) {
    return `${month} ${day}${getOrdinalSuffix(day)}`;
  }
  return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
};

// Add this enum near the top of the file, before the component
enum ViewMode {
  Rows = "rows",
  TwoColumn = "two-column",
  ThreeColumn = "three-column",
}

export default function JournalsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ThreeColumn);
  const [showSentiment, setShowSentiment] = useState(true); // State to show or hide sentiment
  const [showCategory, setShowCategory] = useState(true); // State for showing category
  const [showUpdatedDate, setShowUpdatedDate] = useState(true); // State for showing updated date
  // const [favoriteJournals, setFavoriteJournals] = useState<string[]>([]); // State for favorite journals
  const [loadingJournalId, setLoadingJournalId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const { openModal, closeModal } = useContext(ModalContext); // Get openModal and closeModal from context
  const [journalToDelete, setJournalToDelete] = useState<string | null>(null); // State to hold the journal ID to delete
  const [selectedFilterDate, setSelectedFilterDate] = useState<string>(""); // Changed from selectedDate // This is the createdAt date.
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const { query, handleSearch, setFilteredEntries } = useSearch();
  const [helperTextState, setHelperTextState] = useState({
    run: false,
    steps: [
      {
        target: ".helper-text-step",
        content: "Click to view, summarize and tweet your thoughts!",
        disableBeacon: true,
      },
    ],
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  // Add this state at the component level
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [displayedCategoryFilter, setDisplayedCategoryFilter] =
    useState("Category");
  const [sortFilter, setSortFilter] = useState("Last updated date");
  const [displayedSortFilter, setDisplayedSortFilter] = useState("Filter");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"category" | "sort" | null>(
    null
  );
  const [categoryFilterDisplayed, setCategoryFilterDisplayed] = useState(false);
  const isMobileView = useMediaQuery("(max-width: 639px)");
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const isExtraSmallScreen = useMediaQuery("(max-width: 360px)");
  const isMediumScreen = useMediaQuery(
    "(min-width: 768px) and (max-width: 1023px)"
  );
  // Add this near your other state declarations
  const isLargeScreen = useMediaQuery("(min-width: 1024px)"); // lg breakpoint is 1024px
  const isExtraLargeScreen = useMediaQuery("(min-width: 1280px)"); // xl breakpoint
  // Add new state for the create category modal
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Only run client-side
    if (typeof window !== "undefined") {
      return window.innerWidth >= 640; // 640px is the 'sm' breakpoint
    }
    return true; // Default to open on server-side
  });

  // Update useEffect to handle default view modes
  useEffect(() => {
    if (!isLargeScreen) {
      setViewMode(ViewMode.Rows);
    } else if (!isExtraLargeScreen) {
      setViewMode(ViewMode.TwoColumn);
    }
  }, [isLargeScreen, isExtraLargeScreen]);

  useEffect(() => {
    setShouldTruncate(viewMode === ViewMode.TwoColumn && isMediumScreen);
  }, [viewMode, isMediumScreen]);

  const handleFilterClick = (filterType: "category" | "sort") => {
    if (isMobileView) {
      setActiveFilter(filterType);
      setIsModalOpen(true);
      setCategoryFilterDisplayed(true);
    } else {
      setCategoryFilterDisplayed(true);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (activeFilter === "category") {
      setCategoryFilter(option);
      setDisplayedCategoryFilter(option === "All" ? "Category" : option);
    } else if (activeFilter === "sort") {
      setSortFilter(option);
      setDisplayedSortFilter(option);
    }
    setCategoryFilterDisplayed(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoryFilterDisplayed(false);
  };

  const filteredAndSortedEntries = user?.journals
    .filter((journal) => {
      if (showFavoritesOnly && !journal.favorite) {
        return false;
      }
      if (
        selectedFilterDate &&
        new Date(journal.createdAt).toDateString() !==
          new Date(selectedFilterDate).toDateString()
      ) {
        return false;
      }
      if (query) {
        const lowercaseQuery = query.toLowerCase();
        return (
          journal.title.toLowerCase().includes(lowercaseQuery) ||
          journal.entry.toLowerCase().includes(lowercaseQuery) ||
          journal.categories
            .map((c) => c.category)
            .join(", ")
            .toLowerCase()
            .includes(lowercaseQuery)
        );
      }
      if (
        selectedCategory &&
        selectedCategory !== "" &&
        journal.categories
          .map((c) => c.category)
          .join(", ")
          .toLowerCase() !== selectedCategory
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        // NOT SURE
        case "Last updated date":
          return (
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
          );
        case "Name":
          return a.title.localeCompare(b.title);
        case "Favorited":
          return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
        default:
          return 0;
      }
    });

  // Get unique categories
  const categories = [
    "All",
    ...Array.from(
      new Set(user?.journalCategories?.map((cat) => cat.category) || [])
    ),
  ];

  useEffect(() => {
    // // Set viewMode based on viewport width
    // const handleResize = () => {
    //   if (window.innerWidth <= 640) {
    //     setViewMode("list");
    //   } else if (window.innerWidth <= 1024) {
    //     setViewMode("2-column");
    //   } else {
    //     setViewMode("columns");
    //   }
    //   // Check if viewport is "md" or larger
    //   if (window.innerWidth >= 768) {
    //     if (categoryFilterDisplayed) {
    //       // setCategoryFilterDisplayed(false);
    //     } else {
    //       setIsModalOpen(true);
    //     }
    //   }
    // };
    // handleResize(); // Check on initial load
    // window.addEventListener("resize", handleResize);
    // return () => {
    //   window.removeEventListener("resize", handleResize);
    // };
  }, [categoryFilterDisplayed]);

  useEffect(() => {
    // Check if the user has seen the helper text

    if (user?.hasAcknowledgedHelperText === false) {
      setHelperTextState((state) => ({ ...state, run: true }));
    }
    // const hasAcknowledged = localStorageService.getItem(
    //   HAS_ACKNOWLEDGED_HELPER_TEXT
    // );

    // if (hasAcknowledged === undefined) {
    //   if (!user?.hasAcknowledgedHelperText) {
    //     setHelperTextState((state) => ({ ...state, run: true }));
    //   }
    // } else if (!hasAcknowledged) {
    //   setHelperTextState((state) => ({ ...state, run: true }));
    // }
  }, [user]);

  // @ts-ignore
  const getFrequentKeywords = (journals: any) => {
    const text = journals.join(" "); // Combine all journals into one text block
    const doc = nlp(text);

    // Get most frequent nouns or verbs
    const keywords = doc.nouns().out("topk");

    return keywords.slice(0, 5); // Get top 5 most frequent words
  };

  // const journals = [
  //   "Today I worked on my project. It was a productive day.",
  //   "I had a meeting and it went well.",
  //   "The project is almost done, just need to finish a few tasks.",
  // ];
  // const sentiment = new Sentiment();
  // const analyzeSentiment = (journal: string) => {
  //   const result = sentiment.analyze(journal);
  //

  //   return result; // result.score will give you a sentiment score
  // };

  const handleFavorite = async (journalId: string, favorite: boolean) => {
    setLoadingJournalId(journalId); // Set the loading state for the specific journal
    try {
      // Send API request to edit the journal
      const response = await fetch(`/api/user/entry/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?._id, journalId, favorite }), // Include the journal ID in the request body
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite status");
      }

      if (response.status === 200) {
        const data = await response.json();

        setUser(data.data);
      }

      // Handle successful response (e.g., update state)
      // Example: toggle favorite status in your state
    } catch (error) {
      console.error("Error updating favorite status:", error);
    } finally {
      setLoadingJournalId(null); // Reset loading state
    }
  };

  const handleDelete = async () => {
    if (!journalToDelete) return; // Exit if no journal is set for deletion

    setLoadingJournalId(journalToDelete);
    try {
      const response = await fetch(`/api/user/journal/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ journalId: journalToDelete }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete journal");
      }

      // Remove the deleted journal from the state

      const updatedEntries = user?.journals.filter(
        (journal) => journal._id !== journalToDelete
      );
      // Update the user state with the new journals array
      // setUser({ ...user, journals: updatedEntries });
    } catch (error) {
      console.error("Error deleting journal:", error);
    } finally {
      setLoadingJournalId(null); // Reset loading state
      setJournalToDelete(null); // Reset the journal to delete
    }
  };

  const openDeleteModal = (journalId: string) => {
    setJournalToDelete(journalId); // Set the journal ID to delete
    const journalCount = selectedEntries.length; // Get the count of selected journals
    const message =
      journalCount === 1
        ? "Are you sure you want to delete the selected journal?"
        : `Are you sure you want to delete ${journalCount} selected journals?`;

    openModal(
      <div className="bg-white">
        {/* Removed padding, shadow, and border-radius */}
        <p className="mb-4 text-lg font-light">{message}</p>
        {/* Display the confirmation message */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Confirm
          </button>
          {/* Confirmation button */}
          <button
            onClick={() => {
              setJournalToDelete(null); // Hide the modal
              closeModal();
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Decline
          </button>
          {/* Decline button */}
        </div>
      </div>
    ); // Open the GlobalModal
  };

  // newEntries.forEach((journal) => {
  //   const sentimentResult = analyzeSentiment(journal);
  //
  //   // const color = getSentimentColor(sentimentResult.score);
  //   // console.log(
  //   //   `Journal: "${journal}" | Score: ${sentimentResult.score} | Color: ${color}`
  //   // );
  // });

  const handleSelectAll = (checked: boolean) => {
    setShowCheckboxes(checked);
    if (checked) {
      setSelectedEntries(
        filteredAndSortedEntries?.map((journal) => journal._id) || []
      );
    } else {
      setSelectedEntries([]);
    }
  };

  const handleSelectJournal = (journalId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries((prev) => [...prev, journalId]);
    } else {
      setSelectedEntries((prev) => prev.filter((id) => id !== journalId));
    }
  };

  const handleJoyrideCallback = async (data: CallBackProps) => {
    try {
      const { status, type } = data;
      const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

      if (finishedStatuses.includes(status)) {
        const response = await fetch("/api/user/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?._id,
            hasAcknowledgedHelperText: true,
          }),
        });
        // localStorageService.setItem("hasAcknowledgedHelperText", true);
        // setHasAcknowledgedHelperText(true);
      }
    } catch (error) {
      console.error("Error acknowledging helper text:", error);
    } finally {
    }
  };
  const [selectIsOpen, setSelectIsOpen] = useState<string | null>(null);
  const handleSelectOpenChange = (journalId: string) => {
    setSelectIsOpen(selectIsOpen === journalId ? null : journalId);
  };

  // Add this function with your other handlers
  const handleCategoryChange = async (
    journalId: string,
    newCategory: string
  ) => {
    setLoadingJournalId(journalId);
    try {
      const response = await fetch(`api/user/journal/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          journalId,
          category: newCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setLoadingJournalId(null);
    }
  };

  // Add handler for creating new category
  const handleCreateCategory = async () => {
    try {
      const response = await fetch("/api/user/category/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: newCategoryName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      setNewCategoryName("");
      setShowCreateCategoryModal(false);
      setSelectIsOpen(null);
      // The user state should automatically update with the new category
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner /> {/* Show a loading spinner while loading */}
      </div>
    );
  }

  const handleDialogOpenChange = (value: boolean) => {
    setIsModalOpen(value);
    setCategoryFilterDisplayed(value);
  };

  return (
    <DashboardContainer
      isSidebarOpen={isSidebarOpen}
      sidebar={
        <Sidebar
          isOpen={isSidebarOpen}
          headerDisplaysTabs={true}
          sections={SidebarContent({
            showFavoritesOnly,
            setShowFavoritesOnly,
            selectedFilterDate,
            setSelectedFilterDate,
            showSentiment,
            setShowSentiment,
            showCategory,
            setShowCategory,
            showUpdatedDate,
            setShowUpdatedDate,
            journalCount: user?.journals.length,
            favoritedJournalCount: user?.journals.filter(
              (journal) => journal.favorite
            ).length,
          })}
          setIsSidebarOpen={setIsSidebarOpen}
          icon={<ChevronRightIcon size={20} />}
        />
      }
      bottomBar={
        isExtraSmallScreen ? (
          <div className="fixed m-1 bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-center z-[500] shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  {/* <Settings className="h-5 w-5" /> */}
                  <ChevronUpIcon className="h-5 w-5" />
                  {/* <Menu className="h-5 w-5" /> */}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto m-4 mb-0 max-w-md ">
                <div className="pt-6">
                  {/* <h3 className="text-lg font-semibold mb-4">Toggle Cards</h3> */}
                  <div className="space-y-4">
                    {SidebarContent({
                      showFavoritesOnly,
                      setShowFavoritesOnly,
                      selectedFilterDate,
                      setSelectedFilterDate,
                      showSentiment,
                      setShowSentiment,
                      showCategory,
                      setShowCategory,
                      showUpdatedDate,
                      setShowUpdatedDate,
                      journalCount: user?.journals.length,
                      favoritedJournalCount: user?.journals.filter(
                        (journal) => journal.favorite
                      ).length,
                    }).map((section) => (
                      <div key={section.title}>
                        <h4 className="font-medium mb-2">{section.title}</h4>
                        {section.content}
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : undefined
      }
    >
      <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold hidden md:block">Your Journals</h1>
        </div>

        <div className="flex flex-col mb-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search bar - moved to the top for xs and sm viewports */}
            <div className="w-full lg:w-1/3 order-first lg:order-last">
              <SearchInput
                id="search-journals"
                query={query}
                handleSearch={handleSearch}
                userEntries={user.journals}
                containerClassName="w-full"
                inputClassName="w-full h-9 border border-gray-300 rounded py-1.5 px-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300"
                placeholder="Find a journal..."
              />
            </div>

            {/* Category and Sort selects */}
            <div className="flex flex-row items-center space-x-4">
              {isMobileView ? (
                <>
                  <Button
                    variant="outline"
                    className="h-9 px-3"
                    onClick={() => handleFilterClick("category")}
                  >
                    <span>{displayedCategoryFilter}</span>
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 px-3"
                    onClick={() => handleFilterClick("sort")}
                  >
                    <span>{displayedSortFilter}</span>
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                  <Dialog.Root
                    open={categoryFilterDisplayed}
                    onOpenChange={handleDialogOpenChange}
                  >
                    <Dialog.Portal>
                      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40" />
                      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg border border-gray-200 w-[95%] max-w-md max-h-[80vh] overflow-hidden rounded-xl">
                        <div className="flex justify-between items-center border-b border-gray-200">
                          <Dialog.Title className="text-sm font-semibold py-5 px-6">
                            {activeFilter === "category"
                              ? "Select category"
                              : "Select filter"}
                          </Dialog.Title>
                          <button onClick={handleCloseModal} className="p-3">
                            <Cross1Icon className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex flex-col overflow-y-auto max-h-[60vh]">
                          {activeFilter === "category"
                            ? categories.map((category) => (
                                <Button
                                  key={category}
                                  variant="ghost"
                                  className="justify-start font-normal py-6 px-6 border-b border-gray-200 text-left text-sm rounded-none hover:bg-gray-200 transition-colors duration-150"
                                  onClick={() => {
                                    handleOptionSelect(category);
                                    handleCloseModal();
                                  }}
                                >
                                  <div className="flex items-center w-full">
                                    <span className="w-6">
                                      {categoryFilter === category && (
                                        <CheckIcon className="h-4 w-4" />
                                      )}
                                    </span>
                                    <span className="ml-2">{category}</span>
                                  </div>
                                </Button>
                              ))
                            : ["Last updated date", "Name", "Favorited"].map(
                                (option) => (
                                  <Button
                                    key={option}
                                    variant="ghost"
                                    className="justify-start font-normal py-6 px-6 border-b border-gray-200 text-left text-sm rounded-none hover:bg-gray-200 transition-colors duration-150"
                                    onClick={() => {
                                      handleOptionSelect(option);
                                      handleCloseModal();
                                    }}
                                  >
                                    <div className="flex items-center w-full">
                                      <span className="w-6">
                                        {sortFilter === option && (
                                          <CheckIcon className="h-4 w-4" />
                                        )}
                                      </span>
                                      <span className="ml-2">{option}</span>
                                    </div>
                                  </Button>
                                )
                              )}
                        </div>
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                </>
              ) : (
                <>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      setIsModalOpen(false);
                      setCategoryFilterDisplayed(false);
                    }}
                    open={categoryFilterDisplayed}
                    onOpenChange={setCategoryFilterDisplayed}
                  >
                    <SelectTrigger className="h-9 bg-white border border-gray-300 rounded py-1.5 px-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 [&>span]:text-sm">
                      <SelectValue
                        placeholder="Category"
                        className="font-bold placeholder:font-bold"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="font-normal"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                      setIsModalOpen(false);
                    }}
                  >
                    <SelectTrigger className="h-9 bg-white border border-gray-300 rounded py-1.5 px-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 [&>span]:text-sm">
                      <SelectValue
                        placeholder="Filter"
                        className="font-bold placeholder:font-bold"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem
                        value="Last updated date"
                        className="font-normal"
                      >
                        Last updated date
                      </SelectItem>
                      <SelectItem value="Name" className="font-normal">
                        Name
                      </SelectItem>
                      <SelectItem value="Favorited" className="font-normal">
                        Favorited
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <ToggleGroup.Root
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
            className={`items-center ${isLargeScreen ? "flex" : "hidden"}`}
          >
            <ToggleGroup.Item
              value={ViewMode.Rows}
              aria-label="Rows View"
              className={`flex items-center space-x-2 px-3 py-2 rounded-l ${
                viewMode === ViewMode.Rows ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <ViewHorizontalIcon />
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value={ViewMode.TwoColumn}
              aria-label="2-Column View"
              className={`flex items-center space-x-2 px-3 py-2 ${
                viewMode === ViewMode.TwoColumn ? "bg-blue-100" : "bg-gray-100"
              } ${!isExtraLargeScreen ? "rounded-r" : ""}`}
            >
              <ViewVerticalIcon />
            </ToggleGroup.Item>
            {isExtraLargeScreen && (
              <ToggleGroup.Item
                value={ViewMode.ThreeColumn}
                aria-label="3-Column View"
                className={`flex items-center space-x-2 px-3 py-2 rounded-r ${
                  viewMode === ViewMode.ThreeColumn
                    ? "bg-blue-100"
                    : "bg-gray-100"
                }`}
              >
                <ViewGridIcon />
              </ToggleGroup.Item>
            )}
          </ToggleGroup.Root>

          {/* Select all and delete all functionality */}
          {/* <div className="flex items-center space-x-4">
            {showCheckboxes && selectedEntries.length > 0 && (
              <div className="flex items-center space-x-2 border border-gray-200 rounded-md px-2 py-1">
                <button
                  onClick={() => openDeleteModal(selectedEntries[0])}
                  className="flex items-center space-x-1 p-1.5 hover:bg-gray-100 rounded-md text-red-500 text-sm"
                >
                  <TrashIcon className="w-5 h-5" />
                  <span>Delete all</span>
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={showCheckboxes}
                onCheckedChange={handleSelectAll}
                className="bg-white border-gray-300"
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select All
              </label>
            </div>
          </div> */}
        </div>
        <div
          className={`grid gap-6 ${
            {
              [ViewMode.Rows]: "grid-cols-1",
              [ViewMode.TwoColumn]: "grid-cols-1 md:grid-cols-2",
              [ViewMode.ThreeColumn]:
                "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
            }[viewMode]
          }`}
        >
          {filteredAndSortedEntries?.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center text-center">
              <p>
                {showFavoritesOnly
                  ? "No journals favorited."
                  : "No journals found."}
              </p>
              {!showFavoritesOnly && (
                <Link
                  href="/journal/write"
                  className="text-blue-500 hover:underline mt-2"
                >
                  Create a journal
                </Link>
              )}
            </div>
          ) : (
            filteredAndSortedEntries?.map((journal, index) => {
              const displayTitle = journal.title.trim() || "Untitled";

              return (
                <Card
                  key={index}
                  className={`hover:shadow-lg transition-shadow duration-200 flex flex-col ${
                    selectedEntries.includes(journal._id) ? "bg-blue-100" : ""
                  } p-3 sm:p-4 md:p-6 relative`}
                >
                  <div
                    className={`absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 transition-opacity duration-200 ${
                      showCheckboxes ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Checkbox
                      checked={selectedEntries.includes(journal._id)}
                      onCheckedChange={(checked) =>
                        handleSelectJournal(journal._id, checked as boolean)
                      }
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <CardHeader className="pb-4 pt-0 px-0">
                      {" "}
                      {/* Removed top and horizontal padding */}
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <CardTitle className="text-wrap break-words text-md text-blue-500 flex-1 break-all mr-1">
                            <Link
                              href={`/journal/${journal._id}`}
                              className="hover:underline"
                            >
                              {shouldTruncate
                                ? `${displayTitle.substring(0, 15)}${
                                    displayTitle.length > 15 ? "..." : ""
                                  }`
                                : displayTitle}
                            </Link>
                          </CardTitle>
                          {showCategory && (
                            <p className="text-xs mt-2 text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 w-fit mb-2">
                              {/* {journal.categories
                                .map((c) => c.category)
                                .join(", ")} */}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                              <Tooltip.Trigger
                                asChild
                                className="border p-1 w-7 h-7 bg-gray-100 rounded-tl rounded-bl cursor-pointer dark:bg-black "
                              >
                                {loadingJournalId === journal._id ? (
                                  <div className="flex items-center justify-center w-7 h-7 border border-l-0 bg-gray-100 rounded-tr rounded-br focus:outline-none dark:text-white">
                                    <SpinnerIcon />
                                  </div>
                                ) : journal.favorite ? (
                                  <StarFilledIcon
                                    onClick={() =>
                                      handleFavorite(journal._id, false)
                                    }
                                    className="w-4 h-4"
                                  />
                                ) : (
                                  <StarIcon
                                    onClick={() =>
                                      handleFavorite(journal._id, true)
                                    }
                                    className="w-4 h-4"
                                  />
                                )}
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  className="bg-gray-800 text-white px-2 py-1 rounded text-sm "
                                  sideOffset={4}
                                >
                                  Favorite
                                  <Tooltip.Arrow className="fill-gray-800" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </Tooltip.Provider>

                          <Popover.Root
                            open={selectIsOpen === journal._id}
                            onOpenChange={() =>
                              handleSelectOpenChange(journal._id)
                            }
                          >
                            <Popover.Trigger
                              asChild
                              className="dark:bg-black dark:text-white"
                            >
                              <button className="flex items-center justify-center w-7 h-7 border border-l-0 bg-gray-100 rounded-tr rounded-br focus:outline-none">
                                <ChevronDownIcon className="w-4 h-4" />
                              </button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content
                                className="bg-white rounded-md shadow-lg border border-gray-200 w-[200px] z-50"
                                sideOffset={5}
                                align="end"
                              >
                                <div className="font-bold px-4 py-3 text-sm border-b border-gray-200 flex justify-between items-center">
                                  Categories
                                  <button
                                    onClick={() => setSelectIsOpen(null)}
                                    className="hover:bg-gray-100 p-1 rounded-sm "
                                  >
                                    <Cross1Icon className="w-3 h-3" />
                                  </button>
                                </div>
                                {categories
                                  .filter((cat) => cat !== "All")
                                  .map((category) => (
                                    <button
                                      key={category}
                                      className={`box-border overflow-wrap-anywhere w-full px-4 py-3 text-sm text-left hover:bg-gray-100 rounded-sm flex items-center justify-between ${
                                        journal.categories
                                          .map((c) => c.category)
                                          .join(", ")
                                          .toLowerCase() === category
                                          ? "text-blue-500"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        handleCategoryChange(
                                          journal._id,
                                          category
                                        );
                                        setSelectIsOpen(null);
                                      }}
                                    >
                                      {category}
                                      {journal.categories
                                        .map((c) => c.category)
                                        .join(", ")
                                        .toLowerCase() === category && (
                                        <CheckIcon className="w-4 h-4" />
                                      )}
                                    </button>
                                  ))}
                                <button
                                  onClick={() => {
                                    setShowCreateCategoryModal(true);
                                    setSelectIsOpen(null);
                                  }}
                                  className="w-full px-4 py-3 text-sm text-left hover:bg-gray-100 border-t border-gray-200 flex items-center text-blue-500"
                                >
                                  <PlusIcon className="w-4 h-4 mr-2" />
                                  Create new
                                </button>
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="mt-auto flex flex-col pt-3 p-0 items-start">
                      <div className="flex justify-between items-center">
                        {showSentiment && (
                          <div
                            className={`flex items-center text-xs ${
                              showUpdatedDate ? "mr-3" : ""
                            }`}
                          >
                            <div
                              className={`rounded-full mr-1 w-2 h-2 ${getSentimentColor(
                                analyzeSentiment(journal.entry).score
                              )}`}
                            ></div>
                            <span className="text-xs text-gray-500">
                              {getSentimentWord(
                                analyzeSentiment(journal.entry).score
                              )}
                            </span>
                          </div>
                        )}

                        {showUpdatedDate && journal.updatedAt ? (
                          <p className="text-xs text-gray-500">
                            Updated on{" "}
                            {formatDate(journal.updatedAt.toString())}
                          </p>
                        ) : null}
                      </div>
                    </CardFooter>
                  </div>
                </Card>
              );
            })
          )}
        </div>
        <GlobalModal />
        {/* Add this at the end of the component, just before the closing div */}
        {/* <State state={{ categoryFilterDisplayed }} position="bottom-right" /> */}
        {/* Add the create category modal */}
        <Dialog.Root
          open={showCreateCategoryModal}
          onOpenChange={setShowCreateCategoryModal}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-[400px] focus:outline-none">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Create New Category
              </Dialog.Title>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateCategoryModal(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    </DashboardContainer>
  );
}
