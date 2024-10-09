"use client";

import { useState, useEffect } from "react";
import PushNotificationManager from "@/components/ui/PWA/PushNotificationManager";

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Install App</h3>
      <button className="mb-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
        Add to Home Screen
      </button>
      {isIOS && (
        <p className="text-gray-700">
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {" "}
            ⎋{" "}
          </span>
          and then &quot;Add to Home Screen&quot;
          <span role="img" aria-label="plus icon">
            {" "}
            ➕{" "}
          </span>
          .
        </p>
      )}
    </div>
  );
}

export default InstallPrompt;
