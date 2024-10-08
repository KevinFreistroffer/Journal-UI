"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import {
  CreateEntryFunction,
  ICreateEntryState,
} from "@/app/entry/write/types";
import { UserSchema } from "@/schemas/UserSchema";
import { createSession } from "@/lib/session";
import { IUser } from "@/lib/interfaces";

const CreateEntrySchema = z.object({
  title: z.string(),
  entry: z.string(),
  category: z.string(),
  favorite: z.boolean().optional(),
});

export const createEntry: CreateEntryFunction = async (
  userId: string,
  prevState: ICreateEntryState,
  formData: FormData
) => {
  // Validate form data
  const validatedFields = CreateEntrySchema.safeParse({
    title: formData.get("title"),
    entry: formData.get("entry"),
    category: formData.get("category"),
    favorite: formData.has("favorite")
      ? formData.get("favorite") === "true"
      : false,
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      redirect: null,
      user: null,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid entry.",
      success: false,
      isVerified: false,
    };
  }

  const { title, entry, category, favorite } = validatedFields.data;

  try {
    const response = await fetch("http://localhost:3001/user/entry/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({
        userId,
        title,
        entry,
        category,
        favorite,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = await response.json();
      return {
        errors: {},
        message: errorData.message || "Failed to create entry.",
        success: false,
        user: null,
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
        message: "Failed to create entry. Please try again.",
        success: false,
        user: null,
        isVerified: false,
      };
    }

    const userData = userDataResult.data as unknown as IUser;

    if (!userData.isVerified) {
      return {
        errors: {},
        user: userData,
        message: "Entry created successfully.",
        success: true,
        isVerified: false,
      };
    }
    // Create a session using the user's _id
    await createSession(userData._id, userData.isVerified);
    // Get the Set-Cookie header from the response
    const setCookieHeader = response.headers.get("Set-Cookie");

    if (setCookieHeader) {
      // Parse the Set-Cookie header and set it in the client-side cookies
      const cookieValue = setCookieHeader.split(";")[0];
      const [cookieName, cookieVal] = cookieValue.split("=");

      cookies().set(cookieName, cookieVal, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // TODO: Check this
        maxAge: 60 * 60 * 24 * 7, // 1 week
        // path: "/",
      });
    } else {
      console.warn("No Set-Cookie header found in the response");
    }

    // Deleting because already am using createSession()
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
      message: "Entry created successfully.",
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
      message: "Server Error: Failed to create entry.",
      success: false,
      isVerified: false,
    };
  }
};
