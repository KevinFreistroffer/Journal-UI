"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { IJournal, IReminder } from "@/lib/interfaces";
import CategoryBreakdown from "@/components/ui/CategoryBreakdown/CategoryBreakdown";
import { ICategoryBreakdown } from "@/components/ui/CategoryBreakdown/CategoryBreakdown";
import { ChevronUpIcon, StarIcon } from "lucide-react";
import styles from "@/app/(protected)/dashboard/UserDashboard.module.css";
import Link from "next/link"; // Import Link for navigation
import { localStorageService } from "@/lib/services/localStorageService";
import { ChevronLeft, ChevronRight, Settings, Download } from "lucide-react";
import Legend from "@/app/(protected)/dashboard/Legend";
import {
  IKeywordFrequency,
  decodeHtmlEntities,
  formatDate,
  getFrequentKeywords,
  getPlainTextFromHtml,
} from "@/lib/utils";
import * as Label from "@radix-ui/react-label";
import { Button } from "@/components/ui/Button";
import Sidebar from "@/components/ui/Sidebar/Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LegendItem } from "@/app/(protected)/dashboard/Legend";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
import { Spinner } from "@/components/ui/Spinner";
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
import { JournalLink } from "@/app/(protected)/dashboard/(components)/JournalLink";
import DashboardContainer from "@/components/ui/DashboardContainer/DashboardContainer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

// Define the type for card layout
type CardLayout = "auto-layout" | "single-column" | "two-column";

