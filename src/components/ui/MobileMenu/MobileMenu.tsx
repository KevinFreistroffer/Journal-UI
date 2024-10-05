"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "../sheet";
import { Button } from "../button";
import { Menu } from "lucide-react";
import { IMenuItem } from "../Header/Header";

interface MobileMenuProps {
  menuItems: IMenuItem[];
}

export function MobileMenu({ menuItems }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
        <div className="px-7">
          <Link
            href="/"
            className="flex items-center menu-title border-b border-black pb-2 mb-6 text-2xl font-bold"
            onClick={() => setIsOpen(false)}
          >
            <span className="font-bold">Entries</span>
          </Link>
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
            <Link
              href="/api/signout"
              className="text-foreground/60 transition-colors hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Sign Out
            </Link>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
