"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  href: string;
  label: string;
}

export function MenuItems({ menuItems }: { menuItems: MenuItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`transition-colors hover:text-foreground/80 ${
            pathname === item.href ? "text-foreground" : "text-foreground/60"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}
