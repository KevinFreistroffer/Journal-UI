"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import {
  CreateJournalFunction,
  ICreateJournalState,
} from "@/app/(protected)/journal/write/types";
import { UserSchema } from "@/lib/schemas/UserSchema";
import { createClientSession } from "@/lib/session";
import { IUser } from "@/lib/interfaces";
import { UNTITLED_JOURNAL } from "@/lib/constants";
const CreateJournalSchema = z.object({
  title: z.string(),
  entry: z.string(),
  category: z.string(),
  favorite: z.boolean().optional(),
  sentimentScore: z.number(),
});

export const createJournal: CreateJournalFunction = async (
  userId: string,
  prevState: ICreateJournalState,
  formData: FormData
): Promise<ICreateJournalState> => {
  // Validate form data
  const validatedFields = CreateJournalSchema.safeParse({
    title: formData.get("title"),
    entry: formData.get("entry"),
    category: formData.get("category"),
    favorite: formData.has("favorite")
      ? formData.get("favorite") === "true"
      : false,
    sentimentScore: Number(formData.get("sentimentScore")),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      user: null,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid journal.",
      success: false,
    };
  }

  const { title, entry, category, favorite, sentimentScore } =
    validatedFields.data;

  try {
    const response = await fetch("http://localhost:3001/user/journal/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({
        userId,
        title: title.trim() === "" ? UNTITLED_JOURNAL : title,
        entry: entry.replace(/\bclass=/g, "className="),
        category,
        favorite,
        sentimentScore,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        errors: {},
        message: errorData.message || "Failed to create journal.",
        success: false,
        user: null,
      };
    }
    const data = await response.json();
    const userDataResult = UserSchema.safeParse(data.data);

    if (!userDataResult.success) {
      console.error(
        "Invalid user data. Did the API have an update to the user schema?",
        userDataResult.error
      );
      return {
        errors: {},
        message: "Failed to create journal. Please try again.",
        success: false,
        user: null,
      };
    }

    const userData = userDataResult.data as unknown as IUser;

    if (!userData.isVerified) {
      return {
        errors: {},
        user: userData,
        message: "Journal created successfully.",
        success: true,
      };
    }
    // Create a session using the user's _id
    await createClientSession(userData._id, userData.isVerified);
    // Get the Set-Cookie header from the response
    const setCookieHeader = response.headers.get("Set-Cookie");

    if (setCookieHeader) {
      // Parse the Set-Cookie header and set it in the client-side cookies
      const cookieValue = setCookieHeader.split(";")[0];
      const [cookieName, cookieVal] = cookieValue.split("=");

      const cookiesStore = await cookies();
      await cookiesStore.set(cookieName, cookieVal, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // TODO: Check this
        maxAge: 60 * 60 * 24 * 7, // 1 week
        // path: "/",
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
      message: "Journal created successfully.",
      user: userData, // TODO: Not sure if this is the best way to do this.
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      user: null,
      errors: prevState.errors ?? {},
      message: "Server Error: Failed to create journal.",
      success: false,
    };
  }
};
