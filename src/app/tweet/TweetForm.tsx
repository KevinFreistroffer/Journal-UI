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
    <>
      <textarea
        value={tweetText}
        onChange={(e) => setTweetText(e.target.value)}
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={handleTweet}>Tweet</button>
      <div>{result}</div>
    </>
  );
}
