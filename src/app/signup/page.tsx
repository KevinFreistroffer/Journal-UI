"use client";

import { useFormState } from "react-dom";
import { signUp } from "@/actions/signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { State } from "./types";

const initialState: State = {
  message: "",
  errors: {},
};

export default function SignUpPage() {
  const [state, formAction] = useFormState(signUp, initialState);

  console.log(state);

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
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
        {state.message && (
          <p
            className={`mt-4 text-center ${
              state.errors ? "text-red-500" : "text-green-500"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
