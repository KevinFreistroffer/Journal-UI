"use client";

import { useState } from "react";
import { setCookieConsent } from "@/actions/cookieConsent";

export default function CookieConsentContent({
  cookie,
}: {
  cookie: string | undefined;
}) {
  const [showConsent, setShowConsent] = useState(
    cookie === undefined ? true : false
  );

  const handleConsent = (consent: boolean) => {
    setCookieConsent(consent);
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
