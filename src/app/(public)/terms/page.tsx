import React from "react";

const TermsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose max-w-none">
        <p>
          Welcome to our website. If you continue to browse and use this
          website, you are agreeing to comply with and be bound by the following
          terms and conditions of use.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">1. Terms</h2>
        <p>
          By accessing this website, you are agreeing to be bound by these terms
          of service, all applicable laws and regulations, and agree that you
          are responsible for compliance with any applicable local laws.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the
          materials (information or software) on our website for personal,
          non-commercial transitory viewing only.
        </p>
        {/* Add more sections as needed */}
      </div>
    </div>
  );
};

export default TermsPage;
