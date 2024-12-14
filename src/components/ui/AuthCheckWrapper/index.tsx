"use client";

import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link"; // Add this import at the top
import { Button } from "@/components/ui/Button";

interface AuthCheckWrapperProps {
  children: React.ReactNode;
}

export default function AuthCheckWrapper({ children }: AuthCheckWrapperProps) {
  const { user, isLoading, setIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!user.isVerified) {
      router.push("/login?isVerified=false");
      return;
    }
  }, [user, router]);

  // Combine loading, auth, and verification checks
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!user?.isVerified) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Account Not Verified
        </h1>
        <p className="mb-4 dark:text-gray-300">
          Please verify your account to access the dashboard.
        </p>
        <Button
          onClick={() => {
            /* Add logic to resend verification email */
          }}
        >
          Resend Verification Email
        </Button>
      </div>
    );
  }

  // If user exists and is verified, render children
  return <>{children}</>;
}
