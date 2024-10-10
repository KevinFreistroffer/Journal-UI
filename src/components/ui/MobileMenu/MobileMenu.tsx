"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "../sheet";
import { Button } from "../button";
import { Menu } from "lucide-react";
import { IMenuItem } from "../Header/Header";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
// import { useSearch } from "@/SearchContext";
// import SearchInput from "../SearchInput/SearchInput"; // Import the SearchInput component

interface MobileMenuProps {
  menuItems: IMenuItem[];
}

export function MobileMenu({ menuItems }: MobileMenuProps) {
  const { user, setUser, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.log("isOpen", isOpen);
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className=" mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5 menu-button" />
          <span className="sr-only menu-button">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="menu-content pr-0">
        <div className="px-7 flex justify-between items-center">
          {" "}
          {/* Added flex for alignment */}
          <Link
            href="/"
            className="flex items-center menu-title border-b border-black pb-2 mb-6 text-2xl font-bold"
            onClick={() => setIsOpen(false)}
          >
            <span className="font-bold">Journals</span>
          </Link>
        </div>

        {isLoading ? (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
          </nav>
        ) : (
          <nav className="mt-4 flex flex-col items-end space-y-4 menu-list">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`text-foreground/60 transition-colors hover:text-foreground menu-item ${
                  pathname === item.href ? "text-foreground" : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={async () => {
                  setIsSigningOut(true);
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
                  } finally {
                    setIsSigningOut(false);
                    setIsOpen(false);
                  }
                }}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-foreground"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing Out...
                  </span>
                ) : (
                  "Sign Out"
                )}
              </button>
            )}
          </nav>
        )}
      </SheetContent>
    </Sheet>
  );
}
