import Link from "next/link";
import { MenuItems } from "./menuItems";
import { SignOutButton } from "./signOutButton";
import { MobileMenu } from "./mobileMenu";

export interface IMenuItem {
  href: string;
  label: string;
}

export default function Header({
  authState,
}: {
  authState: { isAuth: boolean; userId: string | null };
}) {
  const menuItems: IMenuItem[] = authState.isAuth
    ? [{ href: "/dashboard", label: "Dashboard" }]
    : [
        { href: "/signup", label: "Sign Up" },
        { href: "/login", label: "Login" },
      ];
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-8 flex h-14 items-center justify-between w-full">
        <div className="hidden md:flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">JournalApp</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <MenuItems menuItems={menuItems} />
          {authState.isAuth ? <SignOutButton /> : null}
        </nav>
        <MobileMenu authState={authState} menuItems={menuItems} />
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
