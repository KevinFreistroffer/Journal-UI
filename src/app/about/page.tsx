import React from "react";

const AboutPage: React.FC = () => {
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
    </div>
  );
};

export default AboutPage;
