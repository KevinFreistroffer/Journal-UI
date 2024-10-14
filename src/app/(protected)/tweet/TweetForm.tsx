"use client";

import { useState } from "react";

export default function TweetForm() {
  const [tweetText, setTweetText] = useState("");
  const [result, setResult] = useState("");

  const handleTweet = async () => {
    if (!tweetText) {
      setResult("Please enter some text to tweet.");
      return;
    }

    try {
      const response = await fetch("/api/user/x/tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: tweetText }),
      });

      if (!response.ok) {
        throw new Error("Failed to post tweet");
      }

      const data = await response.json();
      setResult(`Tweet posted successfully! Tweet ID: ${data.data.id}`);
      setTweetText("");
    } catch (error) {
      console.error("Error:", error);
      setResult("Failed to post tweet. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <textarea
        value={tweetText}
        onChange={(e) => setTweetText(e.target.value)}
        rows={4}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="What's happening?"
      />
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">{280 - tweetText.length} characters remaining</span>
        <button
          onClick={handleTweet}
          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Tweet
        </button>
      </div>
      {result && (
        <div className={`mt-4 p-2 rounded-md ${
          result.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {result}
        </div>
      )}
    </div>
  );
}
