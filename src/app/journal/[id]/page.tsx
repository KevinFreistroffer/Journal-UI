"use client";

import { useJournal } from "@/hooks/useJournal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function JournalPage() {
  const { selectedJournal } = useJournal();

  if (!selectedJournal) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
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
    </div>
  );
}
