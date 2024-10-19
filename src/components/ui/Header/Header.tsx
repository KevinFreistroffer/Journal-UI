"use client";

import Link from "next/link";
import { MenuItems } from "../MenuItems";
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
import { UserIcon, X } from "lucide-react"; // Add X icon for closing the menu
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardIcon, ReaderIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

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
        return <DashboardIcon className="mr-1" />;
      case "/journals":
        return <ReaderIcon className="mr-1" />;
      case "/journal/write":
        return <Pencil2Icon className="mr-1" />;
      default:
        return null;
    }
  };

  const isTabRoute = ["/dashboard", "/journals", "/journal/write"].includes(
    pathname
  );

  return (
    <>
      <header
        id={styles["header"]}
        className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-gray-100 flex flex-col md:h-16`}
      >
        <div className="p-8 flex h-14 items-center justify-between w-full">
          <div className="flex-1 hidden md:block">
            <Link href="/" passHref>
              <h1 className="text-lg font-semibold md:text-xl">Journals</h1>
            </Link>
          </div>

          {!isMobile && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {item.label}
                </Link>
              ))}
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

          {isMobile && (
            <>
              {" "}
              <MobileMenu menuItems={menuItems} />
              <div className="flex flex-1 items-center justify-between space-x-2">
                <div className="w-full flex-1">
                  {isLoading ? (
                    <div className="w-40 h-6 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <Link href="/" passHref>
                      <h1 className="text-lg font-semibold cursor-pointer">
                        Journals
                      </h1>
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}

          {!isLoading && user && (
            <div className="flex items-center space-x-2 ml-auto">
              <button
                onClick={() => setIsSideMenuOpen(true)}
                className="focus:outline-none"
              >
                <UserIcon className="w-6 h-6 rounded-full" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Tabs */}
        {isMobile && isTabRoute && (
          <div className="w-full px-2">
            <Tabs defaultValue={pathname} className="w-full">
              <TabsList className="w-full justify-between bg-transparent p-0 items-end">
                {menuItems.map((item) => (
                  <TabsTrigger
                    key={item.href}
                    value={item.href}
                    onClick={() => router.push(item.href)}
                    className="flex-1 bg-transparent px-1 py-3 rounded-none border-b-[3px] border-transparent data-[state=active]:border-b-[3px] data-[state=active]:!border-orange-500 data-[state=active]:bg-transparent text-xs sm:text-sm"
                    style={{
                      borderBottom:
                        pathname === item.href
                          ? "3px solid rgb(249, 115, 22)"
                          : "3px solid transparent",
                      backgroundColor: "transparent",
                    }}
                  >
                    <span className="flex items-center justify-center w-full h-full space-x-1">
                      {getIcon(item.href)}
                      <span className="truncate">{item.label}</span>
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </header>
    </>
  );
}
