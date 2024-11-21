"use client";

import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";
import { PageContainer } from "@/components/ui/__layout__/PageContainer/PageContainer";
import DashboardContainer from "@/components/ui/__layout__/DashboardContainer/DashboardContainer";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <button onClick={onClose} className="mb-2">
          Close
        </button>
        {children}
      </div>
    </div>
  );
};
// Mock data for reminders
interface IReminder {
  id: number;
  title: string;
  date: string;
  time: string;
}

const mockReminders: IReminder[] = [
  { id: 1, title: "Doctor Appointment", date: "2023-04-15", time: "10:00 AM" },
  { id: 2, title: "Team Meeting", date: "2023-04-16", time: "2:00 PM" },
  { id: 3, title: "Buy Groceries", date: "2023-04-17", time: "6:00 PM" },
];

const RemindersPage = () => {
  const [newReminder, setNewReminder] = useState<{
    title: string;
    description: string;
    date: string;
    time: string;
    recurring: boolean;
    recurrenceType: string;
    customFrequency: number;
    customUnit: string;
    repeatOn: string[];
    ends: string;
    endDate: string;
    occurrences: number;
  }>({
    title: "",
    description: "",
    date: "",
    time: "",
    recurring: false,
    recurrenceType: "none",
    customFrequency: 1,
    customUnit: "day",
    repeatOn: [],
    ends: "never",
    endDate: "",
    occurrences: 1,
  });

  useEffect(() => {}, [newReminder]);

  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const handleDelete = (id: number) => {
    // In a real application, you would delete the reminder here
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    // Send a fetch request to save the reminder
    await fetch("/api/user/reminders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newReminder),
    });
    // Reset the form after submission
    setNewReminder({
      title: "",
      description: "",
      date: "",
      time: "",
      recurring: false,
      recurrenceType: "none",
      customFrequency: 1,
      customUnit: "day",
      repeatOn: [],
      ends: "never",
      endDate: "",
      occurrences: 1,
    });
  };

  const handleCustomRecurrence = () => {
    setIsModalOpen(true); // Open the modal for custom recurrence
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <DashboardContainer isSidebarOpen={isSidebarOpen}>
      <div className="container mx-auto p-4 flex flex-row min-h-screen">
        <div className="flex-1 p-4">
          {" "}
          {/* Left column for reminders */}
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
        </div>

        <div className="w-1/3 p-4">
          {" "}
          {/* Right column for adding new reminders */}
          <h2 className="text-xl font-bold mb-4">Add New Reminder</h2>
          <form onSubmit={handleAddReminder} className="mb-4 flex flex-col">
            <input
              type="text"
              placeholder="Title"
              value={newReminder.title}
              onChange={(e) =>
                setNewReminder({ ...newReminder, title: e.target.value })
              }
              required
              className="border p-2 mb-2"
            />
            <textarea
              placeholder="Description"
              value={newReminder.description}
              onChange={(e) =>
                setNewReminder({ ...newReminder, description: e.target.value })
              }
              className="border p-2 mb-2"
            />
            <input
              type="date"
              value={newReminder.date}
              onChange={(e) =>
                setNewReminder({ ...newReminder, date: e.target.value })
              }
              required
              className="border p-2 mb-2"
            />
            <input
              type="time"
              value={newReminder.time}
              onChange={(e) =>
                setNewReminder({ ...newReminder, time: e.target.value })
              }
              required
              className="border p-2 mb-2"
            />
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={newReminder.recurring}
                onChange={(e) => {
                  setNewReminder({
                    ...newReminder,
                    recurring: e.target.checked,
                  });
                  if (e.target.checked) handleCustomRecurrence(); // Open modal if recurring is checked
                }}
                className="mr-2"
              />
              Recurring
            </label>

            <Button
              type="submit"
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Reminder
            </Button>
          </form>
        </div>

        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <h2 className="text-lg font-bold mb-2">Custom Recurrence</h2>
          <div className="mb-4">
            <label>React every:</label>
            <input
              type="number"
              value={newReminder.customFrequency}
              onChange={(e) =>
                setNewReminder({
                  ...newReminder,
                  customFrequency: Number(e.target.value),
                })
              }
              className="border p-2 mb-2"
              min="1"
            />
            <select
              value={newReminder.customUnit}
              onChange={(e) =>
                setNewReminder({ ...newReminder, customUnit: e.target.value })
              }
              className="border p-2 mb-2"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div className="mb-4">
            <label>Repeat on:</label>
            <div className="flex">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <button
                  key={index}
                  className={`rounded-full border p-2 m-1 ${
                    newReminder.repeatOn.includes(day)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => {
                    const updatedDays = newReminder.repeatOn.includes(day)
                      ? newReminder.repeatOn.filter((d) => d !== day)
                      : [...newReminder.repeatOn, day];
                    setNewReminder({
                      ...newReminder,
                      repeatOn: updatedDays as string[],
                    });
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label>Ends:</label>
            <div>
              <label>
                <input
                  type="radio"
                  value="never"
                  checked={newReminder.ends === "never"}
                  onChange={() =>
                    setNewReminder({ ...newReminder, ends: "never" })
                  }
                />
                Never
              </label>
              <label>
                <input
                  type="radio"
                  value="on"
                  checked={newReminder.ends === "on"}
                  onChange={() =>
                    setNewReminder({ ...newReminder, ends: "on" })
                  }
                />
                On
                <input
                  type="date"
                  value={newReminder.ends === "on" ? newReminder.endDate : ""}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, endDate: e.target.value })
                  }
                  className="border p-2 ml-2"
                  disabled={newReminder.ends !== "on"}
                />
              </label>
              <label>
                <input
                  type="radio"
                  value="after"
                  checked={newReminder.ends === "after"}
                  onChange={() =>
                    setNewReminder({ ...newReminder, ends: "after" })
                  }
                />
                After
                <input
                  type="number"
                  value={newReminder.occurrences}
                  onChange={(e) =>
                    setNewReminder({
                      ...newReminder,
                      occurrences: Number(e.target.value),
                    })
                  }
                  className="border p-2 ml-2"
                  min="1"
                  disabled={newReminder.ends !== "after"}
                />
                occurrences
              </label>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardContainer>
  );
};

export default RemindersPage;
