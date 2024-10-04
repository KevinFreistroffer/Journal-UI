"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { localStorageService } from "@/lib/services/localStorageService";
import { IFrontEndJournal } from "@/app/dashboard/UserDashboard";
import { Spinner } from "@/components/ui/spinner";
export default function JournalPage() {
  const router = useRouter();
  const [selectedJournal, setSelectedJournal] =
    useState<IFrontEndJournal | null>(null); // Added state for selectedJournal

  useEffect(() => {
    const savedJournal =
      localStorageService.getItem<IFrontEndJournal>("selectedJournal");

    if (savedJournal) {
      console.log("savedJournal", savedJournal);

      setSelectedJournal(savedJournal); // Set state with saved entrie

      localStorageService.setItem("selectedJournal", savedJournal);
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  const handleGoBack = () => {
    router.push("/dashboard");
  };

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
          <Button onClick={handleGoBack} className="mb-4">
            <ChevronLeft className="mr-2" /> Go back
          </Button>
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
