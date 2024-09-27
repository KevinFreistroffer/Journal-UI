"use client";

import { useJournal } from "@/hooks/useJournal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { localStorageService } from "@/lib/services/localStorageService";
import { IFrontEndJournal } from "@/app/dashboard/UserDashboard";

export default function JournalPage() {
  const { selectedJournal, setSelectedJournal } = useJournal();
  const router = useRouter();

  useEffect(() => {
    if (!selectedJournal) {
      const savedJournal =
        localStorageService.getItem<IFrontEndJournal>("selectedJournal");
      if (savedJournal) {
        setSelectedJournal(savedJournal);
      } else {
        router.push("/dashboard");
      }
    }
  }, [selectedJournal, setSelectedJournal, router]);

  const handleGoBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="container mx-auto p-4">
      {!selectedJournal ? (
        <div>Loading...</div>
      ) : (
        <>
          <Button onClick={handleGoBack} className="mb-4">
            Go back
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
