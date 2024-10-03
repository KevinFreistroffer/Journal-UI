"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { FormButton } from "@/components/ui/formButton";
import { resetPassword } from "@/actions/resetPassword";
import Link from "next/link";
import { State } from "../types";
// import { useRouter } from "next/navigation";

const initialState: State = {
  message: "",
  errors: {},
  success: false,
};

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const [state, formAction] = useFormState(resetPassword, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const router = useRouter();

  useEffect(() => {
    // if (state.success) {
    //   // Handle successful password reset (e.g., show a success message or redirect)
    // }
  }, [params.token]);

  if (!params.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Invalid Reset Link
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            The password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <div className="mt-5">
            <Link
              href="/recover-password"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>
        <form className="mt-8 space-y-6" action={formAction}>
          <input type="hidden" name="token" value={params.token} />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm New Password"
              />
            </div>
          </div>

          {state.errors.password && (
            <p className="text-red-500 text-sm mt-1">{state.errors.password}</p>
          )}
          {state.errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {state.errors.confirmPassword}
            </p>
          )}

          <div>
            <FormButton
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </FormButton>
          </div>
        </form>

        {state.message && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {state.message}
          </p>
        )}

        <div className="text-sm text-center">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
