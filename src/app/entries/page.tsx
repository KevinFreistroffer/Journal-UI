"use client";

import { useState, useEffect, Fragment, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Adjust the import based on your project structure
import { Spinner } from "@/components/ui/spinner"; // Import a spinner component if you have one
import HelperText from "@/components/ui/HelperText/HelperText";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { List, Grid, BookOpenText, XIcon, Star, Trash2 } from "lucide-react"; // Import icons for list, grid, and eye views
import nlp from "compromise";
import Sentiment from "sentiment";
import StarIcon from "@/components/ui/StarIcon/StarIcon";
import { Tooltip } from "@radix-ui/themes";
import { localStorageService } from "@/lib/services/localStorageService";
import Carrot from "@/components/ui/Carrot/Carrot";
import { Checkbox } from "@/components/ui/checkbox"; // Import the Checkbox component
import { PartialWidthPageContainer } from "@/components/ui/PartialWidthPageContainer"; // Import the PageWrapper component
import { ModalContext } from "@/GlobalModalContext"; // Import ModalContext
import GlobalModal from "@/components/ui/GlobalModal"; // Import GlobalModal

export default function EntrysPage() {
  const [viewMode, setViewMode] = useState<"list" | "icons">("icons"); // State for view mode
  const [showSentiment, setShowSentiment] = useState(true); // State to show or hide sentiment
  const [showHelperText, setShowHelperText] = useState<boolean>(false);
  const [favoriteEntrys, setFavoriteEntrys] = useState<string[]>([]); // State for favorite entries
  const [loadingEntryId, setLoadingEntryId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const { openModal, closeModal } = useContext(ModalContext); // Get openModal and closeModal from context
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null); // State to hold the entry ID to delete

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

  const getFrequentKeywords = (entries: any) => {
    const text = entries.join(" "); // Combine all entries into one text block
    const doc = nlp(text);

    // Get most frequent nouns or verbs
    const keywords = doc.nouns().out("frequency");

    return keywords.slice(0, 5); // Get top 5 most frequent words
  };

  const entries = [
    "Today I worked on my project. It was a productive day.",
    "I had a meeting and it went well.",
    "The project is almost done, just need to finish a few tasks.",
  ];
  const sentiment = new Sentiment();
  const analyzeSentiment = (entry) => {
    const result = sentiment.analyze(entry);
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

  const handleFavorite = async (entryId: string) => {
    setLoadingEntryId(entryId); // Set the loading state for the specific entrie
    try {
      // Send API request to edit the entrie
      const response = await fetch(`api/user/entry/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entryId, favorite: true }), // Include the entrie ID in the request body
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite status");
      }

      // Handle successful response (e.g., update state)
      // Example: toggle favorite status in your state
    } catch (error) {
      console.error("Error updating favorite status:", error);
    } finally {
      setLoadingEntryId(null); // Reset loading state
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return; // Exit if no entry is set for deletion

    setLoadingEntryId(entryToDelete);
    try {
      const response = await fetch(`/api/user/entry/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entryId: entryToDelete }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      // Remove the deleted entry from the state
      const updatedEntries = user.entries.filter(
        (entry) => entry._id !== entryToDelete
      );
      // Update the user state with the new entries array
      // setUser({ ...user, entries: updatedEntries });
    } catch (error) {
      console.error("Error deleting entry:", error);
    } finally {
      setLoadingEntryId(null); // Reset loading state
      setEntryToDelete(null); // Reset the entry to delete
    }
  };

  const openDeleteModal = (entryId: string) => {
    setEntryToDelete(entryId); // Set the entry ID to delete
    openModal(); // Open the GlobalModal
  };

  newEntries.forEach((entry) => {
    const sentimentResult = analyzeSentiment(entry);
    // const color = getSentimentColor(sentimentResult.score);
    // console.log(
    //   `Entry: "${entry}" | Score: ${sentimentResult.score} | Color: ${color}`
    // );
  });

  const filteredEntries = showFavoritesOnly
    ? user.entries.filter((entry) => entry.favorite)
    : user.entries;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(filteredEntries.map((entry) => entry._id));
    } else {
      setSelectedEntries([]);
    }
  };

  const handleSelectEntry = (entryId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries((prev) => [...prev, entryId]);
    } else {
      setSelectedEntries((prev) => prev.filter((id) => id !== entryId));
    }
  };

  return (
    <PartialWidthPageContainer className="flex flex-col">
      {" "}
      {/* Wrap the entire content in PageWrapper */}
      <h1 className="text-3xl font-bold mb-6">Your Entries</h1>
      <div className="flex space-x-2 mb-4 items-center">
        <Checkbox
          id="select-all"
          checked={selectedEntries.length === filteredEntries.length}
          onCheckedChange={handleSelectAll}
        />
        <label
          htmlFor="select-all"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Select All
        </label>
        <div className="hidden md:flex space-x-2">
          <button
            className={`flex items-center p-2 rounded ${
              viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4 mr-1" />
            List View
          </button>
          <button
            className={`flex items-center p-2 rounded ${
              viewMode === "icons" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("icons")}
          >
            <Grid className="w-4 h-4 mr-1" />
            Icon View
          </button>
        </div>
        <button
          className={`flex items-center p-2 rounded ${
            showSentiment ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setShowSentiment(!showSentiment)}
        >
          {showSentiment ? "Hide Sentiment" : "Show Sentiment"}
        </button>
        <button
          className={`flex items-center p-2 rounded ${
            showFavoritesOnly ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          {showFavoritesOnly ? "Show All" : "Show Favorites"}
        </button>
      </div>
      <div
        className={`grid ${
          viewMode === "list"
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        } gap-6`}
      >
        {filteredEntries.length === 0 ? (
          <div>
            <p>No entries found.</p>
            <Link href="/entry/write" className="text-blue-500 hover:underline">
              Create an entry
            </Link>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <Card
              key={index}
              className={`hover:shadow-lg transition-shadow duration-200 flex flex-col ${selectedEntries.includes(entry._id) ? 'bg-green-200' : ''}`} // Reset background color for selected entries
            >
              <div className="flex flex-col flex-grow">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="wrap text-wrap overflow-wrap">
                      {entry.title.length > 30
                        ? `${entry.title.substring(0, 30)}...`
                        : entry.title}
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
                            Click the book icon to read your entry!
                          </span>
                          <button
                            onClick={handleCloseHelper}
                            className="absolute top-0 right-0 p-4"
                          >
                            <XIcon className="h-6 w-6 text-yellow-500" />
                          </button>
                          <Carrot className="absolute bottom-0 left-0" />
                        </div>
                      )}
                      <BookOpenText
                        className="w-8 h-8 cursor-pointer"
                        onClick={() => {
                          localStorageService.setItem(
                            "selectedEntry",
                            entry._id
                          );
                          router.push(`/entry/${entry._id}`);
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>{/* ... existing CardContent ... */}</CardContent>
                <CardFooter className="mt-auto flex justify-between items-end">
                  <div className="flex flex-col">
                    <p>{entry.category}</p>
                    <p className="text-sm text-gray-500">{entry.date}</p>
                    {showSentiment && (
                      <div className="flex items-center text-sm mt-1">
                        <span className="mr-2">Sentiment:</span>
                        <div
                          className="rounded-full"
                          style={{
                            width: "10px",
                            height: "10px",
                            backgroundColor: getSentimentColor(
                              analyzeSentiment(entry.entry).score
                            ),
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    {loadingEntryId === entry._id ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <StarIcon
                          filled={entry.favorite}
                          onClick={() => handleFavorite(entry._id)}
                          className="mr-2"
                        />
                        <Trash2
                          className="w-5 h-5 text-red-500 cursor-pointer"
                          onClick={() => openDeleteModal(entry._id)} // Open GlobalModal on click
                        />
                      </>
                    )}
                  </div>
                </CardFooter>
              </div>
            </Card>
          ))
        )}
      </div>
      {/* Global Modal */}
      <GlobalModal onConfirm={handleDelete} onClose={() => closeModal()} />
    </PartialWidthPageContainer>
  );
}