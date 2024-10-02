"use client";

import { useState, useEffect, useRef, use } from "react";
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
import { IJournal, ICategory } from "@/lib/interfaces";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  List,
  Grid,
  PlusIcon,
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
import { IFrontEndJournal } from "@/app/dashboard/UserDashboard";

function WritePage() {
  const { user, isLoading, setUser } = useAuth();
  const { setSelectedJournal } = useJournal();
  const [journals, setJournals] = useState<IJournal[]>([]);
  //   const [filteredJournals, setFilteredJournals] = useState<IFrontEndJournal[]>(
  //     []
  //   );
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [showCategorySuccessIcon, setShowCategorySuccessIcon] = useState(false);
  const [showJournalSuccessIcon, setShowJournalSuccessIcon] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    useState(false); // State for dialog
  const [isCreatingCategoryLoading, setIsCreatingCategoryLoading] =
    useState(false); // State for loading indicator
  const [showCreatedCategorySuccessIcon, setShowCreatedCategorySuccessIcon] =
    useState(false); // State for success icon
  const [categoryCreatedErrorMessage, setCategoryCreatedErrorMessage] =
    useState(""); // State for error message
  const [isCategoryCreated, setIsCategoryCreated] = useState(false); // State to track if category is created
  const [journalToDelete, setJournalToDelete] =
    useState<IFrontEndJournal | null>(null);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false); // New state for text visibility
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID

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

  useEffect(() => {
    const savedJournal =
      localStorageService.getItem<IJournal>("selectedJournal");
    if (savedJournal) {
      setSelectedJournal(savedJournal);
    }
  }, [setSelectedJournal]);

  useEffect(() => {
    if (user && user.journals) {
      console.log("Setting user values.");
      //   const formattedJournals = user.journals.map((journal, index) => ({
      //     id: journal._id,
      //     title: journal.title,
      //     entry: journal.entry,
      //     category: journal.category || "My Journals",
      //     date: journal.date,
      //     selected: journal.selected,
      //   }));

      //   console.log(formattedJournals);

      setJournals(user.journals);
      setCategories(user.journalCategories);
      //   setFilteredJournals(formattedJournals);

      const savedJournal =
        localStorageService.getItem<IJournal>("selectedJournal");
      if (savedJournal) {
        const updatedJournal = user.journals.find(
          (j) => j._id === savedJournal._id
        );
        if (updatedJournal) {
          setSelectedJournal(updatedJournal);
          localStorageService.setItem("selectedJournal", updatedJournal);
        }
      }

      //   const uniqueCategories = Array.from(
      //     new Set(user.journals.map((j) => j.category))
      //   );

      //   //   if (uniqueCategories.length === 0) {
      //   //     uniqueCategories.push({
      //   //       _id: "1",
      //   //       category: "My Journals",
      //   //       selected: false,
      //   //     });
      //   //   }

      setSelectedCategory("");
    }
  }, [user, setSelectedJournal]);

  useEffect(() => {
    if (user && !user.isVerified) {
      setIsVerifiedModalOpen(true);
    }
  }, [user]);

  useEffect(() => {
    if (newCategoryName.trim() !== "" && isCategoryCreated) {
      setIsCategoryCreated(false);
    }
  }, [newCategoryName, isCategoryCreated]);

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
        console.log("userData", userData);
        setUser(userData);
        setJournals(userData.journals);
        // setFilteredJournals(userData.journals);
        if (
          userData.journalCategories &&
          userData.journalCategories.length > 0
        ) {
          setCategories(userData.journalCategories);
        }
        setTitle("");
        setEntry("");
        setShowJournalSuccessIcon(true);
        setTimeout(() => setShowJournalSuccessIcon(false), 3000);
      }
    } catch (error) {
      console.error("Error creating journal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName) {
      setIsCreatingCategoryLoading(true); // Show loading indicator

      const categoryExists = categories.some(
        ({ category }) =>
          category.toLowerCase() === newCategoryName.toLowerCase()
      );
      if (categoryExists) {
        setCategoryCreatedErrorMessage("Category already exists."); // Set error message if category exists
        setIsCreatingCategoryLoading(false); // Hide loading indicator
        return;
      }

      try {
        // Simulate an API request (replace with your actual API call)
        const response = await fetch(
          "/api/user/category/create?returnUser=true",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user?._id,
              category: newCategoryName,
            }), // Replace 'yourUserId' with actual user ID
          }
        );

        const body = await response.json();

        if (!response.ok) {
          setCategoryCreatedErrorMessage(body.message); // Set error message if creation failed
        } else {
          console.log("response.ok", response.ok);
          console.log("response.status", response.status);

          console.log("created category data", body);
          setUser(body.data);
          setJournals(body.data.journals);
          setCategories(body.data.journalCategories);
          setNewCategoryName("");
          setShowCreatedCategorySuccessIcon(true); // Show success icon
          setIsCategoryCreated(true); // Set category created state

          // Set timeout for closing the dialog only if it's still open
          timeoutRef.current = setTimeout(() => {
            setIsCategoryCreated(false);
          }, 3000);
        }
      } catch (error) {
        console.error("Error creating category:", error);
        setCategoryCreatedErrorMessage(
          "An error occurred while creating the category."
        ); // Set a generic error message
      } finally {
        setIsCreatingCategoryLoading(false); // Hide loading indicator
      }
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCreatedCategorySuccessIcon(false); // Hide success icon
    setIsCreateCategoryDialogOpen(false); // Close dialog immediately
    setIsCategoryCreated(false); // Reset category created state
    setNewCategoryName("");
    setCategoryCreatedErrorMessage("");
    setIsCreatingCategoryLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Clear the timeout if the dialog is closed
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear timeout on component unmount
      }
    };
  }, []);
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
              <span className="ml-2">Journals ({journals.length})</span>
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
              <span className="ml-2">Categories ({categories.length})</span>
            )}
          </Link>
        </div>
      </div>
      {/* Main Content */}
      <div className="w-full p-6 overflow-y-auto max-w-4xl mx-auto">
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
              <div className="flex items-center">
                <Select
                  onValueChange={setSelectedCategory}
                  defaultValue={selectedCategory}
                  className="mr-2"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.length > 0 ? (
                      categories.map((cat, index) => (
                        <SelectItem
                          key={`${cat._id}`}
                          value={cat.category}
                          className="cursor-pointer"
                        >
                          {cat.category}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="disabled" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsCreateCategoryDialogOpen(true);
                  }}
                >
                  <PlusIcon />
                </Button>
              </div>
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
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 animate-fade-in-out" />
                  <p className="text-green-500">
                    Journal created successfully!
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          width: "100%",
          backgroundColor: "white",
          padding: "1rem",
          textAlign: "center",
          zIndex: 1000,
        }}
      >
        <h1>{isCategoryCreated.toString()}</h1>
      </div>
      {/* Create Category AlertDialog */}
      <AlertDialog
        open={isCreateCategoryDialogOpen}
        onOpenChange={setIsCreateCategoryDialogOpen}
      >
        <AlertDialogContent>
          {
            <div className="w-full flex flex-col items-center">
              <AlertDialogHeader className="flex flex-col items-center w-full mb-6">
                <AlertDialogTitle className="w-full">
                  Create New Category
                </AlertDialogTitle>
                <AlertDialogDescription className="w-full">
                  Enter the name of the new category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form onSubmit={handleCreateCategory} className="w-full">
                <div className="flex flex items-center mb-8">
                  <Input
                    id="newCategory"
                    placeholder="Category Name"
                    value={newCategoryName}
                    disabled={isCreatingCategoryLoading}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                    className="mr-4"
                  />
                  {/* <AlertDialogCancel
                    type="button"
                    onClick={handleCloseCategoryModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
                  >
                    Cancel
                  </AlertDialogCancel> */}
                  <AlertDialogAction
                    type="button"
                    disabled={isCreatingCategoryLoading}
                    onClick={handleCloseCategoryModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
                  >
                    Cancel
                  </AlertDialogAction>
                  <AlertDialogAction
                    type="button"
                    disabled={
                      isCreatingCategoryLoading || !newCategoryName.trim()
                    }
                    onClick={handleCreateCategory}
                    className=" bg-blue-500 text-white"
                  >
                    {isCreatingCategoryLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      "Create"
                    )}
                  </AlertDialogAction>
                </div>
                {categoryCreatedErrorMessage && ( // Display error message if exists
                  <div className="w-full text-center text-red-500 mt-2">
                    {categoryCreatedErrorMessage}
                  </div>
                )}

                <AlertDialogFooter>
                  {isCategoryCreated && (
                    <div className="flex w-full justify-center items-center">
                      <CheckCircle className="text-blue-500 mr-2" size={32} />
                      <span className="text-md">
                        Category created successfully!
                      </span>
                    </div>
                  )}
                </AlertDialogFooter>
              </form>
            </div>
          }
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default WritePage;
