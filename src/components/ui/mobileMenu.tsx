"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { Button } from "./button";
import { Menu } from "lucide-react";
import { IMenuItem } from "./header";

interface MobileMenuProps {
  menuItems: IMenuItem[];
  authState: { isAuth: boolean; userId: string | null };
}

export function MobileMenu({ menuItems, authState }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
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
      <SheetContent side="left" className="pr-0">
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
            {authState.isAuth && (
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
  );
}
