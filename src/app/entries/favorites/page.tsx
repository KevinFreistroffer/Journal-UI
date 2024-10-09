"use client";

import { IEntry } from "@/lib/interfaces";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { PartialWidthPageContainer } from "@/components/ui/PartialWidthPageContainer";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<IEntry[]>([]);
  const [selectedJournals, setSelectedJournals] = useState<string[]>([]);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setFavorites(user.entries.filter((entry) => entry.favorite));
    }
  }, [user]);

  const handleSelectJournal = (journalId: string) => {
    setSelectedJournals((prev) =>
      prev.includes(journalId)
        ? prev.filter((id) => id !== journalId)
        : [...prev, journalId]
    );
  };

  const handleUnfavorite = async () => {
    //     const updatedEntries = user?.entries.map((entry) => {
    //       if (selectedJournals.includes(entry._id)) {
    //         return { ...entry, favorite: false };
    //       }
    //       return entry;
    //     });
    //     if (updatedEntries) {
    //       await updateUser(user.uid, { entries: updatedEntries });
    //     }
    //   };
    //
  };

  const handleSelectAll = () => {
    if (selectedJournals.length === favorites.length) {
      setSelectedJournals([]);
    } else {
      setSelectedJournals(favorites.map((journal) => journal._id));
    }
  };

  const handleJournalClick = (entryId: string) => {
    router.push(`/entry/${entryId}`);
  };

  return (
    <PartialWidthPageContainer>
      <div className="container mx-auto p-4 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Favorite Journals</h1>

        <div className="border border-gray-200 bg-gray-50 rounded-lg p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <>
              {favorites.length === 0 ? (
                <p>You have no favorite journals.</p>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedJournals.length === favorites.length}
                        onChange={handleSelectAll}
                        className="mr-2 w-5 h-5" // Updated: Increased width and height
                      />
                      Select All
                    </label>
                    <button
                      onClick={handleUnfavorite}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      disabled={selectedJournals.length === 0}
                    >
                      Unfavorite Selected ({selectedJournals.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((journal) => (
                      <Card key={journal._id} className="relative bg-white">
                        <CardHeader>
                          <h3
                            className="text-lg font-semibold cursor-pointer hover:underline"
                            onClick={() => handleJournalClick(journal._id)}
                          >
                            {journal.title}
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            Category: {journal.category}
                          </p>
                          <p className="text-sm text-gray-600">
                            Date:{" "}
                            {format(
                              new Date(journal.date),
                              "EEEE, MMMM d, yyyy 'at' h:mm a"
                            )}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                          <input
                            type="checkbox"
                            checked={selectedJournals.includes(journal._id)}
                            onChange={() => handleSelectJournal(journal._id)}
                            className="absolute top-2 right-2 w-5 h-5" // Updated: Increased width and height
                          />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </PartialWidthPageContainer>
  );
}
