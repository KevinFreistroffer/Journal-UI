"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { IEntry } from "@/lib/interfaces";
import CategoryBreakdown from "@/components/ui/CategoryBreakdown/CategoryBreakdown";
import { ICategoryBreakdown } from "@/components/ui/CategoryBreakdown/CategoryBreakdown";
import { ConstructionIcon, StarIcon } from "lucide-react";
import styles from "@/app/dashboard/UserDashboard.module.css";
import Link from "next/link"; // Import Link for navigation
import { localStorageService } from "@/lib/services/localStorageService";
import { ChevronDown, ChevronUp } from "lucide-react";
import Legend from "@/app/dashboard/Legend";
import { getFrequentKeywords } from "@/lib/utils";
import { IKeywordFrequency } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export interface IFrontEndEntry extends IEntry {
  // Add any additional properties specific to the frontend representation
  // For example, you might want to include a formatted date or a flag for upcoming entries
  formattedDate?: string; // Optional formatted date string for display
  isUpcoming?: boolean; // Flag to indicate if the entry is upcoming
}

function UserDashboard() {
  const { user, isLoading } = useAuth();
  const [totalEntrys, setTotalEntrys] = useState(user?.entries?.length || 0);
  const [categoryData, setCategoryData] = useState<
    { title: string; value: number; color: string }[]
  >([]);
  const [recentEntries, setRecentEntries] = useState<IFrontEndEntry[]>([]);
  const [upcomingEntries, setUpcomingEntries] = useState<IFrontEndEntry[]>([]);
  const [data, setData] = useState<ICategoryBreakdown[]>([]);
  const [showTotalEntrysCard, setShowTotalEntrysCard] = useState(false);
  const [showCategoryBreakdownCard, setShowCategoryBreakdownCard] =
    useState(false);
  const [showRecentEntriesCard, setShowRecentEntriesCard] = useState(false);
  const [showUpcomingEntriesCard, setShowUpcomingEntriesCard] = useState(false);
  const [showFavoriteEntrysCard, setShowFavoriteEntrysCard] = useState(false);
  const [showKeywordFrequencyCard, setShowKeywordFrequencyCard] =
    useState(false);
  const [localStorageValuesFetched, setLocalStorageValuesFetched] = useState({
    totalEntrysCard: false,
    categoryBreakdownCard: false,
    recentEntriesCard: false,
    upcomingEntriesCard: false,
    favoriteEntrysCard: false,
    keywordFrequencyCard: false,
  });
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [favoriteEntries, setFavoriteEntries] = useState<IFrontEndEntry[]>([]);
  const [keywordFrequency, setKeywordFrequency] = useState<IKeywordFrequency[]>(
    []
  );
  const [selectedKeywordType, setSelectedKeywordType] = useState<
    "nouns" | "verbs" | "adjectives" | "terms"
  >("nouns"); // New state for dropdown selection
  const entries = user?.entries;
  const [isLoadingKeywordFrequency, setIsLoadingKeywordFrequency] =
    useState(false); // New loading state
  const [isSelectOpen, setIsSelectOpen] = useState(false); // New state for managing open state

  const handleValueChange = (value: string) => {
    setIsLoadingKeywordFrequency(true);
    setSelectedKeywordType(value);
    setIsSelectOpen(false); // Close the select when an option is selected
  };

  // I guess this would set the initial words?
  useEffect(() => {
    if (user) {
      setIsLoadingKeywordFrequency(true); // Start loading
      const allEntriesText =
        entries?.map(({ title, entry }) => title + " " + entry).join(" ") || "";

      const frequencyData = getFrequentKeywords(
        allEntriesText,
        15,
        selectedKeywordType
      );
      setKeywordFrequency(frequencyData);
      setIsLoadingKeywordFrequency(false); // End loading
    }
  }, [entries, user, selectedKeywordType]);

  useEffect(() => {
    console.log("selectedKeywordType", selectedKeywordType);

    const allEntriesText =
      entries?.map(({ title, entry }) => title + " " + entry).join(" ") || "";

    console.log("allEntriesText", allEntriesText);

    if (selectedKeywordType === "nouns") {
      const nounsFrequency = getFrequentKeywords(allEntriesText, 15, "nouns");
      setKeywordFrequency(nounsFrequency);
    } else if (selectedKeywordType === "verbs") {
      const verbsFrequency = getFrequentKeywords(allEntriesText, 15, "verbs");
      setKeywordFrequency(verbsFrequency);
    } else if (selectedKeywordType === "adjectives") {
      const adjectivesFrequency = getFrequentKeywords(
        allEntriesText,
        15,
        "adjectives"
      );
      setKeywordFrequency(adjectivesFrequency);
    } else if (selectedKeywordType === "terms") {
      const termsFrequency = getFrequentKeywords(allEntriesText, 15, "terms");
      setKeywordFrequency(termsFrequency);
    }
    setIsLoadingKeywordFrequency(false);
  }, [selectedKeywordType, entries]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the 'md' breakpoint in Tailwind
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (user) {
      setTotalEntrys(entries?.length || 0);

      // Calculate category breakdown
      const categories = user?.entryCategories.reduce((acc, category) => {
        acc[category.category] = (acc[category.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const getRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };

      if (categories) {
        const categoryData = Object.entries(categories).map(
          ([title, value]) => {
            return {
              name: title,
              count: value,
            };
          }
        );

        setCategoryData(
          Object.entries(categories).map(([title, value]) => {
            return {
              title,
              value,
              color: getRandomColor(),
            };
          })
        );

        const data: ICategoryBreakdown[] = categoryData.map(
          ({ name, count }) => ({
            id: name,
            label: name,
            value: count,
            color: getRandomColor(),
          })
        );

        setData(data);
      }

      // Get recent entries (last 5 for example)
      setRecentEntries(entries?.slice(-5).reverse() || []);

      // Get upcoming entries (assuming you have a date field)
      const today = new Date();
      setUpcomingEntries(
        entries?.filter((entrie) => new Date(entrie.date) > today) || []
      );

      // Get favorite entries
      setFavoriteEntries(entries?.filter((entry) => entry.favorite) || []);
    }
  }, [user, entries]);

  useEffect(() => {
    const fetchLocalStorageValues = () => {
      const showTotalEntrysCard: boolean | null =
        localStorageService.getItem<boolean>("showTotalEntrysCard");
      setShowTotalEntrysCard(
        showTotalEntrysCard !== null ? showTotalEntrysCard : true
      );
      setLocalStorageValuesFetched((prev) => ({
        ...prev,
        totalEntrysCard: true,
      }));

      const showCategoryBreakdownCard: boolean | null =
        localStorageService.getItem<boolean>("showCategoryBreakdownCard");
      setShowCategoryBreakdownCard(
        showCategoryBreakdownCard !== null ? showCategoryBreakdownCard : true
      );
      setLocalStorageValuesFetched((prev) => ({
        ...prev,
        categoryBreakdownCard: true,
      }));

      const showRecentEntriesCard: boolean | null =
        localStorageService.getItem<boolean>("showRecentEntriesCard");
      setShowRecentEntriesCard(
        showRecentEntriesCard !== null ? showRecentEntriesCard : true
      );
      setLocalStorageValuesFetched((prev) => ({
        ...prev,
        recentEntriesCard: true,
      }));

      const showUpcomingEntriesCard: boolean | null =
        localStorageService.getItem<boolean>("showUpcomingEntriesCard");
      setShowUpcomingEntriesCard(
        showUpcomingEntriesCard !== null ? showUpcomingEntriesCard : true
      );
      setLocalStorageValuesFetched((prev) => ({
        ...prev,
        upcomingEntriesCard: true,
      }));

      const showFavoriteEntrysCard: boolean | null =
        localStorageService.getItem<boolean>("showFavoriteEntrysCard");
      setShowFavoriteEntrysCard(
        showFavoriteEntrysCard !== null ? showFavoriteEntrysCard : true
      );
      setLocalStorageValuesFetched((prev) => ({
        ...prev,
        favoriteEntrysCard: true,
      }));

      const showKeywordFrequencyCard: boolean | null =
        localStorageService.getItem<boolean>("showKeywordFrequencyCard");
      setShowKeywordFrequencyCard(
        showKeywordFrequencyCard !== null ? showKeywordFrequencyCard : true
      );
      setLocalStorageValuesFetched((prev) => ({
        ...prev,
        keywordFrequencyCard: true,
      }));
    };

    fetchLocalStorageValues();
  }, []);

  if (isLoading) {
    return <div className="p-6 min-h-screen">Loading...</div>; // Add your spinner or loading state here
  }

  if (!user) {
    return <div className="p-6 min-h-screen">No user found.</div>;
  }

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Legend and Buttons Container */}
      <div className="flex flex-col md:flex-row mb-6">
        {/* Side Section for Legend */}
        <Card className="w-full md:w-1/6 p-4 mt-2 bg-gray-100">
          {" "}
          {/* Wrapped in Card and removed border */}
          {/* Removed border and rounded classes */}
          <Legend
            isMobile={isMobile}
            isLegendOpen={isLegendOpen}
            setIsLegendOpen={setIsLegendOpen}
            showTotalEntrysCard={showTotalEntrysCard}
            setShowTotalEntrysCard={setShowTotalEntrysCard}
            showCategoryBreakdownCard={showCategoryBreakdownCard}
            setShowCategoryBreakdownCard={setShowCategoryBreakdownCard}
            showRecentEntriesCard={showRecentEntriesCard}
            setShowRecentEntriesCard={setShowRecentEntriesCard}
            showUpcomingEntriesCard={showUpcomingEntriesCard}
            setShowUpcomingEntriesCard={setShowUpcomingEntriesCard}
            showFavoriteEntrysCard={showFavoriteEntrysCard}
            setShowFavoriteEntrysCard={setShowFavoriteEntrysCard}
            showKeywordFrequencyCard={showKeywordFrequencyCard} // Added this line
            setShowKeywordFrequencyCard={setShowKeywordFrequencyCard} // Added this line
            showKeywordFrequencyCard={showKeywordFrequencyCard} // Added this line
            setShowKeywordFrequencyCard={setShowKeywordFrequencyCard} // Added this line
          />
        </Card>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row md:flex-wrap w-full md:w-3/4">
          {" "}
          {/* Adjust width as needed */}
          {/* Dashboard Content */}
          <div className="flex flex-col md:flex-row md:flex-wrap">
            {/* Total Number of Entries */}
            {!localStorageValuesFetched.totalEntrysCard ? (
              <PlaceholderCard />
            ) : (
              showTotalEntrysCard && (
                <div className="w-full mb-2 p-2">
                  <Card className="h-full p-4 flex w-full items-center">
                    <h2 className="text-xl font-semibold">
                      Total Number of entries: {totalEntrys}
                    </h2>
                  </Card>
                </div>
              )
            )}

            {/* Category Breakdown */}
            {!localStorageValuesFetched.categoryBreakdownCard ? (
              <PlaceholderCard />
            ) : (
              showCategoryBreakdownCard && (
                <div
                  id={`${styles["categoryBreakdown"]}`}
                  className="w-full mb-2 p-2 md:w-full lg:w-1/2 xl:w-1/3"
                >
                  <Card className="h-full p-4 relative">
                    {" "}
                    {/* Added relative positioning */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">
                        Category Breakdown
                      </h2>
                      <Link
                        href="/categories"
                        className="text-sm self-center text-blue-500"
                      >
                        Manage
                      </Link>
                    </div>
                    <div className="flex justify-center items-center w-full h-full">
                      <CategoryBreakdown data={data} />
                    </div>
                  </Card>
                </div>
              )
            )}

            {/* Recent Activity */}
            {!localStorageValuesFetched.recentEntriesCard ? (
              <PlaceholderCard />
            ) : (
              showRecentEntriesCard && (
                <div className="w-full mb-2 md:w-1/2 xl:w-1/3 p-2">
                  <Card className="h-full p-4">
                    <h2 className="text-xl font-semibold">Recent Activity</h2>
                    <ul>
                      {recentEntries.map((entry, index) => (
                        <li key={index} className="border-b py-2">
                          <span className="font-bold">{entry.title}</span> -{" "}
                          {entry.date}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )
            )}

            {/* Upcoming Entries/Reminders */}
            {!localStorageValuesFetched.upcomingEntriesCard ? (
              <PlaceholderCard />
            ) : (
              showUpcomingEntriesCard && (
                <div className="w-full mb-2 md:w-1/2 lg:w-1/3 p-2">
                  <Card className="h-full p-4">
                    <h2 className="text-xl font-semibold">
                      Upcoming Entries/Reminders
                    </h2>
                    <ul>
                      {upcomingEntries.length > 0 ? (
                        upcomingEntries.map((entry, index) => (
                          <li key={index} className="border-b py-2">
                            <span className="font-bold">{entry.title}</span> -{" "}
                            {entry.date}
                          </li>
                        ))
                      ) : (
                        <p>No upcoming entries.</p>
                      )}
                    </ul>
                  </Card>
                </div>
              )
            )}

            {/* Favorite Entries */}
            {!localStorageValuesFetched.favoriteEntrysCard ? (
              <PlaceholderCard />
            ) : (
              showFavoriteEntrysCard && (
                <div className="w-full mb-2 md:w-1/2 xl:w-1/3 p-2">
                  <Card className="h-full p-4">
                    <h2 className="text-xl font-semibold mb-4">
                      Favorite Entries
                    </h2>
                    {favoriteEntries.length > 0 ? (
                      <ul className="space-y-2">
                        {favoriteEntries.map((entry, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2 border-b py-2"
                          >
                            <StarIcon className="w-4 h-4 text-yellow-400" />
                            <span className="font-medium">{entry.title}</span>
                            <span className="text-sm text-gray-500">
                              - {entry.date}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-gray-500">
                        No favorite entries yet.
                      </p>
                    )}
                  </Card>
                </div>
              )
            )}

            {/* Keyword Frequency Card */}
            {!localStorageValuesFetched.keywordFrequencyCard ? (
              <PlaceholderCard />
            ) : (
              showKeywordFrequencyCard && (
                <div className="w-full mb-2 p-2 md:w-1/2 xl:w-1/3">
                  <Card className="h-full p-4">
                    <h2 className="text-xl font-semibold mb-2">
                      Keyword Frequency
                    </h2>
                    {/* Dropdown for selecting keyword type */}

                    <Select
                      value={selectedKeywordType}
                      onValueChange={handleValueChange} // Use the new handler
                      open={isSelectOpen} // Pass the open prop
                      onOpenChange={setIsSelectOpen} // Manage open state
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {[
                          { value: "nouns", label: "Nouns" },
                          { value: "verbs", label: "Verbs" },
                          { value: "adjectives", label: "Adjectives" },
                          { value: "terms", label: "Terms" },
                        ].map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isLoadingKeywordFrequency ? ( // Conditional rendering for loading spinner
                      <div className="flex justify-center items-center">
                        <div className="loader"></div>{" "}
                        {/* Add your spinner here */}
                      </div>
                    ) : (
                      <ul className="max-h-60 overflow-y-auto p-6 mt-3">
                        {keywordFrequency.map(({ normal, count }, index) => (
                          <li
                            key={index}
                            className="border-b py-2 flex justify-between"
                          >
                            <span className="font-bold">{normal}:</span> {count}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder component
function PlaceholderCard() {
  return (
    <div className="w-full mb-6 p-2 md:w-1/2 xl:w-1/3">
      <Card className="h-full p-4">
        <div className="animate-pulse bg-gray-300 h-8 w-full rounded"></div>
        <div className="flex justify-center items-center w-full h-80">
          <div className="animate-pulse bg-gray-300 h-full w-full rounded"></div>
        </div>
      </Card>
    </div>
  );
}

export default UserDashboard;