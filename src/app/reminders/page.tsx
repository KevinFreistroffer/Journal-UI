"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data for reminders
const mockReminders = [
  { id: 1, title: "Doctor Appointment", date: "2023-04-15", time: "10:00 AM" },
  { id: 2, title: "Team Meeting", date: "2023-04-16", time: "2:00 PM" },
  { id: 3, title: "Buy Groceries", date: "2023-04-17", time: "6:00 PM" },
];

const RemindersPage = () => {
  const handleDelete = (id: number) => {
    // In a real application, you would delete the reminder here
    console.log(`Deleting reminder with id: ${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reminders</h1>

      {mockReminders.map((reminder) => (
        <Card key={reminder.id} className="mb-4 p-4">
          <h2 className="text-xl font-semibold">{reminder.title}</h2>
          <p>
            {reminder.date} at {reminder.time}
          </p>
          <Button
            onClick={() => handleDelete(reminder.id)}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete
          </Button>
        </Card>
      ))}

      <Link href="/schedule">
        <Button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Go to Schedule
        </Button>
      </Link>
    </div>
  );
};

export default RemindersPage;
