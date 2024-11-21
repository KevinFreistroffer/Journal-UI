"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { localStorageService } from "@/lib/services/localStorageService";
import { IFrontEndJournal } from "@/app/(protected)/dashboard/UserDashboard";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { IJournal } from "@/lib/interfaces";
import Link from "next/link";
import { Settings } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/ui/__layout__/PageContainer/PageContainer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ViewToggle } from "@/components/ui/ViewToggle/ViewToggle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import DashboardContainer from "@/components/ui/__layout__/DashboardContainer/DashboardContainer";

export default function JournalPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedJournal, setSelectedJournal] =
    useState<IFrontEndJournal | null>(null); // Added state for selectedJournal
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true); // Add this line
  const [showCategory, setShowCategory] = useState(true);
  const [showLastUpdated, setShowLastUpdated] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contentWidth, setContentWidth] = useState<"default" | "full">(
    "default"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previousWidth, setPreviousWidth] = useState<"default" | "full">(
    "default"
  );

  // Add this media query hook
  const isLargeScreen = useMediaQuery("(min-width: 1245px)");

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        setIsLoading(true); // Add this line

        // Get from local storage
        const localStoredJournal =
          localStorageService.getItem<IJournal>("selectedJournal");

        if (
          !localStoredJournal ||
          localStoredJournal._id !== (params.id as string)
        ) {
          // If not found, get it from the user.
          const usersJournal = user?.journals.find(
            (journal) => journal._id === (params.id as string)
          ); // Changed variable name for clarity

          if (!usersJournal) {
            // If not found get it from the API.

            // fetch the journal from the server
            const response = await fetch(
              `/api/user/entry?id=${params.id as string}`
            );
            const journal = await response.json();

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
      //
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

  return (
    <DashboardContainer isSidebarOpen={false}>
      <div
        className={cn(
          "flex-1 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out md:ml-0",
          isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-black" : ""
        )}
      >
        <div
          className={cn(
            "flex justify-end p-4 sticky top-0 z-10 bg-white dark:bg-black",
            !isFullscreen ? "pt-0 pr-0" : ""
          )}
        >
          <div className="hidden sm:block">
            <ViewToggle
              isFullscreen={isFullscreen}
              contentWidth={contentWidth}
              showDefaultWidth={isLargeScreen}
              showFullWidth={isLargeScreen}
              onToggle={(value) => {
                if (isFullscreen) {
                  setIsFullscreen(false);
                  setContentWidth(previousWidth);
                } else if (value === "fullscreen") {
                  setPreviousWidth(contentWidth);
                  setIsFullscreen(true);
                } else {
                  setContentWidth(value as "default" | "full");
                }
              }}
            />
          </div>
        </div>

        <div
          className={cn(
            "flex-1 flex justify-center w-full transition-all duration-300",
            contentWidth === "default"
              ? "max-w-6xl mx-auto"
              : "max-w-[95%] mx-auto",
            isFullscreen ? "overflow-y-auto" : "",
            "pb-20"
          )}
        >
          <div
            className={cn(
              "w-full transition-all duration-300 relative",
              contentWidth === "default"
                ? "md:max-w-[51.0625rem]"
                : "md:max-w-full"
            )}
          >
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Journal Settings</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col space-y-4">
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
              </DialogContent>
            </Dialog>

            {isLoading ? (
              <div className="min-h-screen flex justify-center items-center">
                <Spinner />
              </div>
            ) : !selectedJournal ? (
              <div className="text-center min-h-screen flex flex-col justify-center items-center">
                <p className="mb-4">Could not find the requested journal.</p>
                <Link
                  href="/journals"
                  className="text-blue-500 hover:underline"
                >
                  Return to Journals Page
                </Link>
              </div>
            ) : (
              <Card
                className={cn(
                  "min-h-[500px] flex flex-col p-8 relative",
                  isFullscreen ? "h-[calc(100vh-8rem)]" : ""
                )}
              >
                <CardHeader className="text-center mb-6 relative">
                  <CardTitle>{selectedJournal.title}</CardTitle>
                  <div className="absolute right-0 top-0 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSettingsOpen(true)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/journal/edit/${params.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <div
                    className="mb-4 flex-grow"
                    dangerouslySetInnerHTML={{
                      __html: decodeHtmlEntities(selectedJournal.entry),
                    }}
                  />
                  <div className="mt-auto">
                    {showCategory && (
                      <p className="text-sm text-gray-300">
                        Category:{" "}
                        {selectedJournal.categories
                          .map((category) => category.category)
                          .join(", ")}
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
    </DashboardContainer>
  );
}
