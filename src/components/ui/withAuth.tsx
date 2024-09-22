import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth"; // Adjust this import based on your auth setup

export function withAuth(WrappedComponent: React.ComponentType) {
  // @ts-expect-error - Not sure what the props passed in is
  return function WithAuth(props: any) {
    console.log("WithAuth", props);
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth(); // Implement this hook based on your auth method

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace("/login"); // Redirect to login page
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return <div>Loading...</div>; // Or your custom loading component
    }

    if (!isAuthenticated) {
      return null; // Don't render anything while redirecting
    }

    return <WrappedComponent {...props} />;
  };
}
