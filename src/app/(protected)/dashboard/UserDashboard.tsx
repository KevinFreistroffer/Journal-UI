"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { IJournal } from "@/lib/interfaces";
import CategoryBreakdown from "@/components/ui/CategoryBreakdown/CategoryBreakdown";
import { ICategoryBreakdown } from "@/components/ui/CategoryBreakdown/CategoryBreakdown";
import { StarIcon } from "lucide-react";
import styles from "@/app/(protected)/dashboard/UserDashboard.module.css";
import Link from "next/link"; // Import Link for navigation
import { localStorageService } from "@/lib/services/localStorageService";
import { ChevronLeft, ChevronRight, Settings, Download } from "lucide-react";
import Legend from "@/app/(protected)/dashboard/Legend";
import { getFrequentKeywords } from "@/lib/utils";
import { IKeywordFrequency } from "@/lib/utils";
import * as Label from "@radix-ui/react-label";
import { Button } from "@/components/ui/Button";
import Sidebar from "@/components/ui/Sidebar/Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
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

export interface IFrontEndJournal extends IJournal {
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
  const [totalJournals, setTotalJournals] = useState(
    user?.journals?.length || 0
  );
  const [categoryData, setCategoryData] = useState<
    { title: string; value: number; color: string }[]
  >([]);
  const [recentEntries, setRecentEntries] = useState<IFrontEndJournal[]>([]);
  const [upcomingEntries, setUpcomingEntries] = useState<IFrontEndJournal[]>(
    []
  );
  const [data, setData] = useState<ICategoryBreakdown[]>([]);
  const [showTotalJournalsCard, setShowTotalJournalsCard] = useState(false);
  const [showCategoryBreakdownCard, setShowCategoryBreakdownCard] =
    useState(false);
  const [showRecentEntriesCard, setShowRecentEntriesCard] = useState(false);
  const [showUpcomingEntriesCard, setShowUpcomingEntriesCard] = useState(false);
  const [showFavoriteJournalsCard, setShowFavoriteJournalsCard] =
    useState(false);
  const [showKeywordFrequencyCard, setShowKeywordFrequencyCard] =
    useState(false);
  const [localStorageValuesFetched, setLocalStorageValuesFetched] = useState({
    totalJournalsCard: false,
    categoryBreakdownCard: false,
    recentEntriesCard: false,
    upcomingEntriesCard: false,
    favoriteJournalsCard: false,
    keywordFrequencyCard: false,
    journalTimeCard: false,
  });
  const [isMobileLegendOpen, setIsMobileLegendOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [favoriteEntries, setFavoriteEntries] = useState<IFrontEndJournal[]>(
    []
  );
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
  const [showJournalTimeCard, setShowJournalTimeCard] = useState(false);
  const [journalTimeData, setJournalTimeData] = useState<{
    [key: string]: number;
  }>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobileView = useMediaQuery("(max-width: 639px)");

  console.log(categoryData, isSelectOpen);

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
    setSelectedKeywordType(value as "nouns" | "verbs" | "adjectives" | "terms");
    setIsSelectOpen(false); // Close the select when an option is selected
  };

  // I guess this would set the initial words?
  useEffect(() => {
    if (user) {
      setIsLoadingKeywordFrequency(true); // Start loading
      const allEntriesText =
        journals?.map(({ title, entry }) => title + " " + entry).join(" ") ||
        "";

      const frequencyData = getFrequentKeywords(
        allEntriesText,
        15,
        selectedKeywordType
      );
      console.log("frequencyData", frequencyData);
      // setKeywordFrequency(frequencyData);
      setIsLoadingKeywordFrequency(false); // End loading
    }
  }, [journals, user, selectedKeywordType]);

