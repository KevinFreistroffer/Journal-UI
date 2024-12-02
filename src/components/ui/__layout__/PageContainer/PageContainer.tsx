"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

interface PageContainerProps {
  children: React.ReactNode;
  showLoadingIndicator?: boolean;
}

export function PageContainer({
  children,
  showLoadingIndicator = true
}: PageContainerProps) {
  const { isLoading } = useAuth();

  useEffect(() => {
  }, [isLoading]);

  if (isLoading && showLoadingIndicator) {
    return (
      <div className="p-6 w-full h-full min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
