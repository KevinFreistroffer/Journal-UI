"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VerificationStatus from "./verification-status";

export default function VerifyAccountPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">
            Invalid Verification Link
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            The verification link is invalid or has expired. Please try signing up again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">
          Verifying Your Account
        </h1>
        <Suspense fallback={<VerificationStatusSkeleton />}>
          <VerificationStatus token={token} />
        </Suspense>
      </div>
    </div>
  );
}

function VerificationStatusSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
    </div>
  );
} 