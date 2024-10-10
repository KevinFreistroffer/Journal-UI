"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ICategory } from "@/lib/interfaces";
const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    if (user) {
      setCategories(user.journalCategories);
    }
  }, [user]);

  // const handleCreateCategory = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (newCategoryName) {
  //     setIsCreatingCategoryLoading(true); // Show loading indicator

  //     const categoryExists = categories.some(
  //       ({ category }) =>
  //         category.toLowerCase() === newCategoryName.toLowerCase()
  //     );
  //     if (categoryExists) {
  //       setCategoryCreatedErrorMessage("Category already exists."); // Set error message if category exists
  //       setIsCreatingCategoryLoading(false); // Hide loading indicator
  //       return;
  //     }

  //     try {
  //       // Simulate an API request (replace with your actual API call)
  //       const response = await fetch(
  //         "/api/user/category/create?returnUser=true",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({
  //             userId: user?._id,
  //             category: newCategoryName,
  //           }), // Replace 'yourUserId' with actual user ID
  //         }
  //       );

  //       const body = await response.json();

  //       if (!response.ok) {
  //         setCategoryCreatedErrorMessage(body.message); // Set error message if creation failed
  //       } else {
  //         setUser(body.data);
  //         setJournals(body.data.journals);
  //         setCategories(body.data.journalCategories);
  //         setNewCategoryName("");
  //         setShowCreatedCategorySuccessIcon(true); // Show success icon
  //         setIsCategoryCreated(true); // Set category created state

  //         // Set timeout for closing the dialog only if it's still open
  //         timeoutRef.current = setTimeout(() => {
  //           setIsCategoryCreated(false);
  //         }, 3000);
  //       }
  //     } catch (error) {
  //       console.error("Error creating category:", error);
  //       setCategoryCreatedErrorMessage(
  //         "An error occurred while creating the category."
  //       ); // Set a generic error message
  //     } finally {
  //       setIsCreatingCategoryLoading(false); // Hide loading indicator
  //     }
  //   }
  // };

  return (
    <div className="p-4 min-h-screen">
      <h1>Categories</h1>
      <ul>
        {categories.map(({ name }, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesPage;
