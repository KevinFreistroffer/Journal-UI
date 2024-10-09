"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { IJournal } from "@/lib/interfaces";
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
import * as Label from "@radix-ui/react-label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend as ChartLegend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  ChartLegend
);

export interface IFrontEndEntry extends IJournal {
  // Add any additional properties specific to the frontend representation
  // For example, you might want to include a formatted date or a flag for upcoming journals
  formattedDate?: string; // Optional formatted date string for display
  isUpcoming?: boolean; // Flag to indicate if the journal is upcoming
}

const formatTime = (hour: string) => {
  const hourNum = parseInt(hour);
  if (hourNum === 0) return "12 AM";
  if (hourNum === 12) return "12 PM";
  return hourNum > 12 ? `${hourNum - 12} PM` : `${hourNum} AM`;
};

function UserDashboard() {
  const { user, isLoading } = useAuth();
  const [totalEntrys, setTotalEntrys] = useState(user?.journals?.length || 0);
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
    journalTimeCard: false,
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
  const journals = user?.journals;
  const [isLoadingKeywordFrequency, setIsLoadingKeywordFrequency] =
    useState(false); // New loading state
  const [isSelectOpen, setIsSelectOpen] = useState(false); // New state for managing open state
  const [showEntryTimeCard, setShowEntryTimeCard] = useState(false);
  const [journalTimeData, setEntryTimeData] = useState<{
    [key: string]: number;
  }>({});

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        journals
          ?.map(({ title, journal }) => title + " " + journal)
          .join(" ") || "";

      const frequencyData = getFrequentKeywords(
        allEntriesText,
        15,
        selectedKeywordType
      );
      // setKeywordFrequency(frequencyData);
      setIsLoadingKeywordFrequency(false); // End loading
    }
  }, [journals, user, selectedKeywordType]);

  useEffect(() => {
    console.log("selectedKeywordType", selectedKeywordType);

    const allEntriesText =
      journals?.map(({ title, journal }) => title + " " + journal).join(" ") ||
      "";

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
  }, [selectedKeywordType, journals]);

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
      setTotalEntrys(journals?.length || 0);

      // Calculate category breakdown
      const categories = user?.journalCategories.reduce((acc, category) => {
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
          Object.entries(categories).map(([title, value]) => ({
            title,
            value: Number(value), // Convert value to number
            color: getRandomColor(), // Assuming this function exists
          }))
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

      // Get recent journals (last 5 for example)
      setRecentEntries(journals?.slice(-5).reverse() || []);

      // Get upcoming journals (assuming you have a date field)
      const today = new Date();
      setUpcomingEntries(
        journals?.filter(
          (journal: IJournal) => new Date(journal.date) > today
        ) || []
      );

      // Get favorite journals
      setFavoriteEntries(
        journals?.filter((journal: IJournal) => journal.favorite) || []
      );
    }
  }, [user, journals]);

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

      const showEntryTimeCard: boolean | null =
        localStorageService.getItem<boolean>("showEntryTimeCard");
      setShowEntryTimeCard(
        showEntryTimeCard !== null ? showEntryTimeCard : true
      );
      setLocalStorageValuesFetched((prev) => ({
        ...prev,
        journalTimeCard: true,
      }));
    };

    fetchLocalStorageValues();
  }, []);

  useEffect(() => {
    if (user && journals) {
      const timeData: { [key: string]: number } = {};
      journals.forEach((journal) => {
        const hour = new Date(journal.createdAt as Date).getHours();
        console.log("hour", hour);
        const timeSlot = `${hour.toString().padStart(2, "0")}:00`;
        console.log("timeSlot", timeSlot);
        timeData[timeSlot] = (timeData[timeSlot] || 0) + 1;
      });
      setEntryTimeData(timeData);
    }
  }, [user, journals]);

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
            showKeywordFrequencyCard={showKeywordFrequencyCard}
            setShowKeywordFrequencyCard={setShowKeywordFrequencyCard}
            showEntryTimeCard={showEntryTimeCard}
            setShowEntryTimeCard={setShowEntryTimeCard}
          />
        </Card>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row md:flex-wrap w-full md:w-3/4">
          {" "}
          {/* Adjust width as needed */}
          {/* Dashboard Content */}
          <div className="flex w-full flex-col md:flex-row md:flex-wrap">
            {/* Total Number of Entries */}
            {!localStorageValuesFetched.totalEntrysCard ? (
              <PlaceholderCard />
            ) : (
              showTotalEntrysCard && (
                <div className="w-full mb-2 p-2">
                  <Card className="h-full p-4 flex w-full items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      Total Number of journals: {totalEntrys}
                    </h2>
                    <Link
                      href="/journals"
                      className="text-sm self-center text-grey-500 font-black"
                    >
                      View
                    </Link>
                  </Card>
                </div>
              )
            )}

            {/* Category Breakdown */}
            {!localStorageValuesFetched.categoryBreakdownCard ? (
              <PlaceholderCard className="w-full mb-2 p-2 md:w-full lg:w-1/2 xl:w-1/3" />
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
                        className="text-sm self-center text-grey-500 font-black"
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
                      {recentEntries.map((journal, index) => (
                        <li key={index} className="border-b py-2">
                          <span className="font-bold">{journal.title}</span> -{" "}
                          {formatDate(journal.date)}
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
                        upcomingEntries.map((journal, index) => (
                          <li key={index} className="border-b py-2">
                            <span className="font-bold">{journal.title}</span> -{" "}
                            {formatDate(journal.date)}
                          </li>
                        ))
                      ) : (
                        <p>No upcoming journals.</p>
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
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold mb-4">
                        Favorite Entries
                      </h2>
                      <Link
                        href="/journals/favorites"
                        className="text-sm self-center text-grey-500 font-black"
                      >
                        Manage
                      </Link>
                    </div>
                    {favoriteEntries.length > 0 ? (
                      <ul className="space-y-2">
                        {favoriteEntries.map((journal, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2 border-b py-2"
                          >
                            <StarIcon className="w-4 h-4 text-yellow-400" />
                            <Link
                              href={`/journal/${journal._id}`}
                              onClick={() => {
                                localStorageService.setItem(
                                  "selectedEntry",
                                  journal
                                );
                              }}
                              className="flex-grow hover:underline"
                            >
                              <span className="font-medium">
                                {journal.title}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                - {formatDate(journal.date)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-gray-500">
                        No favorite journals yet.
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
                <div className="w-full mb-2 p-2 md:w-1/2 xl:w-1/3 p-2">
                  <Card className="h-full p-4 min-h-96">
                    <h2 className="text-xl font-semibold mb-4">
                      Keyword Frequency
                    </h2>
                    {/* Replace Select with Radio Buttons in a single row */}

                    <div className="flex flex-col mb-4">
                      <Label.Root className="LabelRoot mb-2">
                        Keyword type
                      </Label.Root>
                      <div className="flex">
                        {[
                          { value: "nouns", label: "Nouns" },
                          { value: "verbs", label: "Verbs" },
                          { value: "adjectives", label: "Adjectives" },
                          { value: "terms", label: "Terms" },
                        ].map(({ value, label }) => (
                          <div key={value} className="flex items-center mr-4">
                            <input
                              type="radio"
                              id={value}
                              name="keywordType"
                              value={value}
                              checked={selectedKeywordType === value}
                              onChange={() => handleValueChange(value)} // Use the existing handler
                              className="mr-2"
                            />
                            <Label.Root
                              htmlFor={value}
                              className="cursor-pointer"
                            >
                              {label}
                            </Label.Root>
                          </div>
                        ))}
                      </div>
                    </div>
                    {isLoadingKeywordFrequency ? ( // Conditional rendering for loading spinner
                      <div className="flex justify-center h-full items-center max-h-60  p-6 mt-3 ">
                        <Spinner />
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

            {/* Entry Time Card */}
            {!localStorageValuesFetched.journalTimeCard ? (
              <PlaceholderCard />
            ) : (
              showEntryTimeCard && (
                <div className="w-full mb-2 p-2 md:w-1/2 xl:w-1/3">
                  <Card className="h-full p-4">
                    <h2 className="text-xl font-semibold mb-4">
                      Entry Time Distribution
                    </h2>
                    <Bar
                      data={{
                        labels: Object.keys(journalTimeData)
                          .sort((a, b) => parseInt(a) - parseInt(b))
                          .map((hour) => formatTime(hour)),
                        datasets: [
                          {
                            label: "Number of Entries",
                            data: Object.values(journalTimeData),
                            backgroundColor: "rgba(75, 192, 192, 0.6)",
                          },
                        ],
                      }}
                      options={{
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Number of Entries",
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Time of Day",
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />
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
    <div className="w-full mb-2 p-2 md:w-full lg:w-1/2 xl:w-1/3">
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
