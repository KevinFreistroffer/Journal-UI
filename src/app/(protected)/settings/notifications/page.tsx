"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Card } from "@/components/ui/card";

export default function NotificationsSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

      <Card className="p-6 space-y-6 bg-white dark:bg-[var(--color-darker4)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Receive email notifications about your account activity
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
            className="dark:data-[state=unchecked]:bg-gray-600 dark:data-[state=checked]:bg-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Receive push notifications on your devices
            </p>
          </div>
          <Switch
            checked={pushNotifications}
            onCheckedChange={setPushNotifications}
            className="dark:data-[state=unchecked]:bg-gray-600 dark:data-[state=checked]:bg-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Marketing Emails</h3>
            <p className="text-sm text-muted-foreground">
              Receive updates about new features and promotions
            </p>
          </div>
          <Switch
            checked={marketingEmails}
            onCheckedChange={setMarketingEmails}
            className="dark:data-[state=unchecked]:bg-gray-600 dark:data-[state=checked]:bg-blue-600"
          />
        </div>
      </Card>
    </div>
  );
}
