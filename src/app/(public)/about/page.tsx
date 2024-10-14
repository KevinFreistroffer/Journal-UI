import React from "react";
import dynamic from "next/dynamic";

const GradualClock = dynamic(() => import("./GradualClock"), { ssr: false });

const calculateTimeChange = () => {
  const totalDays = 126;
  const minutesPerDay = 24 * 60;
  const totalMinutes = totalDays * minutesPerDay;
  const minutesToGain = 60;
  const changePerMinute = minutesToGain / totalMinutes;
  return changePerMinute;
};

const AboutPage: React.FC = () => {
  const timeChangePerMinute = calculateTimeChange();

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p className="mb-4">
        Welcome to our About page. We are a passionate team dedicated to
        creating amazing web experiences.
      </p>
      <p className="mb-4">
        Our mission is to leverage cutting-edge technologies like Next.js and
        React to build fast, responsive, and user-friendly applications.
      </p>
      <p>
        Feel free to explore our website and learn more about our services and
        projects.
      </p>
      <div className="mt-8 p-4 bg-gray-100 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-2">Did You Know?</h2>
        <p className="mb-4">
          Between November 3, 2024, and March 9, 2025, clocks would need to
          increase by approximately {timeChangePerMinute.toFixed(5)} minutes per
          minute to gradually gain 1 hour.
        </p>
        <p className="mb-4">
          Watch the clock below to see how this gradual change accumulates over
          time:
        </p>
        <GradualClock />
      </div>
    </div>
  );
};

export default AboutPage;