function UserDashboard() {
  const { user, isLoading, setIsLoading } = useAuth();
  const [totalJournals, setTotalJournals] = useState(
    user?.journals?.length || 0
  );
  const [categoryData, setCategoryData] = useState<
    { title: string; value: number; color: string }[]
  >([]);
  const [recentEntries, setRecentEntries] = useState<IFrontEndJournal[]>([]);
  const [upcomingEntries, setUpcomingEntries] = useState<IReminder[]>([]);
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
  // Add this new media query hook usage at the top of the component
  const isExtraSmallScreen = useMediaQuery("(max-width: 360px)");
  const isMobileView = useMediaQuery("(max-width: 639px)");
  const [cardLayout, setCardLayout] = useState<CardLayout>("auto-layout");
  const isLgOrLarger = useMediaQuery("(min-width: 1024px)");

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Only run client-side
    if (typeof window !== "undefined") {
      return window.innerWidth >= 640; // 640px is the 'sm' breakpoint
    }
    return true; // Default to open on server-side
  });

  // Update sidebar state when viewport changes
  useEffect(() => {
    // Don't show sidebar if viewport is 360px or smaller
    if (isExtraSmallScreen) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(!isMobileView);
    }
  }, [isMobileView, isExtraSmallScreen]);

  const handleValueChange = (value: string) => {
    setIsLoadingKeywordFrequency(true);
    setSelectedKeywordType(value as "nouns" | "verbs" | "adjectives" | "terms");
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

      // setKeywordFrequency(frequencyData);
      setIsLoadingKeywordFrequency(false); // End loading
    }
  }, [journals, user, selectedKeywordType]);

  useEffect(() => {
    const allEntriesText =
      journals
        ?.map(({ title, entry }) => {
          return title + " " + getPlainTextFromHtml(decodeHtmlEntities(entry));
        })
        .join(" ") || "";
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

      // Update upcoming entries to use reminders
      const today = new Date();
      setUpcomingEntries(
        user.reminders?.filter(
          (reminder: IReminder) => new Date(reminder.date) > today
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

        const timeSlot = `${hour.toString().padStart(2, "0")}:00`;

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

  // Add this helper function before the return statement
  const areAnyCardsVisible = () => {
    return (
      // showTotalJournalsCard ||
      showCategoryBreakdownCard ||
      showRecentEntriesCard ||
      showUpcomingEntriesCard ||
      showFavoriteJournalsCard ||
      showKeywordFrequencyCard ||
      showJournalTimeCard
    );
  };

  const sidebarContent = (
    <div className="flex flex-col">
      <Legend
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
  );

  if (isLoading) {
    return (
      <div className="p-6 w-full h-full min-h-screen flex justify-center items-center">
        <Spinner />
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
  //xs:px-0 sm:px-4 md:px-6 lg:px-8

  return (
    <>
      <DashboardContainer
        isSidebarOpen={!isExtraSmallScreen && isSidebarOpen}
        sidebar={
          !isExtraSmallScreen && (
            <Sidebar
              isOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              icon={<Settings size={20} />}
              headerDisplaysTabs={true}
              sections={[
                {
                  title: "Toggle Cards",
                  content: sidebarContent,
                },
              ]}
            />
          )
        }
        bottomBar={
          isExtraSmallScreen ? (
            <div className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-center z-[500] shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    {/* <Settings className="h-5 w-5" /> */}
                    <ChevronUpIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto m-4 mb-0">
                  <div className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">Toggle Cards</h3>
                    {sidebarContent}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : undefined
        }
      >
        <div
          className={`flex flex-col md:flex-row mb-6 ${
            isExtraSmallScreen ? "p-2" : ""
          }`}
        >
          {/* Main Content Area */}
          <div className="flex flex-col md:flex-row md:flex-wrap w-full">
            {areAnyCardsVisible() ? (
              <div
                className={`flex w-full flex-col md:flex-row md:flex-wrap ${
                  cardLayout === "single-column"
                    ? "md:flex-col"
                    : cardLayout === "two-column"
                    ? "md:flex-row"
                    : "md:flex-row md:flex-wrap"
                }`}
              >
                {/* Total Number of Entries */}
                {/* {!localStorageValuesFetched.totalJournalsCard ? (
                  <PlaceholderCard cardLayout={cardLayout} />
                ) : (
                  showTotalJournalsCard && (
                    <div className={`w-full mb-2 p-2 w-full `}>
                      <Card className="h-full p-4 flex w-full items-center justify-between">
                        <h2 className="text-sm sm:text-base md:text-sm lg:text-base font-semibold">
                          Total Number of journals: {totalJournals}
                        </h2>
                        <Link
                          href="/journals"
                          className="text-xs sm:text-sm md:text-xs lg:text-sm self-center text-blue-500 font-normal"
                        >
                          View
                        </Link>
                      </Card>
                    </div>
                  )
                )} */}

                {/* Category Breakdown */}
                {!localStorageValuesFetched.categoryBreakdownCard ? (
                  <PlaceholderCard cardLayout={cardLayout} />
                ) : (
                  showCategoryBreakdownCard && (
                    <div
                      id={`${styles["categoryBreakdown"]}`}
                      className={`w-full mb-2 p-2 h-auto min-h-[auto] sm:min-h-96 ${
                        cardLayout === "single-column"
                          ? "md:w-full"
                          : cardLayout === "two-column"
                          ? "md:w-1/2"
                          : "md:w-full lg:w-1/2 xl:w-1/3"
                      }`}
                    >
                      <Card className="h-auto sm:min-h-[400px] sm:h-[400px] p-4 relative bg-blue-50">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-sm sm:text-base md:text-sm lg:text-[15px] font-semibold">
                            Category Breakdown
                          </h2>
                          <Link
                            href="/categories"
                            className="text-xs sm:text-sm md:text-xs lg:text-sm self-center text-blue-500 font-normal"
                          >
                            Manage
                          </Link>
                        </div>
                        <div className="w-full h-full overflow-hidden">
                          {data.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-center text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm">
                                No categories
                              </p>
                            </div>
                          ) : isMobileView ? (
                            <div
                              className={`${styles["category-breakdown-table-container"]} max-w-[440px]`}
                            >
                              <table className="w-full border-collapse min-w-[300px]">
                                <thead>
                                  <tr>
                                    <th className="text-left sticky top-0 bg-white border-b p-2 text-xs sm:text-sm md:text-xs lg:text-sm font-medium">
                                      Category
                                    </th>
                                    <th className="text-right sticky top-0 bg-white border-b p-2 pr-4 text-xs sm:text-sm md:text-xs lg:text-sm font-medium">
                                      Count
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.map((item) => (
                                    <tr key={item.id} className="border-b">
                                      <td className="text-left p-2 text-xs sm:text-sm md:text-xs lg:text-sm">
                                        {item.label}
                                      </td>
                                      <td className="text-right p-2 pr-4 text-xs sm:text-sm md:text-xs lg:text-sm">
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
                  <PlaceholderCard cardLayout={cardLayout} />
                ) : (
                  showRecentEntriesCard && (
                    <div
                      className={`w-full mb-2 p-2 h-auto min-h-[auto]  ${
                        cardLayout === "single-column"
                          ? "md:w-full"
                          : cardLayout === "two-column"
                          ? "md:w-1/2"
                          : "md:w-full lg:w-1/2 xl:w-1/3"
                      }`}
                    >
                      <Card className="h-full p-4 bg-green-50">
                        <h2 className="text-sm sm:text-base md:text-sm lg:text-[15px] font-semibold mb-4">
                          Recent Activity
                        </h2>
                        {recentEntries.length > 0 ? (
                          <div className="border border-gray-200 rounded-md shadow-[inset_0_0_4px_#fbfbfb] overflow-hidden bg-white">
                            <ul className="max-h-72 overflow-y-auto p-4">
                              {recentEntries.map((journal, index) => (
                                <li
                                  key={index}
                                  className="border-b py-2 last:border-b-0"
                                >
                                  <JournalLink
                                    id={journal._id}
                                    title={journal.title}
                                    date={journal.updatedAt}
                                    className="hover:underline flex flex-col"
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-[calc(100%-2rem)]">
                            <p className="text-center text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm">
                              No recent activity
                            </p>
                          </div>
                        )}
                      </Card>
                    </div>
                  )
                )}

                {/* Upcoming Journals/Reminders */}
                {!localStorageValuesFetched.upcomingEntriesCard ? (
                  <PlaceholderCard cardLayout={cardLayout} />
                ) : (
                  showUpcomingEntriesCard && (
                    <div
                      className={`w-full mb-2 p-2 h-auto min-h-[auto] ${
                        cardLayout === "single-column"
                          ? "md:w-full"
                          : cardLayout === "two-column"
                          ? "md:w-1/2"
                          : "md:w-full lg:w-1/2 xl:w-1/3"
                      }`}
                    >
                      <Card className="h-full p-4 bg-purple-50">
                        <div className="flex justify-between items-start mb-4">
                          <h2 className="text-sm sm:text-base md:text-sm lg:text-[15px] font-semibold w-1/2">
                            Reminders
                          </h2>
                          <Link
                            href="/reminders"
                            className="text-xs sm:text-sm md:text-xs lg:text-sm text-blue-500 font-normal"
                          >
                            Manage
                          </Link>
                        </div>
                        {upcomingEntries.length > 0 ? (
                          <ul className="border border-gray-200 rounded-md shadow-[inset_0_0_4px_#fbfbfb] overflow-hidden p-4">
                            {upcomingEntries.map((reminder, index) => (
                              <li key={reminder._id} className="border-b py-2">
                                <span className="text-xs sm:text-sm md:text-xs lg:text-sm font-bold">
                                  {reminder.title}
                                </span>
                                <div className="text-xs sm:text-sm md:text-xs lg:text-sm text-gray-600">
                                  {formatDate(
                                    `${reminder.date}T${reminder.time}`
                                  )}
                                  {reminder.recurring && (
                                    <span className="ml-2 text-blue-500">
                                      ({reminder.recurrenceType})
                                    </span>
                                  )}
                                </div>
                                {reminder.description && (
                                  <p className="text-xs sm:text-sm md:text-xs lg:text-sm text-gray-500 mt-1">
                                    {reminder.description}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="flex items-center justify-center h-[calc(100%-3rem)]">
                            <p className="text-center text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm">
                              No upcoming reminders
                            </p>
                          </div>
                        )}
                      </Card>
                    </div>
                  )
                )}

                {/* Favorite Journals */}
                {!localStorageValuesFetched.favoriteJournalsCard ? (
                  <PlaceholderCard cardLayout={cardLayout} />
                ) : (
                  showFavoriteJournalsCard && (
                    <div
                      className={`w-full mb-2 p-2 h-auto min-h-[auto] ${
                        cardLayout === "single-column"
                          ? "md:w-full"
                          : cardLayout === "two-column"
                          ? "md:w-1/2"
                          : "md:w-full lg:w-1/2 xl:w-1/3"
                      }`}
                    >
                      <Card className="h-full p-4 bg-yellow-50">
                        {" "}
                        {/* Added min-h-96 */}
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-sm sm:text-base md:text-sm lg:text-[15px] font-semibold">
                            Favorite Journals
                          </h2>
                          <Link
                            href="/journals/favorites"
                            className="text-xs sm:text-sm md:text-xs lg:text-sm self-center text-blue-500 font-normal"
                          >
                            Manage
                          </Link>
                        </div>
                        {favoriteEntries.length > 0 ? (
                          <ul className="border border-gray-200 rounded-md shadow-[inset_0_0_4px_#fbfbfb] overflow-hidden p-4 space-y-2 bg-white">
                            {favoriteEntries.map((journal, index) => (
                              <li
                                key={index}
                                className={`flex items-center space-x-2 py-2 ${
                                  favoriteEntries.length > 1 &&
                                  index !== favoriteEntries.length - 1
                                    ? "border-b"
                                    : ""
                                }`}
                              >
                                <JournalLink
                                  id={journal._id}
                                  title={journal.title}
                                  date={journal.updatedAt}
                                  handleOnClick={() => {
                                    localStorageService.setItem(
                                      "selectedJournal",
                                      journal
                                    );
                                  }}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="flex items-center justify-center h-[calc(100%-3rem)]">
                            <p className="text-center text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm">
                              No favorite journals yet
                            </p>
                          </div>
                        )}
                      </Card>
                    </div>
                  )
                )}

                {/* Keyword Frequency Card */}
                {!localStorageValuesFetched.keywordFrequencyCard ? (
                  <PlaceholderCard cardLayout={cardLayout} />
                ) : (
                  showKeywordFrequencyCard && (
                    <div
                      className={`w-full mb-2 p-2 h-auto min-h-[auto] ${
                        cardLayout === "single-column"
                          ? "md:w-full"
                          : cardLayout === "two-column"
                          ? "md:w-1/2"
                          : "md:w-full lg:w-1/2 xl:w-1/3"
                      }`}
                    >
                      <Card className="h-full p-4 bg-red-50">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-sm sm:text-base md:text-sm lg:text-[15px] font-semibold">
                            Keyword Frequency
                          </h2>
                          {keywordFrequency.length > 0 && (
                            <Button
                              onClick={exportToCSV}
                              variant="outline"
                              size="sm"
                              className="flex items-center text-xs sm:text-sm md:text-xs lg:text-sm"
                              disabled={!journals?.length}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export CSV
                            </Button>
                          )}
                        </div>
                        {isLoadingKeywordFrequency ? (
                          <div className="flex justify-center h-full items-center max-h-60 p-6 mt-3">
                            <Spinner />
                          </div>
                        ) : !journals?.length ? (
                          <div className="flex items-center justify-center h-[calc(100%-3rem)]">
                            <p className="text-center text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm">
                              No keyword data available
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col mb-4">
                              <Label.Root className="LabelRoot mb-2 text-xs sm:text-sm md:text-xs lg:text-sm">
                                Keyword type
                              </Label.Root>
                              <Select
                                onValueChange={handleValueChange}
                                value={selectedKeywordType}
                                className="border border-gray-300"
                              >
                                <SelectTrigger className="w-full text-xs sm:text-sm md:text-xs lg:text-sm">
                                  <SelectValue placeholder="Select keyword type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="nouns">Nouns</SelectItem>
                                  <SelectItem value="verbs">Verbs</SelectItem>
                                  <SelectItem value="adjectives">
                                    Adjectives
                                  </SelectItem>
                                  <SelectItem value="terms">Terms</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {keywordFrequency.length > 0 ? (
                              <div className="border border-gray-200 rounded-md shadow-[inset_0_0_4px_#fbfbfb] overflow-hidden bg-white">
                                <ul className="max-h-60 overflow-y-auto p-4">
                                  {keywordFrequency.map(
                                    ({ normal, count }, index) => (
                                      <li
                                        key={index}
                                        className="py-2 flex justify-between text-xs sm:text-sm md:text-xs lg:text-sm border-b last:border-b-0"
                                      >
                                        <span>{normal}:</span> {count}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-[calc(100%-6rem)]">
                                <p className="text-center text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm">
                                  No keyword data available
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </Card>
                    </div>
                  )
                )}

                {/* Journal Time Card */}
                {!localStorageValuesFetched.journalTimeCard ? (
                  <PlaceholderCard cardLayout={cardLayout} />
                ) : (
                  showJournalTimeCard && (
                    <div
                      className={`w-full mb-2 p-2 h-auto min-h-[auto] ${
                        cardLayout === "single-column"
                          ? "md:w-full"
                          : cardLayout === "two-column"
                          ? "md:w-1/2"
                          : "md:w-full lg:w-1/2 xl:w-1/3"
                      }`}
                    >
                      <Card className="h-full p-4 bg-orange-50">
                        <h2 className="text-sm sm:text-base md:text-sm lg:text-[15px] font-semibold mb-4">
                          Journal Time Distribution
                        </h2>
                        {Object.keys(journalTimeData).length > 0 ? (
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
                        ) : (
                          <div className="flex items-center justify-center h-[calc(100%-3rem)]">
                            <p className="text-center text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm">
                              No time distribution data available
                            </p>
                          </div>
                        )}
                      </Card>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center">
                <p className="text-gray-500 text-lg">
                  Toggle cards in the sidebar to show data.
                </p>
              </div>
            )}
          </div>
        </div>
      </DashboardContainer>
    </>
  );
}
// Placeholder component
function PlaceholderCard({ cardLayout }: { cardLayout: CardLayout }) {
  return (
    <div
      className={`w-full mb-2 p-2 h-auto sm:min-h-96 ${
        cardLayout === "single-column"
          ? "md:w-full"
          : cardLayout === "two-column"
          ? "md:w-1/2"
          : "md:w-full lg:w-1/2 xl:w-1/3"
      }`}
    >
      <Card className="h-full p-4 bg-gray-50 border border-gray-200 shadow-md">
        <div className="animate-pulse bg-gray-300 h-8 w-full rounded"></div>
        <div className="flex justify-center items-center w-full h-80">
          <div className="animate-pulse bg-gray-300 h-full w-full rounded"></div>
        </div>
      </Card>
    </div>
  );
}

export default UserDashboard;
