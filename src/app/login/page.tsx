"use client";

import { useFormState } from "react-dom";
import { login } from "@/actions/login";
import { State } from "./types";
import Link from "next/link";

const initialState: State = {
  message: "",
  errors: {},
};

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

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
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Log In
            </button>
          </form>
          {state.message && (
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
    </>
  );
}
