"use client";

import Link from "next/link";
// import { MenuItems } from "../MenuItems";
import { MobileMenu } from "../MobileMenu/MobileMenu";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Header.module.css";
import { useSearch } from "@/context/SearchContext";
import { useRef } from "react"; // Import useRef
import SearchInput from "../SearchInput/SearchInput";
import { useCallback } from "react"; // Ensure useCallback is imported
import { usePathname } from "next/navigation"; // Add this import
import { useTheme } from "next-themes";
import {
  UserIcon,
  X,
  LogOut,
  Settings,
  User,
  MoreHorizontal,
  PlusIcon,
  ListIcon,
  Menu,
} from "lucide-react"; // Add User icon
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DashboardIcon,
  ReaderIcon,
  Pencil2Icon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import DebugLayout from "@/components/ui/__debug__/Layout";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Image from "next/image"; // Add this import at the top of the file
import { Button } from "@/components/ui/Button"; // Add this import if not already present
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MdCategory } from "react-icons/md";
import Avatar from "../Avatar/Avatar";
import { Badge } from "@/components/ui/badge";

export interface IMenuItem {
  href: string;
  label: string;
  showOnlyMd?: boolean;
}

export default function Header() {
  const { user, setUser, isLoading } = useAuth();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const { query, handleSearch, setFilteredEntries } = useSearch();
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const isMediumScreen = useMediaQuery("(min-width: 768px)");
  const isSmallScreen = useMediaQuery("(max-width: 503px)");
  const isVerySmallScreen = useMediaQuery("(max-width: 443px)");
  const isExtraSmallScreen = useMediaQuery("(max-width: 365px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const excludeTabsRoute =
    pathname.startsWith("/journal/write") ||
    pathname.startsWith("/journal/edit") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/settings");

  const handleScroll = () => {
    if (window.scrollY > 0) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const baseMenuItems = user
        ? [
            { href: "/dashboard", label: "Dashboard" },
            { href: "/journals", label: "Journals" },
            { href: "/categories", label: "Categories" },
          ]
        : [
            { href: "/login", label: "Login" },
            { href: "/signup", label: "Sign Up" },
          ];

      if (user?.role === "admin") {
        baseMenuItems.push({ href: "/admin/dashboard", label: "Admin" });
      }

      setMenuItems(baseMenuItems);
    }
  }, [user, isLoading]);

  const handleResultSelect = (id: string) => {
    router.push(`/journal/${id}`);
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setFilteredEntries([]);
      }
    },
    [dropdownRef, setFilteredEntries]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (isSideMenuOpen) {
      setIsMenuMounted(true);
    } else {
      const timer = setTimeout(() => setIsMenuMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isSideMenuOpen]);

  const getIcon = (href: string) => {
    switch (href) {
      case "/dashboard":
        return <DashboardIcon className="mr-2 w-4 h-4" />;
      case "/journals":
        return <ReaderIcon className="mr-2 w-4 h-4" />;
      case "/categories":
        return <MdCategory className="mr-2 w-4 h-4" />;
      case "/journal/write":
        return <Pencil2Icon className="mr-2 w-4 h-4" />;
      case "/admin":
        return <Settings className="mr-2 w-4 h-4" />;
      default:
        return null;
    }
  };

  const isTabRoute = [
    "/dashboard",
    "/journals",
    "/categories",
    "/admin/dashboard",
    "/settings",
  ].includes(pathname);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout");
      if (response.ok) {
        // Success state
        setUser(null); // Clear the user state
        router.push("/login");
      } else {
        // Failure state
        console.error("Logout failed:", response.statusText);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      // Error state
      console.error("Error during logout:", error);
      // You might want to show an error message to the user here
    }
  };

  const getUserInitial = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (isExtraSmallScreen) return item.href === "/dashboard";
    if (isVerySmallScreen)
      return ["dashboard", "journals"].includes(item.href.split("/")[1]);
    if (isSmallScreen) return true;
    return true;
  });

  const getVisibleMenuItems = () => {
    const currentRoute = menuItems.find((item) => item.href === pathname);
    if (!currentRoute) return filteredMenuItems;

    // If current route is not in filtered items, swap it with the last filtered item
    if (!filteredMenuItems.includes(currentRoute)) {
      const newFilteredItems = [...filteredMenuItems];
      newFilteredItems.pop(); // Remove last item
      return [...newFilteredItems, currentRoute]; // Add current route
    }

    return filteredMenuItems;
  };

  const dropdownItems = menuItems.filter(
    (item) => !getVisibleMenuItems().includes(item)
  );

  useEffect(() => {}, [user]);

  return (
    <>
      <header
        id={styles["header"]}
        className={`${
          isHomePage ? "" : "sticky"
        } px-3 sm:px-4 top-0 z-50 w-full flex flex-col ${
          isHomePage
            ? "bg-gray-100 dark:bg-[var(--color-darker2)]"
            : "bg-gray-100 dark:bg-[var(--color-darker2)]"
        } ${isScrolled ? "border-b shadow-md" : ""}`}
      >
        <div
          className={`flex items-center justify-between  w-full ${
            !user || !isTabRoute || excludeTabsRoute ? "h-16" : "h-14"
          }`}
        >
          {/* Title and Mobile menu icon */}
          <div className="flex-1 flex items-center gap-2">
            {excludeTabsRoute && (
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-200 border border-gray-300 dark:border-gray-700 p-1 w-auto h-auto bg-transparent dark:hover:bg-gray-800"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[300px] bg-white dark:bg-[var(--color-darker2)] border-r border-gray-300 dark:border-gray-700"
                >
                  <SheetHeader className="flex flex-row justify-between items-center space-y-0">
                    <SheetTitle>SumStory</SheetTitle>{" "}
                    <SheetClose className="mt-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary cursor-pointer">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </SheetClose>
                  </SheetHeader>
                  <div className="mt-4">
                    {isLoading ? (
                      // Placeholder icons while loading
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"
                          ></div>
                        ))}
                      </div>
                    ) : (
                      menuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center px-2 py-2 text-sm text-gray-700 dark:hover:bg-[var(--color-darker4)] rounded-md dark:text-white dark:hover:bg-gray-800"
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          {getIcon(item.href)}
                          <span>{item.label}</span>
                          {item.href === "/journals" &&
                            user &&
                            user.journals && (
                              <Badge variant="default" className="ml-2">
                                {user.journals.length}
                              </Badge>
                            )}
                          {item.href === "/categories" &&
                            user &&
                            user.journalCategories && (
                              <Badge variant="default" className="ml-2">
                                {user.journalCategories.length}
                              </Badge>
                            )}
                        </Link>
                      ))
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <Link href="/" passHref>
              <h1 className="text-lg font-semibold md:text-xl">SumStory</h1>
            </Link>
          </div>

          {!isLoading && (
            <div className="flex items-center space-x-4 sm:space-x-4">
              {/* Add New Journal button before the user menu, only show on dashboard and not on create page */}
              <ThemeToggle />
              {user && pathname !== "/journal/write" && (
                <Button
                  onClick={() => router.push("/journal/write")}
                  className={`bg-orange-500 text-white hover:bg-orange-600 dark:bg-purple-600 dark:hover:bg-purple-700 flex items-center gap-1  ${
                    isExtraSmallScreen ? "p-[5px] h-auto" : ""
                  }`}
                  size="sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">New Journal</span>
                </Button>
              )}
              {user ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className="focus:outline-none cursor-pointer bg-gray-300 dark:bg-gray-800 rounded-full hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors duration-200 border p-0"
                      aria-label="User menu"
                    >
                      <Avatar
                        avatarUrl={user?.avatar?.data}
                        username={user?.username}
                        name={user?.name}
                        className="bg-gray-300 dark:bg-gray-800"
                      />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="left-[-17px] min-w-[200px] bg-white rounded-md shadow-lg z-50 dark:bg-[var(--color-darker5)] dark:border border-gray-300 dark:border-gray-800"
                      sideOffset={5}
                      align="end"
                    >
                      <div className="px-2 py-3 text-sm text-gray-700 font-bold dark:text-gray-200">
                        {user.username}
                      </div>
                      <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-0" />
                      <DropdownMenu.Item
                        className="outline-none flex items-center px-2 py-3 text-sm text-gray-700 hover:bg-[var(--color-darker4)] cursor-pointer dark:text-white "
                        onSelect={() => router.push("/settings/profile")}
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-0" />
                      <DropdownMenu.Item
                        className="outline-none flex items-center px-2 py-3 text-sm text-red-500 hover:bg-[var(--color-darker4)] cursor-pointer dark:hover:bg-gray-700"
                        onSelect={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <>
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 ${
                        pathname === item.href ? "font-bold" : "font-medium"
                      } ${
                        item.label === "Sign Up"
                          ? "border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 ml-2"
                          : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
          {isLoading && (
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-24 h-8 animate-pulse rounded ${
                    mounted &&
                    (resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-300")
                  }`}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs - Only visible when user is signed in and not on write page */}
        {!isLoading && user && isTabRoute && (
          <div className="w-full">
            <Tabs defaultValue={pathname} className="w-full">
              <TabsList className="bg-transparent ml-2 p-0 flex flex-wrap justify-start w-full">
                {getVisibleMenuItems().map((item) => (
                  <TabsTrigger
                    key={item.href}
                    value={item.href}
                    onClick={() => router.push(item.href)}
                    className={`bg-transparent px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:!border-orange-500 data-[state=active]:bg-transparent text-xs sm:text-sm whitespace-nowrap  ${
                      pathname === item.href ? "font-semibold" : "font-light"
                    } flex items-center`}
                    style={{
                      borderBottom:
                        pathname === item.href
                          ? "2px solid rgb(249, 115, 22)"
                          : "2px solid transparent",
                      backgroundColor: "transparent",
                      alignSelf: "flex-end",
                    }}
                  >
                    {getIcon(item.href)}
                    <span className="dark:text-white">{item.label}</span>
                    {item.label === "Journals" && user && user.journals && (
                      <Badge variant="secondary" className="ml-2">
                        {user.journals.length}
                      </Badge>
                    )}
                    {item.label === "Categories" &&
                      user &&
                      user.journalCategories && (
                        <Badge variant="secondary" className="ml-2">
                          {user.journalCategories.length}
                        </Badge>
                      )}
                  </TabsTrigger>
                ))}
                {dropdownItems.length > 0 && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        id={styles["more-button"]}
                        className="p-[6px] mr-3 sm:mr-4 mr-5 bg-transparent self-center rounded-[5px] hover:bg-gray-300 border border-gray-300 transition-colors duration-200 text-gray-700 focus:outline-none ml-auto"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="min-w-[200px] bg-white rounded-md shadow-lg p-1 z-50 mr-[17px] mt-[-3px] border border-gray-200"
                        sideOffset={5}
                        align="end"
                        alignOffset={-17}
                      >
                        {dropdownItems.map((item) => (
                          <DropdownMenu.Item
                            key={item.href}
                            className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onSelect={() => router.push(item.href)}
                          >
                            {getIcon(item.href)}
                            <span>{item.label}</span>
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </TabsList>
            </Tabs>
          </div>
        )}
      </header>
    </>
  );
}
