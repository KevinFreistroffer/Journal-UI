"use client";

import { useFormState } from "react-dom";
import { login } from "@/actions/login";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { State } from "./types";
import Link from "next/link";
import { FormButton } from "@/components/ui/formButton";
import { useAuth } from "@/hooks/useAuth";

const initialState: State = {
  message: "",
  errors: {},
  user: null,
  redirect: null,
};

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);
  const { setUser } = useAuth();
  const router = useRouter();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const closeModal = () => {
    setShowVerificationModal(false);
  };

  useEffect(() => {
    console.log("LoginPage state", state);
    console.log("LoginPage setUser", setUser);
    console.log("LoginPage state.user", state.user);
    console.log("LoginPage state.redirect", state.redirect);
    if (state.user) {
      console.log("setting user");
      setUser(state.user);
    }
    console.log("after setting user");
    if (state.redirect) {
      console.log("should redirect");
      return router.push(state.redirect as string);
      console.log("after returning push");
    } else if (
      state.message ===
      "Login successful, but the account is not verified. Please check your email for verification."
    ) {
      console.log("should show modal");
      setShowVerificationModal(true);
    }
  }, [state, router, setUser]);

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

            <FormButton
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Log In
            </FormButton>
          </form>
          {state.message &&
            state.message !==
              "Login successful, but the account is not verified. Please check your email for verification." && (
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

      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Account Verification Required
            </h2>
            <p className="mb-4">
              Login successful, but the account is not verified. Please check
              your email for verification.
            </p>
            <button
              onClick={closeModal}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
