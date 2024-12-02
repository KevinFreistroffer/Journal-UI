"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { ICreateCategoryState } from "@/app/(protected)/journal/write/types";
import { UserSchema } from "@/lib/schemas/UserSchema";
import { IUser } from "@/lib/interfaces";
import { CreateCategoryFunction } from "@/app/(protected)/journal/write/types";

const CategorySchema = z.object({
  category: z.string(),
});

export const createCategory: CreateCategoryFunction = async (
  userId: string,
  prevState: ICreateCategoryState,
  formData: FormData
) => {
  // Validate form data
  const validatedFields = CategorySchema.safeParse({
    category: formData.get("category"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {

    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid category.",
      success: false,
      user: null,
    };
  }

  const { category } = validatedFields.data;

  try {
    const response = await fetch(
      "http://localhost:3001/user/journal/category/create?returnUser=true",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Cookie: cookies().toString(),
        },
        body: JSON.stringify({
          userId,
          category,
        }),
      }
    );

    const data = await response.json();
    const userDataResult = UserSchema.safeParse(data);

    if (!response.ok || !userDataResult.success) {
      const errorData = await response.json();

      return {
        errors: {
          catchAll: ["Failed to create category. "],
        },
        user: null,
        message: errorData.message || "Failed to create category.",
        success: false,
      };
    }

    const userData = userDataResult.data as unknown as IUser;

    return {
      errors: {},
      message: "Category created successfully.",
      user: userData,
      success: true,
    };
  } catch (error) {
    console.error("createCategory() error", error);
    return {
      user: null,
      errors: {
        catchAll: ["Failed to create category."],
      },
      message: "Server Error: Failed to create category.",
      success: false,
    };
  }
};

// const handleCreateJournal = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setIsSaving(true);
//   const newJournal = {
//     title,
//     journal,
//     category:
//       categories.length === 0 || selectedCategory.trim() === ""
//         ? "Uncategorized"
//         : selectedCategory,
//     userId: user?._id,
//     favorite,
//   };

//   try {
//     const response = await fetch(`/api/user/journal/create`, {
//       method: "POST",
//       body: JSON.stringify(newJournal),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to create journal");
//     }

//     if (response.status === 200) {
//       const body = await response.json();

//       const userData = body.data;

//       setUser(userData);
//       setJournals(userData.journals);
//       // setFilteredJournals(userData.journals);
//       if (userData.journalCategories && userData.journalCategories.length > 0) {
//         setCategories(userData.journalCategories);
//       }
//       setTitle("");
//       setJournal("");
//       setFavorite(false); // Reset favorite checkbox
//       setShowJournalSuccessIcon(true);
//       setTimeout(() => setShowJournalSuccessIcon(false), 3000);
//     }
//   } catch (error) {
//     console.error("Error creating journal:", error);
//   } finally {
//     setIsSaving(false);
//   }
// };
