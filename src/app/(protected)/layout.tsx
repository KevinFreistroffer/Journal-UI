"use client";

import ProtectedPageWrapper from "@/components/ui/PageWrappers/ProtectedPageWrapper";
import React from "react";

// This is a layout component for protected routes
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedPageWrapper>
      <main>{children}</main>
    </ProtectedPageWrapper>
  );
};

export default ProtectedLayout;
