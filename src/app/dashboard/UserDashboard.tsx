"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

type Journal = {
  id: number;
  title: string;
  entry: string;
  category: string;
};

type Category = {
  id: number;
  name: string;
};

function UserDashboard() {
  const { user, isLoading } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "My Journals" },
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("My Journals");
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "icons">("list");

  const handleCreateJournal = (e: React.FormEvent) => {
    e.preventDefault();
    const newJournal: Journal = {
      id: journals.length + 1,
      title,
      entry,
      category: selectedCategory,
    };
    setJournals([...journals, newJournal]);
    setTitle("");
    setEntry("");
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory) {
      const newCat: Category = {
        id: categories.length + 1,
        name: newCategory,
      };
      setCategories([...categories, newCat]);
      setNewCategory("");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
        <div className="mt-8">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Journal Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Create New Journal</h2>
          <form onSubmit={handleCreateJournal} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="entry">Entry</Label>
              <Textarea
                id="entry"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={setSelectedCategory}
                defaultValue={selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Create Journal</Button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Create New Category</h2>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <Label htmlFor="newCategory">New Category Name</Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Create Category</Button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="flex space-x-2 mb-4">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
          >
            List View
          </Button>
          <Button
            variant={viewMode === "icons" ? "default" : "outline"}
            onClick={() => setViewMode("icons")}
          >
            Icon View
          </Button>
        </div>
        <div
          className={`grid gap-4 ${
            viewMode === "list"
              ? "grid-cols-1"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          }`}
        >
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {journals.filter((j) => j.category === category.name).length}{" "}
                journals
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Journals</h2>
        <div className="space-y-4">
          {journals.map((journal) => (
            <Card key={journal.id}>
              <CardHeader>
                <CardTitle>{journal.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{journal.entry.substring(0, 100)}...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Category: {journal.category}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
// export default withAuth(DashboardPage);
