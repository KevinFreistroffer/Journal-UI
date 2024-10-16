"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { localStorageService } from "@/lib/services/localStorageService";
import { IFrontEndJournal } from "@/app/(protected)/dashboard/UserDashboard";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { IJournal } from "@/lib/interfaces";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar/Sidebar"; // Import Sidebar component
import { Settings } from "lucide-react";
export default function JournalPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedJournal, setSelectedJournal] =
    useState<IFrontEndJournal | null>(null); // Added state for selectedJournal
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true); // Add this line
  const [showCategory, setShowCategory] = useState(true);
  const [showLastUpdated, setShowLastUpdated] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        setIsLoading(true); // Add this line

        // Get from local storage
        const localStoredJournal =
          localStorageService.getItem<IJournal>("selectedJournal");
        console.log("localStoredJournal", localStoredJournal);

        if (
          !localStoredJournal ||
          localStoredJournal._id !== (params.id as string)
        ) {
          // If not found, get it from the user.
          const usersJournal = user?.journals.find(
            (journal) => journal._id === (params.id as string)
          ); // Changed variable name for clarity
          console.log("foundJournal", usersJournal);

          if (!usersJournal) {
            // If not found get it from the API.

            // fetch the journal from the server
            const response = await fetch(
              `/api/user/entry?id=${params.id as string}`
            );
            const journal = await response.json();
            console.log("journal response", journal);
            setSelectedJournal(journal);
            localStorageService.setItem("selectedJournal", journal);
          }
          if (usersJournal) {
            setSelectedJournal(usersJournal); // Set state with found journal
            localStorageService.setItem("selectedJournal", usersJournal);
          }
          setIsLoading(false); // Add this line
        }
      } catch (error) {
        console.error("Error fetching journal:", error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
      // if (usersJournal === id) {
      //   setSelectedJournal(usersJournal); // Set state with saved journal
      //   setIsLoading(false); // Add this line
      // } else {
      //   const foundJournal = user?.journals.find(
      //     (journal) => journal._id === id
      //   ); // Changed variable name for clarity
      //   console.log("foundJournal", foundJournal);
      //   if (foundJournal) {
      //     setSelectedJournal(foundJournal); // Set state with found journal
      //     localStorageService.setItem("selectedJournal", foundJournal);
      //   }
      //   setIsLoading(false); // Add this line
      // }
    };
    if (params.id as string) {
      fetchJournal();
    } else {
      setIsLoading(false);
    }
  }, [params.id, user?.journals]); // Ensure this effect runs when id or user changes

  useEffect(() => {
    const handleParamsChange = () => {
      console.log("handleParamsChange", params.id as string);
      const savedJournal = user?.journals.find(
        (journal) => journal._id === (params.id as string)
      );

      if (savedJournal) {
        setSelectedJournal(savedJournal); // Set state with saved journal
        localStorageService.setItem("selectedJournal", savedJournal); // Save journal to local storage
      }
    };

    handleParamsChange();
  }, [user, params.id]);

  const handleGoBack = () => {
    router.push("/dashboard");
  };
  console.log(handleGoBack);

  return (
    <div className="p-6 min-h-screen flex">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        icon={<Settings />}
        sections={[
          {
            title: "Settings",
            content: (
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="show-category"
                    className="text-sm font-medium"
                  >
                    Show Category
                  </label>
                  <input
                    type="checkbox"
                    id="show-category"
                    checked={showCategory}
                    onChange={(e) => setShowCategory(e.target.checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="show-last-updated"
                    className="text-sm font-medium"
                  >
                    Show Last Updated
                  </label>
                  <input
                    type="checkbox"
                    id="show-last-updated"
                    checked={showLastUpdated}
                    onChange={(e) => setShowLastUpdated(e.target.checked)}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-56" : "md:ml-24"
        }`}
      >
        <div className="max-w-4xl mx-auto ">
          {isLoading ? (
            <div className="min-h-screen flex justify-center items-center">
              <Spinner />
            </div>
          ) : !selectedJournal ? (
            <div className="text-center min-h-screen flex flex-col justify-center items-center">
              <p className="mb-4">Could not find the requested journal.</p>
              <Link href="/journals" className="text-blue-500 hover:underline">
                Return to Journals Page
              </Link>
            </div>
          ) : (
            <Card className="min-h-[500px] flex flex-col bg-gray-900 text-white p-8 ">
              <CardHeader className="text-center mb-6">
                <CardTitle>{selectedJournal.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="mb-4 flex-grow">{selectedJournal.entry}</p>
                <div className="mt-auto">
                  {showCategory && (
                    <p className="text-sm text-gray-300">
                      Category: {selectedJournal.category}
                    </p>
                  )}
                  {showLastUpdated && (
                    <p className="text-sm text-gray-300">
                      Last updated:{" "}
                      {selectedJournal.updatedAt
                        ? new Date(selectedJournal.updatedAt).toLocaleString()
                        : "N/A"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
