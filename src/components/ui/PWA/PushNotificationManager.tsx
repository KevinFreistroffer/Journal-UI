"use client";

import { useState, useEffect } from "react";
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "@/actions/pwa";
import { urlBase64ToUint8Array } from "@/app/page";

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    console.log(
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY=",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!.trim
    );

    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");
      return;
    }
    const registration = await navigator.serviceWorker.ready;

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    await subscribeUser(sub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">
        Push Notifications
      </h3>
      {subscription ? (
        <>
          <p className="mb-4 text-green-600">
            You are subscribed to push notifications.
          </p>
          <button
            onClick={unsubscribeFromPush}
            className="mb-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Unsubscribe
          </button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full mb-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendTestNotification}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Send Test
          </button>
        </>
      ) : (
        <>
          <p className="mb-4 text-yellow-600">
            You are not subscribed to push notifications.
          </p>
          <button
            onClick={subscribeToPush}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Subscribe
          </button>
        </>
      )}
    </div>
  );
}

export default PushNotificationManager;
