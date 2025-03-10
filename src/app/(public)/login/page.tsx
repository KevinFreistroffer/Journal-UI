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
import { PageContainer } from "@/components/ui/__layout__/PageContainer/PageContainer";
import DashboardContainer from "@/components/ui/__layout__/DashboardContainer/DashboardContainer";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";

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
  const [staySignedInChecked, setStaySignedInChecked] = useState<boolean>(false);

  const handleResendVerification = async () => {
    setIsResendingEmail(true);
    try {
      // First try to get user if not available in state
      let userId = state.user?._id;
      if (!userId) {
        const userResponse = await fetch("/api/auth/get-user-session");

        if (!userResponse.ok) {
          throw new Error("Failed to get current user");
        }
        const userData = await userResponse.json();

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
      }

      // if (state.redirect) {
      //   return router.push(state.redirect as string);
      // }
      // Add role-based redirect
      if (state.user.role === "admin") {
        return router.push("/admin/dashboard");
      } else if (state.user.role === "member") {
        return router.push("/dashboard");
      }
    }
  }, [state, router, setUser, setIsLoading, isLoading, showVerificationModal]);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  return (
    <div className="min-h-screen flex items-start justify-center pt-32 ">
      <div className=" p-8 rounded-lg  w-96 border border-gray-400 dark:border-[var(--color-darker2)] dark:bg-[var(--color-darker4)]">
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">
          Log In
        </h1>
        <form action={formAction}>
          <div className="space-y-4 mb-8">
            <div>
              <Label htmlFor="usernameOrEmail">Username or Email</Label>
              <Input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                required
                className="dark:text-white dark:border-[var(--color-darker4)] dark:focus:border-blue-500"
              />
              {state.errors?.usernameOrEmail && (
                <p className="text-sm text-red-500">
                  {state.errors.usernameOrEmail}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="dark:text-white dark:border-[var(--color-darker4)] dark:focus:border-blue-500"
              />
              {state.errors?.password && (
                <p className="text-sm text-red-500">{state.errors.password}</p>
              )}
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Checkbox.Root
                  id="staySignedIn"
                  className="h-4 w-4 border border-gray-300 dark:border-[var(--color-darker4)] rounded transition-all duration-300 dark:bg-[var(--color-darker4)]"
                  onCheckedChange={(checked) => {
                    setStaySignedInChecked(!staySignedInChecked)
                  }}
                  checked={staySignedInChecked}
                  name="staySignedIn"
                >
                  <Checkbox.Indicator className="flex items-center justify-center">
                    {staySignedInChecked && <CheckIcon />}
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label
                  htmlFor="staySignedIn"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300 "
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
          </div>

          <FormButton
            type="submit"
            className="w-full bg-blue-500 text-white py-1 rounded-md hover:bg-blue-600 box-border"
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
        <p className="mt-4 text-center dark:text-gray-300 text-sm">
          Don&apos;t have an account?
          <Link href="/signup" className="text-blue-500 hover:underline ml-2">
            Sign up
          </Link>
        </p>
      </div>
      {showVerificationModal && !state.isVerified && (
        <div
          id={styles["verification-modal"]}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center "
        >
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4">
              Account Verification Required
            </h2>
            <p className="mb-4">
              Login successful, but the account is not verified. Please check
              your email for verification.
            </p>
            <div className="px-8 pb-8">
              {emailResendSuccess ? (
                <div className="text-green-500 text-center w-full">
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
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {isResendingEmail
                    ? "Resending..."
                    : "Resend Verification Email"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
