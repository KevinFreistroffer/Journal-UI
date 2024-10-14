"use client";
import React, { useState, useEffect } from "react";

const CHANGE_PER_MINUTE = 0.00033074074074074; // Precomputed value
const MICROSECONDS_PER_SECOND = 1000000;

const GradualClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startTime = new Date();

    const timer = setInterval(() => {
      const now = new Date();
      const elapsedMs = now.getTime() - startTime.getTime();
      setElapsedSeconds(elapsedMs / 1000);

      const additionalMs = elapsedMs * CHANGE_PER_MINUTE / 60;
      const adjustedTime = new Date(now.getTime() + additionalMs);
      setTime(adjustedTime);
    }, 50); // Update more frequently for smoother display

    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false
  });

  const microsecondsGainedPerSecond = (CHANGE_PER_MINUTE / 60) * MICROSECONDS_PER_SECOND;
  const totalGainedMicroseconds = elapsedSeconds * microsecondsGainedPerSecond;

  const secondsGainedPerMinute = CHANGE_PER_MINUTE * 60;
  const minutesGainedPerHour = CHANGE_PER_MINUTE * 60;
  const hoursGainedPerDay = CHANGE_PER_MINUTE * 24;

  const totalGainedSeconds = totalGainedMicroseconds / MICROSECONDS_PER_SECOND;
  const totalGainedMinutes = totalGainedSeconds / 60;
  const totalGainedHours = totalGainedMinutes / 60;

  return (
    <div className="text-center p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">Live Gradual Clock</h3>
      <p className="text-3xl font-mono mb-4">{formattedTime}</p>
      <p className="text-sm font-semibold mb-2">Time Gained:</p>
      <p className="text-xs">
        Per second: {microsecondsGainedPerSecond.toFixed(2)} μs
        (Total: {totalGainedMicroseconds.toFixed(2)} μs)
      </p>
      <p className="text-xs">
        Per minute: {secondsGainedPerMinute.toFixed(5)} s
        (Total: {totalGainedSeconds.toFixed(5)} s)
      </p>
      <p className="text-xs">
        Per hour: {minutesGainedPerHour.toFixed(5)} min
        (Total: {totalGainedMinutes.toFixed(5)} min)
      </p>
      <p className="text-xs">
        Per day: {hoursGainedPerDay.toFixed(5)} h
        (Total: {totalGainedHours.toFixed(5)} h)
      </p>
    </div>
  );
};

export default GradualClock;
