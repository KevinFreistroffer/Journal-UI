"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { State, LoginFunction } from "@/app/(public)/login/types";
import { UserSchema } from "@/lib/schemas/UserSchema";
import { createClientSession } from "@/lib/session";
import { IUser } from "@/lib/interfaces";

const LoginSchema = z.object({
  usernameOrEmail: z.string(),
  password: z.string(),
  staySignedIn: z.boolean().optional(),
});

export const login: LoginFunction = async (
  prevState: State,
  formData: FormData
) => {
  // Validate form data
  const validatedFields = LoginSchema.safeParse({
    usernameOrEmail: formData.get("usernameOrEmail"),
    password: formData.get("password"),
    staySignedIn: formData.has("staySignedIn")
      ? formData.get("staySignedIn") === "true"
      : false,
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      redirect: null,
      user: null,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid login credentials.",
      success: false,
      isVerified: false,
    };
  }

  const { usernameOrEmail, password, staySignedIn } = validatedFields.data;

  try {
    const response = await fetch("http://localhost:3001/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({
        usernameOrEmail,
        password,
        staySignedIn,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = await response.json();
      return {
        errors: {},
        redirect: null,
        user: null,
        message: errorData.message || "Failed to login.",
        success: false,
        isVerified: false,
      };
    }

    const userDataResult = UserSchema.safeParse(data.data);

    if (!userDataResult.success) {
      console.error(
        "Invalid user data. Did the API have an update to the user schema?",
        userDataResult.error
      );
      return {
        errors: {},
        redirect: null,

        message: "Failed to login. Please try again.",
        success: false,
        user: null,
        isVerified: false,
      };
    }

    const userData = userDataResult.data as unknown as IUser;

    if (!userData.isVerified) {
      return {
        errors: {},
        redirect: null,
        user: userData,
        message:
          "Login successful, but the account is not verified. Please check your email for verification.",
        success: true,
        isVerified: false,
      };
    }
    // Create a session using the user's _id
    await createClientSession(userData._id, userData.isVerified);
    // Get the Set-Cookie header from the response
    const setCookieHeader = response.headers.get("Set-Cookie");

    if (setCookieHeader) {
      const cookieValue = setCookieHeader.split(";")[0];
      const [cookieName, cookieVal] = cookieValue.split("=");

      const cookie = await cookies();
      cookie.set(cookieName, cookieVal, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });
    } else {
      console.warn("No Set-Cookie header found in the response");
    }

    // Deleting because already am using createClientSession()
    // // Set a cookie to simulate user session
    // cookies().set(
    //   "user",
    //   JSON.stringify({ usernameOrEmail: data.usernameOrEmail }),
    //   {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     maxAge: 60 * 60 * 24 * 7, // 1 week
    //     path: "/",
    //   }
    // );

    return {
      errors: {},
      message: "Login successful.",
      redirect: "/dashboard",
      user: userData, // TODO: Not sure if this is the best way to do this.
      success: true,
      isVerified: true,
    };
  } catch (error) {
    console.error(error);
    return {
      redirect: null,
      user: null,
      errors: prevState.errors ?? {},
      message: "Server Error: Failed to login.",
      success: false,
      isVerified: false,
    };
  }
};
