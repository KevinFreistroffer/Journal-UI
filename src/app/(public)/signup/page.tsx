"use client";

import { useFormState } from "react-dom";
import { signUp } from "@/actions/signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { State } from "./types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormButton } from "@/components/ui/formButton";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" type="text" required />
            {state.errors?.username && (
              <p className="text-sm text-red-500">{state.errors.username[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
            {state.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
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
            />
            {state.errors?.confirmPassword && (
              <p className="text-sm text-red-500">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          <FormButton
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Sign Up
          </FormButton>
        </form>
        {state.errors?.usernameOrEmailUnAvailable && (
          <p className="mt-4 text-center text-red-500">
            {state.errors.usernameOrEmailUnAvailable}
          </p>
        )}

        {state.errors?.generalError && (
          <p className="mt-4 text-center text-red-500">
            {state.errors.generalError}
          </p>
        )}

        {!state.errors && (
          <p className="mt-4 text-center text-green-500">{state.message}</p>
        )}
        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-500 hover:text-blue-600">
            Already have an account? Log In
          </Link>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">
              Account Created Successfully
            </h2>
            <p className="mb-6">
              An email has been sent to verify your account. Please check your
              inbox and follow the instructions to complete the verification
              process.
            </p>
            <Button
              onClick={handleCloseModal}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Go to Login
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
