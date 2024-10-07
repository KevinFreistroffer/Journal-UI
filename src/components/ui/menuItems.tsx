"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
interface MenuItem {
  href: string;
  label: string;
}

export function MenuItems({ menuItems }: { menuItems: MenuItem[] }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {menuItems.map((item, index) => {
        if (!pathname.startsWith(item.href)) {
          return (
            <Link
              key={index}
              href={item.href}
              className={`transition-colors hover:text-foreground/80 ${
                item.label === "New Entry"
                  ? "bg-blue-500 text-white rounded px-4 py-2" // Button style for New Entry
                  : pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              {item.label}
            </Link>
          );
        }
      })}
    </>
  );
}