  useEffect(() => {
    console.log("selectedKeywordType", selectedKeywordType);

    const allEntriesText =
      journals?.map(({ title, entry }) => title + " " + entry).join(" ") || "";

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
      setTotalJournals(journals?.length || 0);

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
      const showTotalJournalsCard: boolean | null =
        localStorageService.getItem<boolean>("showTotalJournalsCard");
      setShowTotalJournalsCard(
        showTotalJournalsCard !== null ? showTotalJournalsCard : true
      );
      setLocalStorageValuesFetched((prev) => ({
        ...prev,
        totalJournalsCard: true,
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

      const showFavoriteJournalsCard: boolean | null =
        localStorageService.getItem<boolean>("showFavoriteJournalsCard");
      setShowFavoriteJournalsCard(
        showFavoriteJournalsCard !== null ? showFavoriteJournalsCard : true
      );
      setLocalStorageValuesFetched((prev) => ({
        ...prev,
        favoriteJournalsCard: true,
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

      const showJournalTimeCard: boolean | null =
        localStorageService.getItem<boolean>("showJournalTimeCard");
      setShowJournalTimeCard(
        showJournalTimeCard !== null ? showJournalTimeCard : true
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
      setJournalTimeData(timeData);
    }
  }, [user, journals]);

  // Add this function inside the UserDashboard component
  const exportToCSV = () => {
    const csvContent = [
      ["Keyword", "Count"],
      ...keywordFrequency.map(({ normal, count }) => [
        normal,
        count.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `keyword_frequency_${selectedKeywordType}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-centers">
        Loading...
      </div> // Add your spinner or loading state here
    );
  }

  if (!user) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        No user found.
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Sidebar - only visible on md screens and above */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        icon={
          <Button
            className={`relative w-full p-0 cursor-pointer ${
              isSidebarOpen ? "justify-end" : "justify-center"
            }`}
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Settings size={20} />}
          </Button>
        }
        sections={[
          {
            title: "Toggle Cards",
            content: (
              <div className="flex flex-col">
                <Legend
                  isMobile={isMobile}
                  isMobileLegendOpen={isMobileLegendOpen}
                  setIsMobileLegendOpen={setIsMobileLegendOpen}
                  showTotalJournalsCard={showTotalJournalsCard}
                  setShowTotalJournalsCard={setShowTotalJournalsCard}
                  showCategoryBreakdownCard={showCategoryBreakdownCard}
                  setShowCategoryBreakdownCard={setShowCategoryBreakdownCard}
                  showRecentEntriesCard={showRecentEntriesCard}
                  setShowRecentEntriesCard={setShowRecentEntriesCard}
                  showUpcomingEntriesCard={showUpcomingEntriesCard}
                  setShowUpcomingEntriesCard={setShowUpcomingEntriesCard}
                  showFavoriteJournalsCard={showFavoriteJournalsCard}
                  setShowFavoriteJournalsCard={setShowFavoriteJournalsCard}
                  showKeywordFrequencyCard={showKeywordFrequencyCard}
                  setShowKeywordFrequencyCard={setShowKeywordFrequencyCard}
                  showJournalTimeCard={showJournalTimeCard}
                  setShowJournalTimeCard={setShowJournalTimeCard}
                  checkboxSize={4}
                />
              </div>
            ),
          },
        ]}
      />

      {/* Main Content */}
      <div
        className={`flex-1 p-6 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-56" : "md:ml-24"
        }`}
      >
        {/* Dashboard title - only visible on non-mobile viewports */}
        {/* {!isMobileView && (
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        )} */}
        <div className="flex flex-col md:flex-row mb-6">
          {/* Main Content Area */}
          <div className="flex flex-col md:flex-row md:flex-wrap w-full">
            {/* Dashboard Content */}
            <div className="flex w-full flex-col md:flex-row md:flex-wrap">
              {/* Total Number of Entries */}
              {!localStorageValuesFetched.totalJournalsCard ? (
                <PlaceholderCard />
              ) : (
                showTotalJournalsCard && (
                  <div className="w-full mb-2 p-2">
                    <Card className="h-full p-4 flex w-full items-center justify-between">
                      <h2 className="text-sm sm:text-xl md:text-2xl font-semibold">
                        Total Number of journals: {totalJournals}
                      </h2>
                      <Link
                        href="/journals"
                        className="text-sm self-center text-blue-500 font-normal"
                      >
                        View
                      </Link>
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
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                          Category Breakdown
                        </h2>
                        <Link
                          href="/categories"
                          className="text-sm self-center text-blue-500 font-normal"
                        >
                          Manage
                        </Link>
                      </div>
                      <div className="w-full h-[calc(100%-4rem)] overflow-hidden">
                        {isMobileView ? (
                          <div className="overflow-x-auto overflow-y-scroll h-full">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr>
                                  <th className="text-left sticky top-0 bg-white border-b p-2 text-sm font-medium">
                                    Category
                                  </th>
                                  <th className="text-right sticky top-0 bg-white border-b p-2 pr-4 text-sm font-medium">
                                    Count
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.map((item) => (
                                  <tr key={item.id} className="border-b">
                                    <td className="text-left p-2">
                                      {item.label}
                                    </td>
                                    <td className="text-right p-2 pr-4">
                                      {item.value}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <CategoryBreakdown data={data} />
                        )}
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
                      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                        Recent Activity
                      </h2>
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

              {/* Upcoming Journals/Reminders */}
              {!localStorageValuesFetched.upcomingEntriesCard ? (
                <PlaceholderCard />
              ) : (
                showUpcomingEntriesCard && (
                  <div className="w-full mb-2 md:w-1/2 xl:w-1/3 p-2">
                    <Card className="h-full p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold w-1/2">
                          Upcoming Journals/Reminders
                        </h2>
                        <Link
                          href="/reminders"
                          className="text-sm text-blue-500 font-normal"
                        >
                          Manage
                        </Link>
                      </div>
                      <ul>
                        {upcomingEntries.length > 0 ? (
                          upcomingEntries.map((journal, index) => (
                            <li key={index} className="border-b py-2">
                              <span className="font-bold">{journal.title}</span>{" "}
                              - {formatDate(journal.date)}
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

              {/* Favorite Journals */}
              {!localStorageValuesFetched.favoriteJournalsCard ? (
                <PlaceholderCard />
              ) : (
                showFavoriteJournalsCard && (
                  <div className="w-full mb-2 md:w-1/2 xl:w-1/3 p-2">
                    <Card className="h-full p-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">
                          Favorite Journals
                        </h2>
                        <Link
                          href="/journals/favorites"
                          className="text-sm self-center text-blue-500 font-normal"
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
                                    "selectedJournal",
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
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                          Keyword Frequency
                        </h2>
                        <Button
                          onClick={exportToCSV}
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </Button>
                      </div>
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
                                onChange={() => handleValueChange(value)}
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
                      {isLoadingKeywordFrequency ? (
                        <div className="flex justify-center h-full items-center max-h-60 p-6 mt-3">
                          <Spinner />
                        </div>
                      ) : (
                        <ul className="max-h-60 overflow-y-auto p-6 mt-3">
                          {keywordFrequency.map(({ normal, count }, index) => (
                            <li
                              key={index}
                              className="border-b py-2 flex justify-between"
                            >
                              <span className="font-bold">{normal}:</span>{" "}
                              {count}
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card>
                  </div>
                )
              )}

              {/* Journal Time Card */}
              {!localStorageValuesFetched.journalTimeCard ? (
                <PlaceholderCard />
              ) : (
                showJournalTimeCard && (
                  <div className="w-full mb-2 p-2 md:w-1/2 xl:w-1/3">
                    <Card className="h-full p-4">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">
                        Journal Time Distribution
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
