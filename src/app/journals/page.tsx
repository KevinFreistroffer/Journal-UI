"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Adjust the import based on your project structure
import { Spinner } from "@/components/ui/spinner"; // Import a spinner component if you have one
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { List, Grid } from "lucide-react"; // Import icons for list and grid views
import nlp from "compromise";
import Sentiment from "sentiment";

export default function JournalsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "icons">("icons"); // State for view mode
  const router = useRouter();
  const { user } = useAuth();

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
      return "hsla(0, 100%, 50%, 0.15)"; // Very Negative (Red) with 50% opacity
    } else if (score < 0) {
      return `hsla(0, ${100 + score * 20}%, 50%, 0.15)`; // Gradual shift to Neutral (lighter Red) with 50% opacity
    } else if (score === 0) {
      return "hsla(0, 0%, 70%, 0.15)"; // Neutral (Gray) with 50% opacity
    } else if (score <= 5) {
      return `hsla(120, ${score * 20}%, 50%, 0.15)`; // Gradual shift to Positive (lighter Green) with 50% opacity
    } else {
      return "hsla(120, 100%, 50%, 0.15)"; // Very Positive (Green) with 50% opacity
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
              style={{
                borderBottom: `4px solid ${getSentimentColor(
                  analyzeSentiment(journal.entry).score
                )}`,
              }}
              className="relative cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => router.push(`/journal/${journal._id}`)} // Navigate to the journal page
            >
              <CardHeader>
                <CardTitle>
                  {journal.title.length > 30
                    ? `${journal.title.substring(0, 30)}...`
                    : journal.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="">
                {/* Example of a small square with background color */}
                <p className="text-sm text-gray-500">{journal.date}</p>{" "}
                {/* <div className="w-5 h-5 bg-red-500 rounded-full"></div> */}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
