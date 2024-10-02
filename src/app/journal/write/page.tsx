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
import {
  CheckCircle,
  List,
  Grid,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { localStorageService } from "@/lib/services/localStorageService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner"; // Import a spinner component if you have one
import Link from "next/link";

export interface IFrontEndJournal extends IJournal {
  id: number;
}

type Category = {
  id: number;
  name: string;
  selected: boolean;
};

function WritePage() {
  const { user, isLoading, setUser } = useAuth();
  const { setSelectedJournal } = useJournal();
  const [journals, setJournals] = useState<IFrontEndJournal[]>([]);
  const [filteredJournals, setFilteredJournals] = useState<IFrontEndJournal[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [journalViewMode, setJournalViewMode] = useState<"list" | "icons">(
    "list"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showCategorySuccessIcon, setShowCategorySuccessIcon] = useState(false);
  const [showJournalSuccessIcon, setShowJournalSuccessIcon] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] =
    useState<IFrontEndJournal | null>(null);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false); // New state for text visibility

  useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        setIsTextVisible(true); // Show text after animation
      }, 200); // Match this duration with your CSS transition duration

      return () => clearTimeout(timer);
    } else {
      setIsTextVisible(false); // Hide text when sidebar is closed
    }
  }, [isSidebarOpen]);

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

  const handleJournalClick = (
    e: React.MouseEvent,
    journal: IFrontEndJournal
  ) => {
    e.preventDefault();
    setSelectedJournal(journal);
    localStorageService.setItem("selectedJournal", journal);
    router.push(`/journal/${journal.id}`);
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    journal: IFrontEndJournal
  ) => {
    e.stopPropagation();
    setJournalToDelete(journal);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (journalToDelete && user) {
      try {
        const response = await fetch(`api/user/journal/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            userId: user._id,
            journalIds: [journalToDelete.id],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete journal");
        }

        const body = await response.json();
        const userData = body.data;
        setUser(userData);
        setJournals(userData.journals);
        setFilteredJournals(userData.journals);
        setIsDeleteDialogOpen(false);
        setJournalToDelete(null);
      } catch (error) {
        console.error("Error deleting journal:", error);
      }
    }
  };

  useEffect(() => {
    const savedJournal =
      localStorageService.getItem<IFrontEndJournal>("selectedJournal");
    if (savedJournal) {
      setSelectedJournal(savedJournal);
    }
  }, [setSelectedJournal]);

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
      setFilteredJournals(formattedJournals);

      const savedJournal =
        localStorageService.getItem<IFrontEndJournal>("selectedJournal");
      if (savedJournal) {
        const updatedJournal = formattedJournals.find(
          (j) => j.id === savedJournal.id
        );
        if (updatedJournal) {
          setSelectedJournal(updatedJournal);
          localStorageService.setItem("selectedJournal", updatedJournal);
        }
      }

      const uniqueCategories = Array.from(
        new Set(formattedJournals.map((j) => j.category))
      );
      const categoriesArray = uniqueCategories.map((cat, index) => ({
        id: index + 1,
        name: cat,
        selected: false,
      }));

      if (categoriesArray.length === 0) {
        categoriesArray.push({ id: 1, name: "My Journals", selected: false });
      }

      setCategories(categoriesArray);
      setSelectedCategory("");
    }
  }, [user, setSelectedJournal]);

  useEffect(() => {
    if (user && !user.isVerified) {
      setIsVerifiedModalOpen(true);
    }
  }, [user]);

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const newJournal = {
      title,
      entry,
      category:
        categories.length > 0
          ? selectedCategory.trim() !== ""
            ? selectedCategory
            : "Uncategorized"
          : "Uncategorized",
      userId: user?._id,
      favorite: false,
    };
    console.log("newJournal", newJournal);
    try {
      const response = await fetch(`/api/user/journal/create`, {
        method: "POST",
        body: JSON.stringify(newJournal),
      });

      console.log(response.status);

      if (!response.ok) {
        throw new Error("Failed to create journal");
      }

      if (response.status === 200) {
        const body = await response.json();
        console.log("body", body);
        const userData = body.data;
        setUser(userData);
        setJournals(userData.journals);
        setFilteredJournals(userData.journals);
        if (
          userData.journalCategories &&
          userData.journalCategories.length > 0
        ) {
          setCategories(
            userData.journalCategories.map(
              (
                cat: { category: string; selected: boolean },
                index: number
              ) => ({
                id: index + 1,
                name: cat.category,
                selected: cat.selected,
              })
            )
          );
        }
        setTitle("");
        setEntry("");
        setShowCategorySuccessIcon(true);
        setTimeout(() => setShowCategorySuccessIcon(false), 3000);
      }
    } catch (error) {
      console.error("Error creating journal:", error);
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
      setShowCategorySuccessIcon(true);
      setTimeout(() => setShowCategorySuccessIcon(false), 3000);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    if (categoryName) {
      setFilteredJournals(
        journals.filter((journal) => journal.category === categoryName)
      );
    } else {
      setFilteredJournals(journals);
    }
  };

  const clearCategoryFilter = () => {
    setSelectedCategory("");
    setFilteredJournals(journals);
  };

  // const { openModal } = useContext(ModalContext);

  // const handleOpenModal = () => {
  //   openModal(<div>Your custom content here!</div>);
  // };

  // Check if the user is verified
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner /> {/* Show a loading spinner while loading */}
      </div>
    );
  }

  if (user && !user.isVerified) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Account Not Verified</h1>
          <p className="mb-4">
            Please verify your account to access the dashboard.
          </p>
          <Button
            onClick={() => {
              /* Add logic to resend verification email or redirect */
            }}
          >
            Resend Verification Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } flex flex-col bg-gray-100 p-4 overflow-y-auto transition-all duration-300 ease-in-out relative`}
      >
        <Button
          className={`relative w-full p-0 mb-6 ${
            isSidebarOpen ? "justify-end " : "justify-center "
          }`}
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </Button>
        <div className="flex flex-col items-center">
          <Link
            href="/journals"
            className={`w-full flex items-center h-6 mt-4 mb-4 mr-0 ${
              isSidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <List />
            {isSidebarOpen && isTextVisible && (
              <span className="ml-2">Journals</span>
            )}
          </Link>
          <Link
            href="/categories"
            className={`w-full flex items-center h-6 mt-4 mb-4 mr-0 ${
              isSidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <Grid />
            {isSidebarOpen && isTextVisible && (
              <span className="ml-2">Categories</span>
            )}
          </Link>
        </div>
      </div>
      {/* Main Content */}
      <div className="w-full p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Journal Dashboard</h1>
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
                      <SelectItem
                        key={`category-${index}`}
                        value={cat.name}
                        className="cursor-pointer"
                      >
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
            <div className="flex items-center">
              <Button
                type="submit"
                disabled={isSaving || !title || !entry}
                className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
              >
                {isSaving ? "Saving..." : "Create Journal"}
              </Button>
              {showJournalSuccessIcon && (
                <>
                  <CheckCircle className="text-green-500 animate-fade-in-out" />
                  <p className="text-green-500">
                    Journal created successfully!
                  </p>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      {/* <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              journal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}

export default WritePage;
