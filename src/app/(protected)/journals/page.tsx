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
import StarIcon from "@/components/ui/StarIcon/StarIcon";
// import { Tooltip } from "@radix-ui/themes";
import { localStorageService } from "@/lib/services/localStorageService";
import { Checkbox } from "@/components/ui/Checkbox"; // Import the Checkbox component
import { PartialWidthPageContainer } from "@/components/ui/PartialWidthPageContainer"; // Import the PageWrapper component
import { ModalContext } from "@/GlobalModalContext"; // Import ModalContext
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

export default function JournalsPage() {
  const [viewMode, setViewMode] = useState<"list" | "icons">("icons"); // State for view mode
  const [showSentiment, setShowSentiment] = useState(true); // State to show or hide sentiment
  const [showHelperText, setShowHelperText] = useState<boolean>(false);
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

  const handleCloseHelper = () => {
    console.log("handleCloseHelper()");
    // Close the helper text using localStorageService
    const hasSeenHelperText = localStorageService.getItem("hasSeenHelperText");
    console.log("hasSeenHelperText", hasSeenHelperText);
    // If not, show the helper text
    setShowHelperText((state) => !state);
    localStorageService.setItem("hasSeenHelperText", true);
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
    const hasSeenHelperText = localStorageService.getItem("hasSeenHelperText");

    // If not, show the helper text
    if (!hasSeenHelperText) {
      setShowHelperText(true);
    }
  }, []);

  useEffect(() => {}, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner /> {/* Show a loading spinner while loading */}
      </div>
    );
  }

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

  newEntries.forEach((journal) => {
    const sentimentResult = analyzeSentiment(journal);
    console.log(sentimentResult);
    // const color = getSentimentColor(sentimentResult.score);
    // console.log(
    //   `Journal: "${journal}" | Score: ${sentimentResult.score} | Color: ${color}`
    // );
  });

  const filteredEntries = showFavoritesOnly
    ? user.journals.filter((journal) => journal.favorite)
    : user.journals;

  // Filter journals by selected date
  const dateFilteredEntries = selectedDate
    ? filteredEntries.filter(
        (journal) =>
          new Date(journal.date).toDateString() ===
          new Date(selectedDate).toDateString()
      )
    : filteredEntries;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(filteredEntries.map((journal) => journal._id));
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

  return (
    <div className="flex h-full min-h-screen mt-16">
      <SideBar
        isOpen={isSidebarOpen}
        sections={[
          {
            title: "",
            content: (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select All
                  </label>
                  <Checkbox
                    id="select-all"
                    checked={selectedEntries.length === filteredEntries.length}
                    onCheckedChange={handleSelectAll}
                    className="bg-white border-gray-300"
                    size={4}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="show-sentiment"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Sentiment
                  </label>
                  <Checkbox
                    id="show-sentiment"
                    checked={showSentiment}
                    onCheckedChange={(checked) =>
                      setShowSentiment(checked as boolean)
                    }
                    className="bg-white border-gray-300"
                    size={5}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="show-favorites"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Favorites Only
                  </label>{" "}
                  <Checkbox
                    id="show-favorites"
                    checked={showFavoritesOnly}
                    onCheckedChange={(checked) =>
                      setShowFavoritesOnly(checked as boolean)
                    }
                    className="bg-white border-gray-300"
                    size={5}
                  />
                </div>
              </div>
            ),
          },
          {
            title: "Filters",
            content: (
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
          <Input
            type="search"
            placeholder="Search journals..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex  space-x-2 ">
            <input
              type="radio"
              id="list-view"
              name="view-mode"
              value="list"
              checked={viewMode === "list"}
              onChange={() => setViewMode("list")}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <label
              htmlFor="list-view"
              className="flex items-center cursor-pointer text-sm"
            >
              {/* <List className="w-4 h-4 mr-2" /> */}
              List View
            </label>
          </div>
          <div className="hidden md:flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="icon-view"
                name="view-mode"
                value="icons"
                checked={viewMode === "icons"}
                onChange={() => setViewMode("icons")}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <label
                htmlFor="icon-view"
                className="flex items-center cursor-pointer text-sm"
              >
                {/* <Grid className="w-4 h-4 mr-2" /> */}
                Icon View
              </label>
            </div>
          </div>
        </div>
        <div
          className={`grid ${
            viewMode === "list"
              ? "grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          } gap-6`}
        >
          {dateFilteredEntries.length === 0 ? ( // Use dateFilteredEntries for rendering
            <div>
              <p>No journals found.</p>
              <Link
                href="/journal/write"
                className="text-blue-500 hover:underline"
              >
                Create an journal
              </Link>
            </div>
          ) : (
            dateFilteredEntries.map((journal, index) => (
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
                        {index === 0 && showHelperText && (
                          <div
                            style={{ top: -98, width: 307 }}
                            className="helper-text bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 pr-12 py-3 rounded absolute"
                            role="alert"
                          >
                            <strong className="font-bold">Tip! </strong>
                            <span className="block sm:inline">
                              Click the book icon to read your journal!
                            </span>
                            <button
                              onClick={handleCloseHelper}
                              className="absolute top-0 right-0 p-4"
                            >
                              <XIcon className="h-6 w-6 text-yellow-500" />
                            </button>
                            <Carrot className="absolute bottom-0 left-0" />{" "}
                          </div>
                        )}
                        <BookOpenText
                          className="w-8 h-8 cursor-pointer"
                          onClick={() => {
                            localStorageService.setItem(
                              "selectedJournal",
                              journal._id
                            );
                            router.push(`/journal/${journal._id}`);
                          }}
                        />
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
                      <Trash2
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
