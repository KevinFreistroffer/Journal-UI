"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useJournal } from "@/hooks/useJournal";
import { IJournal } from "@/lib/interfaces";
// import { PieChart } from "react-minimal-pie-chart"; // Install this package for pie chart
import { useRouter } from "next/navigation";
import CategoryBreakdown from "@/components/ui/CategoryBreakdown/CategoryBreakdown";
import { ICategoryBreakdown } from "@/components/ui/CategoryBreakdown/CategoryBreakdown";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
import styles from "@/app/dashboard/UserDashboard.module.css";
export interface IFrontEndJournal extends IJournal {
  // Add any additional properties specific to the frontend representation
  // For example, you might want to include a formatted date or a flag for upcoming entries
  formattedDate?: string; // Optional formatted date string for display
  isUpcoming?: boolean; // Flag to indicate if the entry is upcoming
}

function UserDashboard() {
  const { user, isLoading } = useAuth();
  // const { selectedJournal } = useJournal(); // Assuming this hook provides journal entries
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
  const router = useRouter();
  const journals = user?.journals;
  const [data, setData] = useState<ICategoryBreakdown[]>([]);
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

        console.log("categoryData", categoryData);

        setCategoryData(
          Object.entries(categories).map(([title, value]) => {
            return {
              title,
              value,
              color: getRandomColor(),
            };
          })
        );

        const newData: ICategoryBreakdown[] = [
          {
            id: "python",
            label: "python",
            value: 82,
            color: "hsl(244, 70%, 50%)",
          },
        ];

        const data: ICategoryBreakdown[] = categoryData.map(
          ({ name, count }) => ({
            id: name,
            label: name,
            value: count,
            color: getRandomColor(),
          })
        );

        console.log(data);

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

  if (isLoading) {
    return <div className="p-6 min-h-screen">Loading...</div>; // Add your spinner or loading state here
  }

  if (!user) {
    return <div>No user found.</div>;
  }

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="flex flex-col md:flex-row md:flex-wrap">
        {/* Total Number of Entries */}
        <div className="w-full mb-6 w-full p-2">
          <Card className="h-full p-4">
            <h2 className="text-xl font-semibold">
              Total Number of Entries: {totalJournals}
            </h2>
          </Card>
        </div>

        {/* Category Breakdown */}
        {/* <div className="w-full mb-6 w-full p-2">
          <Card className="h-full p-4">
            <h2 className="text-xl font-semibold">Category Breakdown</h2>
            <PieChart
              data={data}
              startAngle={180}
              lengthAngle={180}
              viewBoxSize={[100, 100]}
              radius={60}
              label={({ dataEntry }) =>
                `${dataEntry.title}: ${dataEntry.value}`
              }
              labelStyle={{
                fontSize: "8px",
                fill: "#fff",
              }}
              style={{ height: "200px" }}
            />
          </Card>
        </div> */}
        <div
          id={`${styles["categoryBreakdown"]}`}
          className="w-full mb-6 w-full p-2 md:w-full lg:w-1/2 xl:w-1/3"
        >
          <Card className="h-full p-4 ">
            <h2 className="text-xl font-semibold">Category Breakdown</h2>
            <div className="flex justify-center items-center w-full h-full">
              <CategoryBreakdown data={data} />
            </div>
          </Card>
        </div>

        {/*  */}
        {/* {data && data.length ? (
          <div className="w-full mb-6 w-full p-2">
            <Card className="h-full p-4">
              <h2 className="text-xl font-semibold">Category Breakdown</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        ) : null} */}

        {/* Recent Activity */}
        <div className="w-full mb-6 md:w-1/2 xl:w-2/3 p-2">
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

        {/* Upcoming Entries/Reminders */}
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
      </div>
    </div>
  );
}

export default UserDashboard;
