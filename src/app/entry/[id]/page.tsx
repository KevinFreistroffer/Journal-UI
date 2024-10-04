"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { localStorageService } from "@/lib/services/localStorageService";
import { IFrontEndEntry } from "@/app/dashboard/UserDashboard";
import { Spinner } from "@/components/ui/spinner";
export default function EntryPage() {
  const router = useRouter();
  const [selectedEntry, setSelectedEntry] = useState<IFrontEndEntry | null>(
    null
  ); // Added state for selectedEntry

  useEffect(() => {
    const savedEntry =
      localStorageService.getItem<IFrontEndEntry>("selectedEntry");

    if (savedEntry) {
      console.log("savedEntry", savedEntry);

      setSelectedEntry(savedEntry); // Set state with saved entrie

      localStorageService.setItem("selectedEntry", savedEntry);
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
        !selectedEntry ? "flex justify-center items-center" : ""
      }`}
    >
      {!selectedEntry ? (
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
              <CardTitle>{selectedEntry.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{selectedEntry.entry}</p>
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
