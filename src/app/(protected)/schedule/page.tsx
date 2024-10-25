"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type ScheduleInputs = {
  date: string;
  time: string;
  reminderType: "once" | "repeat";
  repeatFrequency?: "daily" | "weekly" | "monthly";
};

const SchedulePage: React.FC = () => {
  const { register, handleSubmit, watch } = useForm<ScheduleInputs>();
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);

  const reminderType = watch("reminderType");

  const onSubmit: SubmitHandler<ScheduleInputs> = (data) => {
    // Here you would typically send this data to your backend or state management
    setScheduleConfirmed(true);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Schedule Journal Writing</h1>
      {scheduleConfirmed ? (
        <p className="text-green-600">
          Your journal writing session has been scheduled!
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="date" className="block mb-1">
              Date:
            </label>
            <input
              type="date"
              id="date"
              {...register("date", { required: true })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="time" className="block mb-1">
              Time:
            </label>
            <input
              type="time"
              id="time"
              {...register("time", { required: true })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Reminder Type:</label>
            <select
              {...register("reminderType", { required: true })}
              className="w-full p-2 border rounded"
            >
              <option value="once">Once</option>
              <option value="repeat">Repeat</option>
            </select>
          </div>
          {reminderType === "repeat" && (
            <div>
              <label htmlFor="repeatFrequency" className="block mb-1">
                Repeat Frequency:
              </label>
              <select
                id="repeatFrequency"
                {...register("repeatFrequency")}
                className="w-full p-2 border rounded"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Schedule
          </button>
        </form>
      )}
    </div>
  );
};

export default SchedulePage;
