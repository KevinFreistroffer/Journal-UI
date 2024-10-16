"use client";

import Link from "next/link";
import { MenuItems } from "../menuItems";
import { MobileMenu } from "../MobileMenu/MobileMenu";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Header.module.css";
import { useSearch } from "@/SearchContext";
import { useRef } from "react"; // Import useRef
import SearchInput from "../SearchInput/SearchInput";
import { useCallback } from "react"; // Ensure useCallback is imported
import { usePathname } from "next/navigation"; // Add this import

export interface IMenuItem {
  href: string;
  label: string;
}

export default function Header() {
  const { user, setUser, isLoading } = useAuth();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const { query, handleSearch, setFilteredEntries } = useSearch();
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const pathname = usePathname(); // Add this line
  const isHomePage = pathname === "/"; // Add this line

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
            ]
          : [
              { href: "/signup", label: "Sign Up" },
              { href: "/login", label: "Login" },
            ]
      );
    }
  }, [user, isLoading]); // Add isLoading to the dependency array

  const handleResultSelect = (id: string) => {
    console.log("id", id);
    router.push(`/journal/${id}`); // Navigate to the journal page with the selected journal id
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Hide dropdown logic here (e.g., set a state to control visibility)
        setFilteredEntries([]); // Assuming you have a state to control the dropdown visibility
      }
    },
    [dropdownRef, setFilteredEntries]
  ); // Add dependencies if needed

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside); // Add event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Clean up
    };
  }, [handleClickOutside]);

  return (
    <header
      id={styles["header"]}
      className={`sticky h-16 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-gray-100`}
    >
      <div className="p-8 flex h-14 items-center justify-between w-full">
        <div className="flex-1 hidden md:block ">
          <Link href="/" passHref>
            <h1 className="text-lg font-semibold md:text-xl">SumX</h1>
          </Link>
        </div>
        {/* Search Input Section moved to the right */}
        {/* {isLoading ? (
          <div className="w-40 h-6 bg-gray-200 animate-pulse rounded mr-4 hidden md:block"></div>
        ) : !user ? null : !isHomePage ? ( // Add this condition
          <SearchInput
            query={query}
            handleSearch={handleSearch}
            userEntries={user?.journals || []}
            containerClassName="hidden md:block mr-2"
          />
        ) : null} */}

        {isLoading ? (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {/* {user && (
              <div className="flex items-center space-x-2">
                <UserIcon className="w-6 h-6 rounded-full" />
                <span>{user.username}</span>
              </div>
            )} */}
            <MenuItems menuItems={menuItems} />
            {user && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/auth/logout", {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    if (response.ok) {
                      // Redirect or update UI as needed after successful logout
                      setUser(null);
                      router.push("/");
                    } else {
                      console.error("Logout failed");
                    }
                  } catch (error) {
                    console.error("Error during logout:", error);
                  }
                }}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Sign Out
              </button>
            )}
          </nav>
        )}
        <MobileMenu menuItems={menuItems} />
        <div className="flex flex-1 items-center justify-between space-x-2 md:hidden md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {isLoading ? (
              <div className="w-40 h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <Link href="/" passHref>
                <h1 className="text-lg font-semibold md:text-xl cursor-pointer">
                  SumX
                </h1>
              </Link>
            )}
          </div>
          {/* <SearchInput
            query={query}
            handleSearch={handleSearch}
            userEntries={user?.journals || []}
            containerClassName="hidden md:block mr-2"
          /> */}
        </div>
        {/* {!isLoading &&
          user && ( // Check if user is loaded and exists
            <div className="flex items-center space-x-2 ml-auto">
              <UserIcon className="w-6 h-6 rounded-full" />
              <span className="truncate max-w-[20ch]">{user.username}</span>
            </div>
          )} */}
      </div>
    </header>
  );
}
