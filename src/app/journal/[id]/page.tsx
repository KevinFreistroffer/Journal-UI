"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { localStorageService } from "@/lib/services/localStorageService";
import { IFrontEndEntry } from "@/app/dashboard/UserDashboard";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { IJournal } from "@/lib/interfaces";

export default function EntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedEntry, setSelectedEntry] = useState<IFrontEndEntry | null>(
    null
  ); // Added state for selectedEntry
  const { user } = useAuth();
  console.log("searchParams", searchParams);
  const id = searchParams.get("id");

  useEffect(() => {
    const savedEntry = localStorageService.getItem<IJournal>("selectedEntry");

    if (savedEntry) {
      setSelectedEntry(savedEntry); // Set state with saved journal
    } else {
      const foundEntry = user?.journals.find((journal) => journal._id === id); // Changed variable name for clarity

      if (foundEntry) {
        setSelectedEntry(foundEntry); // Set state with found journal

        localStorageService.setItem("selectedEntry", foundEntry);
      }
    }
  }, [id, user]); // Ensure this effect runs when id or user changes

  useEffect(() => {
    const handleSearchParamsChange = () => {
      console.log("handleSearchParamsChange", id);
      const savedEntry = user?.journals.find((journal) => journal._id === id);

      if (savedEntry) {
        setSelectedEntry(savedEntry); // Set state with saved journal
        localStorageService.setItem("selectedEntry", savedEntry); // Save journal to local storage
      }
    };

    handleSearchParamsChange();
  }, [searchParams, user, id]);

  const handleGoBack = () => {
    router.push("/dashboard");
  };

  return (
    <div
      className={`container mx-auto p-4 min-h-screen ${
        !selectedEntry ? "flex justify-center items-center" : ""
      }`}
    >
      {!selectedEntry ? (
        <div className="">
          <Spinner />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{selectedEntry.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{selectedEntry.journal}</p>
              <p className="text-sm text-gray-500 mt-2">
                Category: {selectedEntry.category}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
