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
import StarIcon from "@/components/ui/StarIcon/StarIcon";
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
import { Input } from "@/components/ui/input"; // Import the Input component
import SideBar from "@/components/ui/Sidebar/SideBar";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import {
  ViewGridIcon,
  ViewHorizontalIcon,
  ReaderIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";
import Joyride, {
  CallBackProps,
  STATUS,
  TooltipRenderProps,
} from "react-joyride";
import HelperText from "@/components/ui/HelperText/HelperText";
import { HAS_ACKNOWLEDGED_HELPER_TEXT } from "@/lib/constants";

function CustomTooltip(props: TooltipRenderProps) {
  const {
    backProps,
    closeProps,
    continuous,
    index,
    primaryProps,
    skipProps,
    step,
    tooltipProps,
  } = props;

  return (
    <div className="tooltip__body" {...tooltipProps}>
      <button className="tooltip__close" {...closeProps}>
        &times;
      </button>
      {step.title && <h4 className="tooltip__title">{step.title}</h4>}
      <div className="tooltip__content">{step.content}</div>
      <div className="tooltip__footer">
        <button className="tooltip__button" {...skipProps}>
          {skipProps.title}
        </button>
        <div className="tooltip__spacer">
          {index > 0 && (
            <button className="tooltip__button" {...backProps}>
              {backProps.title}
            </button>
          )}
          {continuous && (
            <button
              className="tooltip__button tooltip__button--primary"
              {...primaryProps}
            >
              {primaryProps.title}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default function JournalsPage() {
  const [viewMode, setViewMode] = useState<"list" | "icons">("icons"); // State for view mode
  const [showSentiment, setShowSentiment] = useState(true); // State to show or hide sentiment
  const [hasAcknowledgedHelperText, setHasAcknowledgedHelperText] =
    useState<boolean>(false);
  // const [favoriteJournals, setFavoriteJournals] = useState<string[]>([]); // State for favorite journals
  const [loadingJournalId, setLoadingJournalId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const { openModal } = useContext(ModalContext); // Get openModal and closeModal from context
  const [journalToDelete, setJournalToDelete] = useState<string | null>(null); // State to hold the journal ID to delete
  const [selectedDate, setSelectedDate] = useState<string>(""); // State for selected date
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const { query, handleSearch, setFilteredEntries } = useSearch();
  const [helperTextState, setHelperTextState] = useState({
    run: true,
    steps: [
      {
        target: ".helper-text-step",
        content: "Click to view, summarize and tweet your thoughts!",
        disableBeacon: true,
      },
    ],
  });
  const handleCloseHelper = () => {
    setHelperTextState((state) => ({ ...state, run: false }));
    setHasAcknowledgedHelperText(true);
    localStorageService.setItem(HAS_ACKNOWLEDGED_HELPER_TEXT, true);
  };

  useEffect(() => {
    // Set viewMode to "list" for xs or sm viewports
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        // 640px is the breakpoint for sm
        setViewMode("list");
      }
    };

    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize); // Add resize event listener

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup listener on unmount
    };
  }, []);

  useEffect(() => {
    // Check if the user has seen the helper text
    const hasAcknowledged = localStorageService.getItem(
      HAS_ACKNOWLEDGED_HELPER_TEXT
    );

    if (hasAcknowledged === undefined) {
      if (!user?.hasAcknowledgedHelperText) {
        setHelperTextState((state) => ({ ...state, run: true }));
      }
    } else if (!hasAcknowledged) {
      setHelperTextState((state) => ({ ...state, run: true }));
    }
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
    return result; // result.score will give you a sentiment score
  };

  const newEntries = [
    "I'm really happy today, everything is going great.",
    "Today was a tough day. Feeling a bit down.",
  ];

  const getSentimentColor = (score: number) => {
    if (score < -5) {
      return "hsla(0, 100%, 50%, 0.75)"; // Very Negative (Red) with 50% opacity
    } else if (score < 0) {
      return `hsla(0, ${100 + score * 20}%, 50%, 0.75)`; // Gradual shift to Neutral (lighter Red) with 50% opacity
    } else if (score === 0) {
      return "hsla(0, 0%, 70%, 0.75)"; // Neutral (Gray) with 50% opacity
    } else if (score <= 5) {
      return `hsla(120, ${score * 20}%, 50%, 0.75)`; // Gradual shift to Positive (lighter Green) with 50% opacity
    } else {
      return "hsla(120, 100%, 50%, 0.75)"; // Very Positive (Green) with 50% opacity
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

      const updatedEntries = user.journals.filter(
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
    openModal(<div>Delete</div>); // Open the GlobalModal
  };

  // newEntries.forEach((journal) => {
  //   const sentimentResult = analyzeSentiment(journal);
  //   console.log(sentimentResult);
  //   // const color = getSentimentColor(sentimentResult.score);
  //   // console.log(
  //   //   `Journal: "${journal}" | Score: ${sentimentResult.score} | Color: ${color}`
  //   // );
  // });

  const filteredEntries = user?.journals.filter((journal) => {
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
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(filteredEntries?.map((journal) => journal._id) || []);
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
    } catch (error) {
      console.error("Error acknowledging helper text:", error);
    } finally {
      localStorageService.setItem("hasAcknowledgedHelperText", true);
      setHasAcknowledgedHelperText(true);
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
    <div className="flex h-full min-h-screen mt-16 max-w-screen-2xl mx-auto">
      <SideBar
        isOpen={isSidebarOpen}
        sections={[
          {
            title: "Filters",
            content: (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <Checkbox
                    id="select-all"
                    checked={selectedEntries.length === filteredEntries.length}
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
        ]}
        setIsSidebarOpen={setIsSidebarOpen}
        icon={<Settings size={20} />}
      />

      {/* Wrap the entire content in PageWrapper */}
      <div
        className={`flex-1 p-6 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-56 pl-8" : "ml-24 pl-4"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Journals</h1>
          <SearchInput
            query={query}
            handleSearch={handleSearch}
            userEntries={user.journals}
            containerClassName="max-w-xs"
            inputClassName="border rounded p-1 text-sm"
          />
        </div>
        <ToggleGroup.Root
          type="single"
          value={viewMode}
          onValueChange={(value) =>
            value && setViewMode(value as "list" | "icons")
          }
          className="flex items-center  mb-4"
        >
          {" "}
          <ToggleGroup.Item
            value="icons"
            aria-label="Icon View"
            className={`hidden md:flex items-center space-x-2 px-3 py-2  rounded rounded-r-none ${
              viewMode === "icons" ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <ViewGridIcon />
            {/* <span className="text-sm">Icon View</span> */}
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="list"
            aria-label="List View"
            className={`flex items-center space-x-2 px-3 py-2 rounded rounded-l-none ${
              viewMode === "list" ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <ViewHorizontalIcon />
            {/* <span className="text-sm">List View</span> */}
          </ToggleGroup.Item>
        </ToggleGroup.Root>
        <div
          className={`grid ${
            viewMode === "list"
              ? "grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          } gap-6`}
        >
          {filteredEntries.length === 0 ? (
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
            filteredEntries.map((journal, index) => (
              <Card
                key={index}
                className={`hover:shadow-lg transition-shadow duration-200 flex flex-col ${
                  selectedEntries.includes(journal._id) ? "bg-blue-100" : ""
                }`} // Reset background color for selected journals
              >
                <div className="flex flex-col flex-grow">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="wrap text-wrap overflow-wrap">
                        {journal.title.length > 30
                          ? `${journal.title.substring(0, 30)}...`
                          : journal.title}
                      </CardTitle>
                      <div className="relative p-0 m-0">
                        {index === 0 && (
                          <Joyride
                            callback={handleJoyrideCallback}
                            // continuous
                            run={helperTextState.run}
                            // scrollToFirstStep
                            // showProgress
                            // showSkipButton
                            disableOverlayClose={true}
                            steps={helperTextState.steps}
                            // styles={{
                            //   options: {
                            //     zIndex: 10000,
                            //   },
                            // }}
                            tooltipComponent={HelperText}
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
                                className="w-8 h-8 cursor-pointer helper-text-step"
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
                  <CardContent>
                    {/* ... existing CardContent ... */}
                  </CardContent>
                  <CardFooter className="mt-auto flex justify-between items-end">
                    <div className="flex flex-col">
                      <p>{journal.category}</p>
                      <p className="text-sm text-gray-500">{journal.date}</p>
                      {showSentiment && (
                        <div className="flex items-center text-sm mt-1">
                          <span className="mr-2">Sentiment:</span>
                          <div
                            className="rounded-full"
                            style={{
                              width: "10px",
                              height: "10px",
                              backgroundColor: getSentimentColor(
                                analyzeSentiment(journal.entry).score
                              ),
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      {loadingJournalId === journal._id ? (
                        <Spinner size="sm" className="mr-2" />
                      ) : (
                        <>
                          <StarIcon
                            filled={journal.favorite}
                            onClick={() => handleFavorite(journal._id)}
                            className="mr-2"
                          />
                        </>
                      )}
                      <TrashIcon
                        fontSize={20}
                        className="w-5 h-5 text-red-500 cursor-pointer"
                        onClick={() => openDeleteModal(journal._id)} // Open GlobalModal on click
                      />
                    </div>
                  </CardFooter>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
      {/* Global Modal */}
      <GlobalModal />
    </div>
  );
}
