"use client";

import { useFormState } from "react-dom";
import { login } from "@/actions/login";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { State } from "./types";
import Link from "next/link";
import { FormButton } from "@/components/ui/FormButton";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import styles from "./styles.module.css";

const initialState: State = {
  message: "",
  errors: {},
  user: null,
  redirect: null,
  success: false,
  isVerified: false,
};

/**
 *
 * the flow is that there is a user session and however they're not verified, so then it would navigate to the login page to verify them.
 *
 * If there's a session than there should be a cookie. If no cookie than it ws deleted and the session is invalid.
 *
 *
 *
 * so i am signed in however i never verified the account.
 */

export default function LoginPage() {
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("isVerified");
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [state, formAction] = useFormState(login, initialState);
  const { setUser, setIsLoading, isLoading } = useAuth();
  const router = useRouter();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [emailResendSuccess, setEmailResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    setIsResendingEmail(true);
    try {
      // First try to get user if not available in state
      let userId = state.user?._id;
      if (!userId) {
        const userResponse = await fetch("/api/auth/get-user-session");
        console.log("userResponse", userResponse);
        if (!userResponse.ok) {
          throw new Error("Failed to get current user");
        }
        const userData = await userResponse.json();
        console.log("userData", userData);
        userId = userData.userId;
      }

      if (!userId) {
        throw new Error("No user ID available");
      }

      const response = await fetch(
        "/api/auth/send-verification-email?userId=" + userId
      );

      if (!response.ok) {
        console.error("Failed to resend verification email");
        return;
      }

      setEmailResendSuccess(true);
      setTimeout(() => {
        setEmailResendSuccess(false);
        setShowVerificationModal(false);
      }, 3000);
    } catch (error) {
      console.error("Error resending verification email:", error);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const closeModal = () => {
    setShowVerificationModal(false);
  };

  useEffect(() => {
    if (isVerified !== null && isVerified === "false") {
      setShowVerificationModal(true);
    }
  }, [isVerified]);

  useEffect(() => {
    if (state.success && state.user) {
      if (state.isVerified === false) {
        setShowVerificationModal(true);
      } else {
        setIsLoading(true);
        setUser(state.user);
        return router.push(state.redirect as string);
      }
    }

    if (state.redirect) {
      return router.push(state.redirect as string);
    }
  }, [state, router, setUser, setIsLoading, isLoading, showVerificationModal]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="usernameOrEmail" className="block mb-1">
                Username or Email
              </label>
              <input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                required
                className="w-full px-3 py-2 border rounded-md"
              />
              {state.errors?.usernameOrEmail && (
                <p className="text-red-500 text-sm mt-1">
                  {state.errors.usernameOrEmail}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border rounded-md"
              />
              {state.errors?.password && (
                <p className="text-red-500 text-sm mt-1">
                  {state.errors.password}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="staySignedIn"
                  name="staySignedIn"
                  type="checkbox"
                  value="true"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="staySignedIn"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Stay signed in
                </label>
              </div>
              <Link
                href="/recover-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <FormButton
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Log In
            </FormButton>
          </form>
          {!state.success && state.message && (
            <p
              className={`mt-4 text-center ${
                state.errors && Object.entries(state.errors).length
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {state.message}
            </p>
          )}
          <p className="mt-4 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {showVerificationModal && !state.isVerified && (
        <div
          id={styles["verification-modal"]}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center "
        >
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Account Verification Required
            </h2>
            <p className="mb-4">
              Login successful, but the account is not verified. Please check
              your email for verification.
            </p>
            {emailResendSuccess ? (
              <div className="text-green-500 text-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p>Email sent successfully!</p>
              </div>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={isResendingEmail}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 mb-2"
              >
                {isResendingEmail
                  ? "Resending..."
                  : "Resend Verification Email"}
              </button>
            )}
            <button
              onClick={closeModal}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
