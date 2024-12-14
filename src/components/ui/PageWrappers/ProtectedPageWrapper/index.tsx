import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // Assuming you have a custom hook for authentication
import { usePathname } from "next/navigation";

interface ProtectedPageWrapperProps {
  children: ReactNode;
}

const ProtectedPageWrapper: React.FC<ProtectedPageWrapperProps> = ({
  children,
}) => {
  const { user, setIsLoading, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login"); // Redirect to login if not authenticated
      } else if (!user.isVerified) {
        router.push("/login?isVerified=false"); // Redirect to login if not authenticated
      } else if (pathname === "/admin/dashboard" && user.role !== "admin") {
        router.push("/dashboard"); // Redirect to dashboard if user is not an admin
      }
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            zIndex: 1,
          }}
        >
          Loading...
        </div>
        <div style={{ opacity: 0.5 }}>{children}</div>
      </div>
    );
  }

  return <div>{children}</div>;
};

export default ProtectedPageWrapper;
