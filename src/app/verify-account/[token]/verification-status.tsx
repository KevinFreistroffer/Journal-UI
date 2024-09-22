"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerificationStatus({ token }: { token: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const response = await fetch(`/api/verify?token=${token}`, {
          method: "POST",
        });

        if (response.ok) {
          setStatus("success");
          setMessage("Your account has been successfully verified!");
        } else {
          setStatus("error");
          const data = await response.json();
          setMessage(data.message || "Verification failed. Please try again.");
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
      }
    };

    verifyAccount();
  }, [token]);

  return (
    <div className="text-center">
      {status === "loading" && (
        <div className="flex justify-center items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
      )}
      {status === "success" && (
        <div className="space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <p className="text-lg font-semibold text-green-600">{message}</p>
          <Button asChild className="mt-4">
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      )}
      {status === "error" && (
        <div className="space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-lg font-semibold text-red-600">{message}</p>
          <Button asChild className="mt-4">
            <a href="/signup">Back to Sign Up</a>
          </Button>
        </div>
      )}
    </div>
  );
}
