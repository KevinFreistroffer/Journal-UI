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
import {
  UserIcon,
  X,
  LogOut,
  Settings,
  User,
  MoreHorizontal,
} from "lucide-react"; // Add User icon
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DashboardIcon,
  ReaderIcon,
  Pencil2Icon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import DebugLayout from "@/components/ui/debug/Layout";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Image from "next/image"; // Add this import at the top of the file
import { Button } from "@/components/ui/Button"; // Add this import if not already present

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
  const isExtraSmallScreen = useMediaQuery("(max-width: 380px)");

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
      setMenuItems(
        user
          ? [
              { href: "/dashboard", label: "Dashboard" },
              { href: "/journals", label: "Journals" },
              { href: "/journal/write", label: "New Journal" },
              { href: "/profile", label: "Profile" },
            ]
          : [
              { href: "/signup", label: "Sign Up" },
              { href: "/login", label: "Login" },
            ]
      );
    }
  }, [user, isLoading]);

  const handleResultSelect = (id: string) => {
    console.log("id", id);
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
        return <DashboardIcon className="mr-2 w-4 h-4" />; // Increased margin-right
      case "/journals":
        return <ReaderIcon className="mr-2 w-4 h-4" />; // Increased margin-right
      case "/journal/write":
        return <Pencil2Icon className="mr-2 w-4 h-4" />; // Increased margin-right
      case "/profile":
        return <PersonIcon className="mr-2 w-4 h-4" />; // Increased margin-right
      default:
        return null;
    }
  };

  const isTabRoute = ["/dashboard", "/journals", "/journal/write"].includes(
    pathname
  );

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
    if (isSmallScreen) return item.href !== "/profile";
    return true;
  });

  const dropdownItems = menuItems.filter(
    (item) => !filteredMenuItems.includes(item)
  );

  return (
    <>
      <header
        id={styles["header"]}
        className={`sticky px-3 sm:px-4 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-gray-100 flex flex-col`}
      >
        <div className="flex h-14 items-center justify-between w-full">
          <div className="flex-1">
            <Link href="/" passHref>
              <h1 className="text-lg font-semibold md:text-xl">Journals</h1>
            </Link>
          </div>

          {!isLoading && (
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className="focus:outline-none bg-gray-200 rounded-full  hover:bg-gray-300 transition-colors duration-200"
                      aria-label="User menu"
                    >
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={`${user.username}'s avatar`}
                          width={36}
                          height={36}
                          className="w-9 h-9 rounded-full"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                          {getUserInitial(user.username)}
                        </div>
                      )}
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="min-w-[200px] bg-white rounded-md shadow-lg p-1 z-50 "
                      sideOffset={5}
                      align="end"
                      alignOffset={-17}
                    >
                      {/* <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-gray-200 my-1" /> */}
                      <DropdownMenu.Item
                        className="flex items-center px-2 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
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
                      className={`text-sm text-gray-700 hover:text-gray-900 ${
                        pathname === item.href ? "font-bold" : "font-medium"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Tabs - Only visible when user is signed in */}
        {!isLoading && user && (
          <div className="w-full">
            <Tabs defaultValue={pathname} className="w-full">
              <TabsList className="bg-transparent p-0 flex flex-wrap justify-start w-full">
                {filteredMenuItems.map((item) => (
                  <TabsTrigger
                    key={item.href}
                    value={item.href}
                    onClick={() => router.push(item.href)}
                    className={`fdasfdas bg-transparent px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:!border-orange-500 data-[state=active]:bg-transparent text-xs sm:text-sm whitespace-nowrap ${
                      pathname === item.href ? "font-bold" : "font-light"
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
                    <span>{item.label}</span>
                    {item.label === "Journals" && user && user.journals && (
                      <span className="ml-1 px-1.5 text-xs bg-gray-200 text-gray-700 rounded-full inline-flex items-center justify-center h-5 min-w-[20px]">
                        {user.journals.length}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
                {dropdownItems.length > 0 && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="p-[6px] bg-transparent self-center rounded-[5px] hover:bg-gray-300 border border-gray-300 transition-colors duration-200 text-gray-700 focus:outline-none mr-0 ml-auto">
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
