import { Suspense } from "react";
import { notFound } from "next/navigation";
import VerificationStatus from "./verification-status";

export default function VerifyAccountPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  if (!token) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">
          {token ? "Verifying Your Account" : "Verify Your Account"}
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
