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

  return (
    <div>
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
