"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  { href: "/signup", label: "Sign Up" },
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Header({
  authState,
}: {
  authState: { isAuth: boolean; userId: string | null };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-8 flex h-14 items-center justify-between w-full">
        <div className="hidden md:flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">JournalApp</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors hover:text-foreground/80 ${
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {authState.isAuth && (
            <Link
              href="/api/signout"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Sign Out
            </Link>
          )}
        </nav>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 ">
            <div className="px-7">
              <Link
                href="/"
                className="flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <span className="font-bold">JournalApp</span>
              </Link>
              <nav className="mt-4 flex flex-col items-end space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-foreground/60 transition-colors hover:text-foreground ${
                      pathname === item.href ? "text-foreground" : ""
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {true && (
                  <Link
                    href="/api/signout"
                    className="text-foreground/60 transition-colors hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Out
                  </Link>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:hidden md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <h1 className="text-lg font-semibold md:text-xl">
              Placeholder Title
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
