"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Adjust the import based on your project structure
import { Spinner } from "@/components/ui/spinner"; // Import a spinner component if you have one
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { List, Grid, BookOpen, XIcon } from "lucide-react"; // Import icons for list, grid, and eye views
import nlp from "compromise";
import Sentiment from "sentiment";

export default function JournalsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "icons">("icons"); // State for view mode
  const [showSentiment, setShowSentiment] = useState(true); // State to show or hide sentiment
  const [showHelperText, setShowHelperText] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleCloseHelper = () => {
    // Close the helper text and set it in localStorage
    setShowHelperText(false);
    localStorage.setItem("hasSeenHelperText", "true");
  };

  useEffect(() => {
    // Check if the user has seen the helper text
    const hasSeenHelperText = localStorage.getItem("hasSeenHelperText");

    // If not, show the helper text
    if (!hasSeenHelperText) {
      setShowHelperText(true);
    }
  }, []);

  useEffect(() => {
    console.log("user", user);
  }, [user]);

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

  newEntries.forEach((entry) => {
    const sentimentResult = analyzeSentiment(entry);
    const color = getSentimentColor(sentimentResult.score);
    console.log(
      `Entry: "${entry}" | Score: ${sentimentResult.score} | Color: ${color}`
    );
  });

  console.log("getFreq", getFrequentKeywords(entries));

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Your Journals</h1>
      <div className="flex space-x-2 mb-4">
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
            <Link href="/dashboard" className="text-blue-500 hover:underline">
              Create a journal
            </Link>
          </div>
        ) : (
          user.journals.map((journal, index) => (
            <Card
              key={index}
              className="relative  hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <CardTitle>
                  {journal.title.length > 30
                    ? `${journal.title.substring(0, 30)}...`
                    : journal.title}
                </CardTitle>
                <div className="absolute top-4 right-4 m-4">
                  {index === 0 && showHelperText && (
                    <div
                      style={{ top: -88, width: 307 }}
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
                    </div>
                  )}
                  <BookOpen
                    className="w-8 h-8 cursor-pointer"
                    onClick={() => router.push(`/journal/${journal._id}`)}
                  />
                </div>
              </CardHeader>
              <CardContent className="">
                <p className="text-sm text-gray-500">{journal.date}</p>
                {showSentiment && (
                  <div className="mt-8 flex items-center text-sm">
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
