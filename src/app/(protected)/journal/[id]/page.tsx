"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { localStorageService } from "@/lib/services/localStorageService";
import { IFrontEndJournal } from "@/app/dashboard/UserDashboard";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { IJournal } from "@/lib/interfaces";

export default function JournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedJournal, setSelectedJournal] =
    useState<IFrontEndJournal | null>(null); // Added state for selectedJournal
  const { user } = useAuth();
  console.log("searchParams", searchParams);
  const id = searchParams.get("id");

  useEffect(() => {
    const savedJournal =
      localStorageService.getItem<IJournal>("selectedJournal");

    if (savedJournal) {
      setSelectedJournal(savedJournal); // Set state with saved journal
    } else {
      const foundJournal = user?.journals.find((journal) => journal._id === id); // Changed variable name for clarity

      if (foundJournal) {
        setSelectedJournal(foundJournal); // Set state with found journal

        localStorageService.setItem("selectedJournal", foundJournal);
      }
    }
  }, [id, user]); // Ensure this effect runs when id or user changes

  useEffect(() => {
    const handleSearchParamsChange = () => {
      console.log("handleSearchParamsChange", id);
      const savedJournal = user?.journals.find((journal) => journal._id === id);

      if (savedJournal) {
        setSelectedJournal(savedJournal); // Set state with saved journal
        localStorageService.setItem("selectedJournal", savedJournal); // Save journal to local storage
      }
    };

    handleSearchParamsChange();
  }, [searchParams, user, id]);

  const handleGoBack = () => {
    router.push("/dashboard");
  };
  console.log(handleGoBack);

  return (
    <div
      className={`container mx-auto p-4 min-h-screen ${
        !selectedJournal ? "flex justify-center items-center" : ""
      }`}
    >
      {!selectedJournal ? (
        <div className="">
          <Spinner />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{selectedJournal.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{selectedJournal.entry}</p>
              <p className="text-sm text-gray-500 mt-2">
                Category: {selectedJournal.category}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
