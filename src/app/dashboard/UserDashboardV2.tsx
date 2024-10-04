"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { IJournal } from "@/lib/interfaces";
import CategoryBreakdown from "@/components/ui/CategoryBreakdown/CategoryBreakdown";
import { ICategoryBreakdown } from "@/components/ui/CategoryBreakdown/CategoryBreakdown";
import { ConstructionIcon } from "lucide-react";
import styles from "@/app/dashboard/UserDashboard.module.css";
import Link from "next/link"; // Import Link for navigation
import { localStorageService } from "@/lib/services/localStorageService";

export interface IFrontEndJournal extends IJournal {
  // Add any additional properties specific to the frontend representation
  // For example, you might want to include a formatted date or a flag for upcoming entries
  formattedDate?: string; // Optional formatted date string for display
  isUpcoming?: boolean; // Flag to indicate if the entry is upcoming
}

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
  const [localStorageValuesFetched, setLocalStorageValuesFetched] = useState({
    totalJournalsCard: false,
    categoryBreakdownCard: false,
    recentEntriesCard: false,
    upcomingEntriesCard: false,
    favoriteJournalsCard: false,
  });

  const journals = user?.journals;

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
      setRecentEntries(journals?.slice(-5).reverse() || []);

      // Get upcoming entries (assuming you have a date field)
      const today = new Date();
      setUpcomingEntries(
        journals?.filter((journal) => new Date(journal.date) > today) || []
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

      {/* Navigation Link to Journals Page */}

      <div className="flex flex-col md:flex-row md:flex-wrap">
        {/* Legend for showing/hiding cards */}
        <div className="mb-6 w-full md:w-1/2">
          <h2 className="text-xl font-semibold">Legend</h2>
          <div className="flex flex-wrap">
            <div className="mr-4">
              <label htmlFor="totalJournalsCard">
                <input
                  type="checkbox"
                  id="totalJournalsCard"
                  checked={showTotalJournalsCard}
                  onChange={() => {
                    const newValue = !showTotalJournalsCard;
                    setShowTotalJournalsCard(newValue);
                    localStorageService.setItem(
                      "showTotalJournalsCard",
                      newValue
                    ); // Save to localStorage
                  }}
                  className="mr-1"
                />
                Total Journals
              </label>
            </div>
            <div className="mr-4">
              <label htmlFor="categoryBreakdownCard">
                <input
                  type="checkbox"
                  id="categoryBreakdownCard"
                  checked={showCategoryBreakdownCard}
                  onChange={() => {
                    const newValue = !showCategoryBreakdownCard;
                    setShowCategoryBreakdownCard(newValue);
                    localStorageService.setItem(
                      "showCategoryBreakdownCard",
                      newValue
                    ); // Save to localStorage
                  }}
                  className="mr-1"
                />
                Category Breakdown
              </label>
            </div>
            <div className="mr-4">
              <label htmlFor="recentEntriesCard">
                <input
                  type="checkbox"
                  id="recentEntriesCard"
                  checked={showRecentEntriesCard}
                  onChange={() => {
                    const newValue = !showRecentEntriesCard;
                    setShowRecentEntriesCard(newValue);
                    localStorageService.setItem(
                      "showRecentEntriesCard",
                      newValue
                    ); // Save to localStorage
                  }}
                  className="mr-1"
                />
                Recent Entries
              </label>
            </div>
            <div className="mr-4">
              <label htmlFor="upcomingEntriesCard">
                <input
                  type="checkbox"
                  id="upcomingEntriesCard"
                  checked={showUpcomingEntriesCard}
                  onChange={() => {
                    const newValue = !showUpcomingEntriesCard;
                    setShowUpcomingEntriesCard(newValue);
                    localStorageService.setItem(
                      "showUpcomingEntriesCard",
                      newValue
                    ); // Save to localStorage
                  }}
                  className="mr-1"
                />
                Upcoming Entries
              </label>
            </div>
            <div className="mr-4">
              <label htmlFor="favoriteJournalsCard">
                <input
                  type="checkbox"
                  id="favoriteJournalsCard"
                  checked={showFavoriteJournalsCard}
                  onChange={() => {
                    const newValue = !showFavoriteJournalsCard;
                    setShowFavoriteJournalsCard(newValue);
                    localStorageService.setItem(
                      "showFavoriteJournalsCard",
                      newValue
                    ); // Save to localStorage
                  }}
                  className="mr-1"
                />
                Favorite Journals
              </label>
            </div>
          </div>
        </div>
        {/* Buttons for creating new journal and viewing all journals */}
        <div className="mb-6 w-full md:w-1/2 flex justify-end">
          <Link
            href="/journal/write"
            className="bg-blue-500 mr-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-center"
          >
            Create New Journal
          </Link>
          <Link
            href="/journals"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-center"
          >
            View All Journals
          </Link>
        </div>

        <h1>{!localStorageValuesFetched.totalJournalsCard.toString()}</h1>

        {/* Total Number of Entries */}
        {!localStorageValuesFetched.totalJournalsCard ? (
          <PlaceholderCard />
        ) : (
          showTotalJournalsCard && (
            <div className="w-full mb-6 p-2">
              <Card className="h-full p-4 flex w-full items-center">
                <h2 className="text-xl font-semibold flex-1">
                  Total Number of journals: {totalJournals}
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
              className="w-full mb-6 p-2 md:w-full lg:w-1/2 xl:w-1/3"
            >
              <Card className="h-full p-4">
                <h2 className="text-xl font-semibold">Category Breakdown</h2>
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
            <div className="w-full mb-6 md:w-1/2 xl:w-1/3 p-2">
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
            <div className="w-full mb-6 md:w-1/2 lg:w-1/3 p-2">
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

        {/* Favorite Journals */}
        {!localStorageValuesFetched.favoriteJournalsCard ? (
          <PlaceholderCard />
        ) : (
          showFavoriteJournalsCard && (
            <div className="w-full mb-6 md:w-1/2 xl:w-1/3 p-2">
              <Card className="h-full p-4">
                <h2 className="text-xl font-semibold">Favorite Journals</h2>
                <div className="flex justify-center items-center w-full h-full">
                  <ConstructionIcon className="w-1/2 h-1/2 text-yellow-300" />
                </div>
              </Card>
            </div>
          )
        )}
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
