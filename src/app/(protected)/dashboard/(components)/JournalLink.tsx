import Link from "next/link";
import { formatDate } from "@/lib/utils"; // You'll need to move the formatDate function to utils

interface JournalLinkProps {
  id: string;
  title: string;
  date: string | Date;
  className?: string;
  handleOnClick?: () => void;
}

export function JournalLink({
  id,
  title,
  date,
  className = "",
  handleOnClick,
}: JournalLinkProps) {
  return (
    <Link
      href={`/journal/${id}`}
      className={`hover:underline flex flex-col ${className}`}
      onClick={handleOnClick}
    >
      <span className="text-xs sm:text-sm md:text-xs lg:text-sm font-bold text-blue-500 mb-1">
        {title}
      </span>
      <span className="text-xs sm:text-sm md:text-xs lg:text-sm text-gray-500">
        {formatDate(date.toString())}
      </span>
    </Link>
  );
}
