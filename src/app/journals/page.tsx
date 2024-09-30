"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Adjust the import based on your project structure
import { Spinner } from "@/components/ui/spinner"; // Import a spinner component if you have one
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { List, Grid } from "lucide-react"; // Import icons for list and grid views

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

  return (
    <div className="p-6">
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
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => router.push(`/journal/${journal._id}`)} // Navigate to the journal page
            >
              <CardHeader>
                <CardTitle>
                  {journal.title.length > 30
                    ? `${journal.title.substring(0, 30)}...`
                    : journal.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{journal.date}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
