"use client";

import { useFormState } from "react-dom";
import { signUp } from "@/actions/signup";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { State } from "./types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormButton } from "@/components/ui/FormButton";
import Link from "next/link";

const initialState: State = {
  message: "",
  errors: {},
  isLoading: false,
  success: false,
};

export default function SignUpPage() {
  const [state, formAction] = useFormState(signUp, initialState);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (
      state.success &&
      state.message &&
      !Object.keys(state.errors || {}).length
    ) {
      setShowModal(true);
    }
  }, [state]);

  const handleCloseModal = () => {
    setShowModal(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 dark:bg-transparent pt-32">
      <div className="bg-white dark:bg-transparent p-8 rounded-lg shadow-md w-96 dark:border dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">
          Sign Up
        </h1>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-500"
            />
            {state.errors?.username && (
              <p className="text-sm text-red-500">{state.errors.username[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-500"
            />
            {state.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-500"
            />
            {state.errors?.password && (
              <p className="text-sm text-red-500">{state.errors.password[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-500"
            />
            {state.errors?.confirmPassword && (
              <p className="text-sm text-red-500">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          <FormButton
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Sign Up
          </FormButton>
        </form>
        {state.errors?.usernameOrEmailUnAvailable && (
          <p className="mt-4 text-center text-red-500 dark:text-red-400">
            {state.errors.usernameOrEmailUnAvailable}
          </p>
        )}

        {state.errors?.generalError && (
          <p className="mt-4 text-center text-red-500 dark:text-red-400">
            {state.errors.generalError}
          </p>
        )}

        {!state.errors && (
          <p className="mt-4 text-center text-green-500 dark:text-green-400">
            {state.message}
          </p>
        )}
        <p className="mt-4 text-center dark:text-gray-300 text-sm">
          Already have an account?
          <Link
            href="/login"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-2"
          >
            Log In
          </Link>
        </p>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Account Created Successfully
            </h2>
            <p className="mb-6 dark:text-gray-300">
              An email has been sent to verify your account. Please check your
              inbox and follow the instructions to complete the verification
              process.
            </p>
            <Button
              onClick={handleCloseModal}
              className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Go to Login
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
