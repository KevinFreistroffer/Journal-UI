"use client";

import { useState, useEffect } from "react";
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
import { List, Grid, BookOpen, XIcon, Star } from "lucide-react"; // Import icons for list, grid, and eye views
import nlp from "compromise";
import Sentiment from "sentiment";
import StarIcon from "@/components/ui/StarIcon";
import { Tooltip } from "@radix-ui/themes";
import { localStorageService } from "@/lib/services/localStorageService";
import Carrot from "@/components/ui/Carrot/Carrot";
export default function JournalsPage() {
  const [viewMode, setViewMode] = useState<"list" | "icons">("icons"); // State for view mode
  const [showSentiment, setShowSentiment] = useState(true); // State to show or hide sentiment
  const [showHelperText, setShowHelperText] = useState<boolean>(false);
  const [favoriteJournals, setFavoriteJournals] = useState<string[]>([]); // State for favorite journals
  const [loadingJournalId, setLoadingJournalId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

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

  const handleFavorite = async (journalId: string) => {
    setLoadingJournalId(journalId); // Set the loading state for the specific journal
    try {
      // Send API request to edit the journal
      const response = await fetch(`/user/journal/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ journalId }), // Include the journal ID in the request body
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

  newEntries.forEach((entry) => {
    const sentimentResult = analyzeSentiment(entry);
    // const color = getSentimentColor(sentimentResult.score);
    // console.log(
    //   `Entry: "${entry}" | Score: ${sentimentResult.score} | Color: ${color}`
    // );
  });

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Your Journals</h1>
      <div className="flex space-x-2 mb-4">
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
      </div>
      <div
        className={`grid ${
          viewMode === "list"
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        } gap-6`}
      >
        {user.journals.length === 0 ? (
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
          user.journals.map((journal, index) => (
            <Card
              key={index}
              className="relative  hover:shadow-lg transition-shadow duration-200"
            >
              <h1>{showHelperText.toString()}</h1>
              <CardHeader>
                <div className="flex flex-col justify-between items-start">
                  <div className="flex w-full justify-between items-center">
                    <CardTitle className="wrap text-wrap overflow-wrap">
                      {journal.title.length > 30
                        ? `${journal.title.substring(0, 30)}...`
                        : journal.title}
                    </CardTitle>
                    <div className="absolute top-4 right-4 m-4">
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
                          {/* Add arrow icon in the bottom left corner */}
                          <Carrot className="absolute bottom-0 left-0" />
                        </div>
                      )}
                      <BookOpen
                        className="w-8 h-8 cursor-pointer"
                        onClick={() => router.push(`/journal/${journal._id}`)}
                      />
                    </div>
                    {/* <HelperText
                      text="Click the book icon to read your journal!"
                    //   isVisible={index === 0 && showHelperText}
                    //   onClick={handleCloseHelper}
                    >
                      <BookOpen
                        className="w-8 h-8 cursor-pointer ml-4"
                        onClick={() => router.push(`/journal/${journal._id}`)}
                      />
                    </HelperText> */}
                  </div>
                </div>
              </CardHeader>
              <CardContent className=""></CardContent>
              <CardFooter className="flex  justify-between items-center">
                <div className="flex flex-col">
                  <p>{journal.category}</p>
                  <p className="text-sm text-gray-500">{journal.date}</p>
                  {showSentiment && (
                    <div className=" flex items-center text-sm">
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
                <div className="flex justify-between items-center">
                  {loadingJournalId === journal._id ? ( // Show loading indicator if this journal is loading
                    <Spinner />
                  ) : (
                    <StarIcon
                      filled={favoriteJournals.includes(journal._id)}
                      onClick={() => handleFavorite(journal._id)}
                    />
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
