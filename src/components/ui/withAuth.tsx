import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth"; // Adjust this import based on your auth setup

export function withAuth(WrappedComponent: React.ComponentType) {
  return function WithAuth() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth(); // Implement this hook based on your auth method

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        console.log("redirecting to login");
        router.replace("/login"); // Redirect to login page
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return <div>Loading...</div>; // Or your custom loading component
    }

    if (!isAuthenticated) {
      return null; // Don't render anything while redirecting
    }

    return <WrappedComponent />;
  };
}
