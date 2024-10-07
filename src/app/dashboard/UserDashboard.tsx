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

export interface IFrontEndEntry extends IEntry {
  // Add any additional properties specific to the frontend representation
  // For example, you might want to include a formatted date or a flag for upcoming entries
  formattedDate?: string; // Optional formatted date string for display
  isUpcoming?: boolean; // Flag to indicate if the entry is upcoming
}

// New LegendItem component
function LegendItem({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-4 w-4 text-blue-600"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
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
  const [localStorageValuesFetched, setLocalStorageValuesFetched] = useState({
    totalEntrysCard: false,
    categoryBreakdownCard: false,
    recentEntriesCard: false,
    upcomingEntriesCard: false,
    favoriteEntrysCard: false,
  });
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [favoriteEntries, setFavoriteEntries] = useState<IFrontEndEntry[]>([]);

  const entries = user?.entries;

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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        {/* Legend */}
        {isMobile ? (
          <div className="relative mb-4 md:mb-0">
            <button
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className="flex items-center justify-between w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
            >
              <span>Toggle Dashboard Cards</span>
              {isLegendOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {isLegendOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded shadow-lg">
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">Legend</h2>
                  <div className="flex flex-col space-y-2">
                    <LegendItem
                      id="totalEntrysCard"
                      label="Total Entries"
                      checked={showTotalEntrysCard}
                      onChange={() => {
                        const newValue = !showTotalEntrysCard;
                        setShowTotalEntrysCard(newValue);
                        localStorageService.setItem(
                          "showTotalEntrysCard",
                          newValue
                        );
                      }}
                    />
                    <LegendItem
                      id="categoryBreakdownCard"
                      label="Category Breakdown"
                      checked={showCategoryBreakdownCard}
                      onChange={() => {
                        const newValue = !showCategoryBreakdownCard;
                        setShowCategoryBreakdownCard(newValue);
                        localStorageService.setItem(
                          "showCategoryBreakdownCard",
                          newValue
                        );
                      }}
                    />
                    <LegendItem
                      id="recentEntriesCard"
                      label="Recent Entries"
                      checked={showRecentEntriesCard}
                      onChange={() => {
                        const newValue = !showRecentEntriesCard;
                        setShowRecentEntriesCard(newValue);
                        localStorageService.setItem(
                          "showRecentEntriesCard",
                          newValue
                        );
                      }}
                    />
                    <LegendItem
                      id="upcomingEntriesCard"
                      label="Upcoming Entries"
                      checked={showUpcomingEntriesCard}
                      onChange={() => {
                        const newValue = !showUpcomingEntriesCard;
                        setShowUpcomingEntriesCard(newValue);
                        localStorageService.setItem(
                          "showUpcomingEntriesCard",
                          newValue
                        );
                      }}
                    />
                    <LegendItem
                      id="favoriteEntrysCard"
                      label="Favorite Entries"
                      checked={showFavoriteEntrysCard}
                      onChange={() => {
                        const newValue = !showFavoriteEntrysCard;
                        setShowFavoriteEntrysCard(newValue);
                        localStorageService.setItem(
                          "showFavoriteEntrysCard",
                          newValue
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-2">Legend</h2>
            <div className="flex flex-wrap">
              <div className="mr-4 mb-2">
                <label
                  htmlFor="totalEntrysCard"
                  className="flex items-center text-sm"
                >
                  <input
                    type="checkbox"
                    id="totalEntrysCard"
                    checked={showTotalEntrysCard}
                    onChange={() => {
                      const newValue = !showTotalEntrysCard;
                      setShowTotalEntrysCard(newValue);
                      localStorageService.setItem(
                        "showTotalEntrysCard",
                        newValue
                      );
                    }}
                    className="mr-2 form-checkbox h-3 w-3 text-blue-600"
                  />
                  Total Entries
                </label>
              </div>
              <div className="mr-4 mb-2">
                <label
                  htmlFor="categoryBreakdownCard"
                  className="flex items-center text-sm"
                >
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
                      );
                    }}
                    className="mr-2 form-checkbox h-3 w-3 text-blue-600"
                  />
                  Category Breakdown
                </label>
              </div>
              <div className="mr-4 mb-2">
                <label
                  htmlFor="recentEntriesCard"
                  className="flex items-center text-sm"
                >
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
                      );
                    }}
                    className="mr-2 form-checkbox h-3 w-3 text-blue-600"
                  />
                  Recent Entries
                </label>
              </div>
              <div className="mr-4 mb-2">
                <label
                  htmlFor="upcomingEntriesCard"
                  className="flex items-center text-sm"
                >
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
                      );
                    }}
                    className="mr-2 form-checkbox h-3 w-3 text-blue-600"
                  />
                  Upcoming Entries
                </label>
              </div>
              <div className="mr-4 mb-2">
                <label
                  htmlFor="favoriteEntrysCard"
                  className="flex items-center text-sm"
                >
                  <input
                    type="checkbox"
                    id="favoriteEntrysCard"
                    checked={showFavoriteEntrysCard}
                    onChange={() => {
                      const newValue = !showFavoriteEntrysCard;
                      setShowFavoriteEntrysCard(newValue);
                      localStorageService.setItem(
                        "showFavoriteEntrysCard",
                        newValue
                      );
                    }}
                    className="mr-2 form-checkbox h-3 w-3 text-blue-600"
                  />
                  Favorite Entries
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Buttons for creating new entry and viewing all entries */}
        <div className="flex flex-col md:flex-row">
          <Link
            href="/entry/write"
            className="w-full md:w-auto bg-green-500 hover:bg-green-700 text-white font-500 py-2 px-4 rounded text-center mb-2 md:mb-0 md:mr-4"
          >
            Create New Entry
          </Link>
          <Link
            href="/entries"
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-700 text-white font-500 py-2 px-4 rounded text-center"
          >
            View All Entries
          </Link>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex flex-col md:flex-row md:flex-wrap">
        <h1>{!localStorageValuesFetched.totalEntrysCard.toString()}</h1>

        {/* Total Number of Entries */}
        {!localStorageValuesFetched.totalEntrysCard ? (
          <PlaceholderCard />
        ) : (
          showTotalEntrysCard && (
            <div className="w-full mb-6 p-2">
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

        {/* Favorite Entries */}
        {!localStorageValuesFetched.favoriteEntrysCard ? (
          <PlaceholderCard />
        ) : (
          showFavoriteEntrysCard && (
            <div className="w-full mb-6 md:w-1/2 xl:w-1/3 p-2">
              <Card className="h-full p-4">
                <h2 className="text-xl font-semibold mb-4">Favorite Entries</h2>
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
