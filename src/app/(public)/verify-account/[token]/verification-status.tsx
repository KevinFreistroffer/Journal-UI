"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerificationStatus({ token }: { token: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/auth/verify-account/${token}`,
          {
            method: "GET",
          }
        );

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
          <p className="text-lg font-light text-green-600">{message}</p>
          <Button
            asChild
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
          >
            <Link href="/login" className="flex items-center justify-center">
              <span>Go to Login</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </Button>
        </div>
      )}
      {status === "error" && (
        <div className="space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-lg font-semibold text-red-600">{message}</p>
          <Button
            asChild
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
          >
            <Link href="/signup" className="flex items-center justify-center">
              <span>Back to Sign Up</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
