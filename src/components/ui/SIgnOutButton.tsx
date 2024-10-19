import Link from "next/link";

export async function getServerSideProps() {
  return {
    props: {
      user: null,
    },
  };
}

export async function SignOutButton() {
  return (
    <Link
      href="/api/auth/logout"
      className="transition-colors hover:text-foreground/80 text-foreground/60"
    >
      Sign Out
    </Link>
  );
}
