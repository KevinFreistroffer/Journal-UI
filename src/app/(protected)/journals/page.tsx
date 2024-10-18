"use client";

import { useState, useEffect, Fragment, useContext } from "react";
import { Spinner } from "@/components/ui/spinner"; // Import a spinner component if you have one
// import HelperText from "@/components/ui/HelperText/HelperText";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  List,
  Grid,
  BookOpenText,
  XIcon,
  Trash2,
  ChevronLeft,
  Settings,
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
import { Button } from "@/components/ui/button";
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
import { getSentimentWord } from "@/lib/utils"; // Add this import at the top of the file

export default function JournalsPage() {
  const [viewMode, setViewMode] = useState<"list" | "2-column" | "columns">(
    "columns"
  ); // Updated state for view mode
  const [showSentiment, setShowSentiment] = useState(true); // State to show or hide sentiment
  const [showCategory, setShowCategory] = useState(false); // State for showing category
  const [showUpdatedDate, setShowUpdatedDate] = useState(false); // State for showing updated date

  // const [favoriteJournals, setFavoriteJournals] = useState<string[]>([]); // State for favorite journals
  const [loadingJournalId, setLoadingJournalId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const { openModal, closeModal } = useContext(ModalContext); // Get openModal and closeModal from context
  const [journalToDelete, setJournalToDelete] = useState<string | null>(null); // State to hold the journal ID to delete
  const [selectedDate, setSelectedDate] = useState<string>(""); // State for selected date
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // New state for sidebar
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
  const [sortBy, setSortBy] = useState<string>("Last updated date");

  const filteredAndSortedEntries = user?.journals
    .filter((journal) => {
      if (showFavoritesOnly && !journal.favorite) {
        return false;
      }
      if (
        selectedDate &&
        new Date(journal.date).toDateString() !==
          new Date(selectedDate).toDateString()
      ) {
        return false;
      }
      if (query) {
        const lowercaseQuery = query.toLowerCase();
        return (
          journal.title.toLowerCase().includes(lowercaseQuery) ||
          journal.entry.toLowerCase().includes(lowercaseQuery) ||
          journal.category.toLowerCase().includes(lowercaseQuery)
        );
      }
      if (
        selectedCategory &&
        selectedCategory !== "" &&
        journal.category !== selectedCategory
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Last updated date":
          return (
            new Date(b.updatedAt || b.date).getTime() -
            new Date(a.updatedAt || a.date).getTime()
          );
        case "Name":
          return a.title.localeCompare(b.title);
        case "Favorites":
          return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
        default:
          return 0;
      }
    });

  // Get unique categories
  const categories = [
    "All",
    ...Array.from(new Set(user?.journals.map((journal) => journal.category))),
  ];

  useEffect(() => {
    // Set viewMode based on viewport width
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setViewMode("list");
      } else if (window.innerWidth <= 1024) {
        setViewMode("2-column");
      } else {
        setViewMode("columns");
      }
    };

    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
  const sentiment = new Sentiment();
  const analyzeSentiment = (journal: string) => {
    const result = sentiment.analyze(journal);
    console.log(result);
    return result; // result.score will give you a sentiment score
  };

  const getSentimentColor = (score: number): string => {
    if (score < -5) {
      return "bg-red-600"; // Very Negative
    } else if (score < 0) {
      return "bg-red-400"; // Negative
    } else if (score === 0) {
      return "bg-gray-400"; // Neutral
    } else if (score <= 5) {
      return "bg-green-400"; // Positive
    } else {
      return "bg-green-600"; // Very Positive
    }
  };

  const handleFavorite = async (journalId: string) => {
    setLoadingJournalId(journalId); // Set the loading state for the specific journal
    try {
      // Send API request to edit the journal
      const response = await fetch(`api/user/journal/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ journalId, favorite: true }), // Include the journal ID in the request body
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite status");
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
  //   console.log(sentimentResult);
  //   // const color = getSentimentColor(sentimentResult.score);
  //   // console.log(
  //   //   `Journal: "${journal}" | Score: ${sentimentResult.score} | Color: ${color}`
  //   // );
  // });

  const handleSelectAll = (checked: boolean) => {
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
      console.log("handleJoyrideCallback", data);
      const { status, type } = data;
      const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

      if (finishedStatuses.includes(status)) {
        const response = await fetch("/api/user/helperText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?._id,
            hasAcknowledgedHelperText: true,
          }),
        });
        console.log("response", response);
        // localStorageService.setItem("hasAcknowledgedHelperText", true);
        // setHasAcknowledgedHelperText(true);
      }
    } catch (error) {
      console.error("Error acknowledging helper text:", error);
    } finally {
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner /> {/* Show a loading spinner while loading */}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen mt-2 md:mt-8 max-w-screen-xl mx-auto">
      <Sidebar
        isOpen={isSidebarOpen}
        sections={[
          {
            title: "Filters",
            content: (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedEntries.length ===
                      filteredAndSortedEntries?.length
                    }
                    onCheckedChange={handleSelectAll}
                    className="bg-white border-gray-300 mr-2"
                    size={4}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select All
                  </label>
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="show-favorites"
                    checked={showFavoritesOnly}
                    onCheckedChange={(checked) =>
                      setShowFavoritesOnly(checked as boolean)
                    }
                    className="bg-white border-gray-300 mr-2"
                    size={4}
                  />
                  <label
                    htmlFor="show-favorites"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Favorites Only
                  </label>
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="date-filter" className="text-sm font-medium">
                    Filter by Date
                  </label>
                  <input
                    id="date-filter"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded p-1 text-sm"
                  />
                </div>
              </div>
            ),
          },

          {
            title: "Settings",
            content: (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="show-sentiment"
                    checked={showSentiment}
                    onCheckedChange={(checked) =>
                      setShowSentiment(checked as boolean)
                    }
                    className="bg-white border-gray-300 mr-2"
                    size={4}
                  />
                  <label
                    htmlFor="show-sentiment"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Sentiment
                  </label>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="show-category"
                      checked={showCategory} // New state for showing category
                      onCheckedChange={
                        (checked) => setShowCategory(checked as boolean) // Update state on change
                      }
                      className="bg-white border-gray-300 mr-2"
                      size={4}
                    />
                    <label
                      htmlFor="show-category"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show Category
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="show-updated-date"
                      checked={showUpdatedDate} // New state for showing updated date
                      onCheckedChange={
                        (checked) => setShowUpdatedDate(checked as boolean) // Update state on change
                      }
                      className="bg-white border-gray-300 mr-2"
                      size={4}
                    />
                    <label
                      htmlFor="show-updated-date"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show Updated Date
                    </label>
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "Data", // New Data section
            content: (
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">
                  Total Journal Entries: {user?.journals.length || 0}
                </p>{" "}
                {/* Display total journal entries */}
                <p className="text-sm font-medium">
                  Total Favorited Journals:{" "}
                  {user?.journals.filter((journal) => journal.favorite)
                    .length || 0}
                </p>{" "}
                {/* Display total favorited journals */}
              </div>
            ),
          },
        ]}
        setIsSidebarOpen={setIsSidebarOpen}
        icon={<Settings size={20} />}
      />

      {/* Wrap the entire content in PageWrapper */}
      <div
        className={`flex-1 p-4 md:p-6 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "md:ml-56 md:pl-8" : "md:ml-24 md:pl-4"}`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold hidden md:block">Your Journals</h1>
        </div>

        <div className="flex flex-col mb-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:space-x-4 space-y-4 lg:space-y-0">
            {/* Search bar - moved to the top for xs and sm viewports */}
            <div className="w-full lg:w-1/3 order-first lg:order-last">
              <SearchInput
                id="search-journals"
                query={query}
                handleSearch={handleSearch}
                userEntries={user.journals}
                containerClassName="w-full"
                inputClassName="w-full h-9 border border-gray-300 rounded py-1.5 px-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                placeholder="Find a journal..."
              />
            </div>

            {/* Category and Sort selects */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-[180px] h-9 bg-white border border-gray-300 rounded py-1.5 px-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 [&>span]:text-sm [&>span]:font-normal">
                  <SelectValue placeholder="Sort by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px] h-9 bg-white border border-gray-300 rounded py-1.5 px-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 [&>span]:text-sm [&>span]:font-normal">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Last updated date">
                    Last updated date
                  </SelectItem>
                  <SelectItem value="Name">Name</SelectItem>
                  <SelectItem value="Favorites">Favorites</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <ToggleGroup.Root
          type="single"
          value={viewMode}
          onValueChange={(value) =>
            value && setViewMode(value as "list" | "2-column" | "columns")
          }
          className="hidden md:flex items-center mb-4"
        >
          <ToggleGroup.Item
            value="list"
            aria-label="List View"
            className={`flex items-center space-x-2 px-3 py-2 rounded-l ${
              viewMode === "list" ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <ViewHorizontalIcon />
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="2-column"
            aria-label="2-Column View"
            className={`hidden md:flex items-center space-x-2 px-3 py-2 ${
              viewMode === "2-column" ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <ViewVerticalIcon />
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="columns"
            aria-label="Columns View"
            className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-r ${
              viewMode === "columns" ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <ViewGridIcon />
          </ToggleGroup.Item>
        </ToggleGroup.Root>
        <div
          className={`grid ${
            viewMode === "list"
              ? "grid-cols-1"
              : viewMode === "2-column"
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          } gap-6`}
        >
          {filteredAndSortedEntries?.length === 0 ? (
            <div>
              <p>No journals found.</p>
              <Link
                href="/journal/write"
                className="text-blue-500 hover:underline"
              >
                Create a journal
              </Link>
            </div>
          ) : (
            filteredAndSortedEntries?.map((journal, index) => {
              console.log(getSentimentWord(journal.entry));
              return (
                <Card
                  key={index}
                  className={`hover:shadow-lg transition-shadow duration-200 flex flex-col ${
                    selectedEntries.includes(journal._id) ? "bg-blue-100" : ""
                  }`}
                >
                  <div className="flex flex-col flex-grow">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="wrap text-wrap overflow-wrap text-md text-blue-500">
                          {journal.title.length > 30
                            ? `${journal.title.substring(0, 30)}...`
                            : journal.title}
                        </CardTitle>
                        <div className="relative p-0 m-0">
                          {index === 0 && (
                            <Joyride
                              callback={handleJoyrideCallback}
                              run={helperTextState.run}
                              disableOverlayClose={true}
                              steps={helperTextState.steps}
                              styles={{
                                options: {
                                  arrowColor: "#fff",
                                  primaryColor: "#000",
                                  zIndex: 1000,
                                },
                              }}
                            />
                          )}
                          <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <ReaderIcon
                                  className={`cursor-pointer helper-text-step ${"w-5 h-5 md:w-8 md:h-8"}`}
                                  onClick={() => {
                                    localStorageService.setItem(
                                      "selectedJournal",
                                      journal._id
                                    );
                                    router.push(`/journal/${journal._id}`);
                                  }}
                                />
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
                                  sideOffset={4}
                                >
                                  Read
                                  <Tooltip.Arrow className="fill-gray-800" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </Tooltip.Provider>
                        </div>
                      </div>
                    </CardHeader>
                    {/* <CardContent></CardContent> */}
                    <CardFooter className="mt-auto flex justify-between items-end">
                      <div className="flex flex-col">
                        {showCategory && <p>{journal.category}</p>}
                        {showUpdatedDate && journal.updatedAt ? (
                          <p className="text-sm text-gray-500">
                            Updated: {journal.updatedAt.toString()}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">
                            {journal.date}
                          </p>
                        )}
                        {showSentiment && (
                          <div className="flex items-center text-sm mt-1">
                            <div
                              className={`rounded-full mr-1 w-2 h-2 ${getSentimentColor(
                                analyzeSentiment(journal.entry).score
                              )}`}
                            ></div>
                            <span className="text-sm text-gray-500">
                              {getSentimentWord(journal.entry)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        {loadingJournalId === journal._id ? (
                          <Spinner size="sm" className="mr-2" />
                        ) : (
                          <>
                            {/* TODO: determine if this is something people would use / not tend to overuse clicking all of them, or if require them to go to the read page. */}
                            {/* {journal.favorite ? (
                            <StarFilledIcon
                              onClick={() => handleFavorite(journal._id)}
                              className="w-6 h-6 mr-2"
                            /> // Use StarFilledIcon if favorite
                          ) : (
                            <StarIcon
                              onClick={() => handleFavorite(journal._id)}
                              className="w-6 h-6 mr-2"
                            /> // Use StarIcon if not favorite
                          )} */}
                          </>
                        )}
                        <Tooltip.Provider delayDuration={100}>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <TrashIcon
                                className="w-7 h-7 text-red-500 cursor-pointer bg-gray-200 rounded-full p-1 hidden md:block" // Increased size for non-mobile viewports
                                onClick={() => openDeleteModal(journal._id)} // Open GlobalModal on click
                              />
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
                                sideOffset={4}
                              >
                                Delete
                                <Tooltip.Arrow className="fill-gray-800" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                    </CardFooter>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
      {/* Global Modal */}
      <GlobalModal />
    </div>
  );
}