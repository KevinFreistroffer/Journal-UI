"use client";

import { useState, useEffect } from "react";
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
import { useJournal } from "@/hooks/useJournal";
import { IJournal } from "@/lib/interfaces";
import { useRouter } from "next/navigation";

interface Journal extends IJournal {
  id: number;
}

type Category = {
  id: number;
  name: string;
  selected: boolean;
};

function UserDashboard() {
  const { user, isLoading, setUser } = useAuth();
  const { setSelectedJournal } = useJournal();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "icons">("list");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const renderSkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </CardHeader>
      <CardContent>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
      </CardContent>
    </Card>
  );

  const handleJournalClick = (e: React.MouseEvent, journal: Journal) => {
    e.preventDefault(); // Prevent the default link behavior
    setSelectedJournal(journal);
    router.push(`/journal/${journal.id}`);
  };

  useEffect(() => {
    if (user && user.journals) {
      const formattedJournals = user.journals.map((journal, index) => ({
        id: index + 1,
        title: journal.title,
        entry: journal.entry,
        category: journal.category || "My Journals",
        date: journal.date,
        selected: journal.selected,
      }));
      setJournals(formattedJournals);

      // Extract unique categories from journals
      const uniqueCategories = Array.from(
        new Set(formattedJournals.map((j) => j.category))
      );
      const categoriesArray = uniqueCategories.map((cat, index) => ({
        id: index + 1,
        name: cat,
        selected: false,
      }));

      // If there are no categories, add "My Journals"
      if (categoriesArray.length === 0) {
        categoriesArray.push({ id: 1, name: "My Journals", selected: false });
      }

      setCategories(categoriesArray);
      setSelectedCategory(categoriesArray[0].name);
    }
  }, [user]);

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const newJournal = {
      title,
      entry,
      category: selectedCategory || "My Journals",
    };

    try {
      const response = await fetch(
        "http://localhost:3001/user/journal/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newJournal,
            userId: user?._id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create journal");
      }

      const body = await response.json();
      const userData = body.data;
      setUser(userData);
      setJournals(userData.journals);
      if (userData.journalCategories && userData.journalCategories.length > 0) {
        setCategories(
          userData.journalCategories.map(
            (cat: { category: string; selected: boolean }, index: number) => ({
              id: index + 1,
              name: cat.category,
              selected: cat.selected,
            })
          )
        );
      }
      setTitle("");
      setEntry("");
    } catch (error) {
      console.error("Error creating journal:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory) {
      const newCat: Category = {
        id: categories.length + 1,
        name: newCategory,
        selected: false,
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
              <div
                key={`loading-category-${index}`}
                className="h-24 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={`loading-journal-${index}`}
                className="h-32 bg-gray-200 rounded animate-pulse"
              ></div>
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
                <SelectContent className="bg-white">
                  {categories.length > 0 ? (
                    categories.map((cat, index) => (
                      <SelectItem key={`category-${index}`} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="disabled" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              disabled={isSaving || !title || !entry}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSaving ? "Saving..." : "Create Journal"}
            </Button>
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
          {categories.map((category, index) => (
            <Card key={`category-card-${index}`}>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {journals?.length > 0
                  ? journals.filter((j) => j.category === category.name).length
                  : 0}{" "}
                journals
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Journals</h2>
        <div className="space-y-4">
          {isLoading ? (
            Array(3)
              .fill(null)
              .map((_, index) => <div key={index}>{renderSkeletonCard()}</div>)
          ) : journals && journals.length > 0 ? (
            journals.map((journal, index) => (
              <div
                key={`journal-${index}`}
                onClick={(e) => handleJournalClick(e, journal)}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>{journal.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      {journal.entry
                        ? journal.entry.substring(0, 100) + "..."
                        : "No entry"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Category: {journal.category}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <p>No journals found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
// export default withAuth(DashboardPage);
