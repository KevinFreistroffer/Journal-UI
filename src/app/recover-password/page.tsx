"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { FormButton } from "@/components/ui/formButton";
import { sendResetPasswordEmailFunction } from "@/actions/sendResetPasswordEmail";
import Link from "next/link";
import { State } from "./types";

const initialState: State = {
  message: "",
  errors: {},
  success: false,
};

export default function RecoverPasswordPage() {
  const [state, formAction] = useFormState(
    sendResetPasswordEmailFunction,
    initialState
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (state.success) {
      setShowSuccessModal(true);
    }
  }, [state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recover your password
          </h2>
        </div>
        <form className="mt-8 space-y-6" action={formAction}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          {/* {state.errors && Object.keys(state.errors).length
            ? state.errors?.email && (
                <p className="text-red-500 text-sm mt-1">
                  {state.errors.email}
                </p>
              )
            : null} */}

          <div>
            <FormButton
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send recovery email"}
            </FormButton>
          </div>
        </form>

        {state.message && !showSuccessModal && (
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

      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Success!
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  A password reset email has been sent to you. Please check your
                  inbox.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
