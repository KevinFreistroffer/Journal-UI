"use client";

import { useState, useEffect } from "react";
import { setCookieConsent } from "@/actions/cookieConsent";

interface CookieConsentProps {
  initialConsent: boolean | null;
}

export default function CookieConsent({ initialConsent }: CookieConsentProps) {
  const [showConsent, setShowConsent] = useState(initialConsent === null);

  const handleConsent = async (agreed: boolean) => {
    await setCookieConsent(agreed);
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <p>This website uses cookies to enhance your experience.</p>
        <div>
          <button
            onClick={() => handleConsent(true)}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded mr-2"
          >
            Accept
          </button>
          <button
            onClick={() => handleConsent(false)}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}
