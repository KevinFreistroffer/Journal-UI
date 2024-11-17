"use client";

import React, { createContext, useContext } from "react";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/Toaster/toaster";

type NotificationContextType = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();

  const showSuccess = (message: string) => {
    toast({
      variant: "default",
      title: "Success",
      description: message,
      className: "bg-green-500 text-white",
    });
  };

  const showError = (message: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  };

  const showWarning = (message: string) => {
    toast({
      variant: "default",
      title: "Warning",
      description: message,
      className: "bg-yellow-500 text-white",
    });
  };

  const showInfo = (message: string) => {
    toast({
      variant: "default",
      title: "Info",
      description: message,
      className: "bg-blue-500 text-white",
    });
  };

  return (
    <NotificationContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <Toaster />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
