// import CookieStatus from "@/components/ui/CookieStatus";
import Link from "next/link";
import "./styles.css";
// import PushNotificationManager from "@/components/ui/PWA/PushNotificationManager";
// import InstallPrompt from "@/components/ui/PWA/InstallPrompt";
// import {
//   subscribeUser,
//   unsubscribeUser,
//   sendNotification,
// } from "@/actions/pwa";
// import PWA from "@/components/ui/PWA/PWA";
// import GlobalModal from "@/components/ui/GlobalModal";
import { PenLine, Sparkles, Twitter } from "lucide-react"; // Import icons
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div
      id="home"
      className={cn(
        "flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20",
        "font-[family-name:var(--font-geist-sans)]"
      )}
    >
      <main
        className={cn("flex flex-col gap-8 items-center text-center max-w-2xl")}
      >
        <h1 className={cn("text-4xl sm:text-6xl font-bold mb-4")}>SumX</h1>
        <p className={cn("text-xl sm:text-2xl mb-8")}>
          Transform your thoughts into concise tweets with ease
        </p>

        <div
          className={cn(
            "flex flex-col sm:flex-row gap-4 items-center justify-center mb-12"
          )}
        >
          <div className="flex flex-col items-center">
            <PenLine size={64} className="mb-2" />
            <p className="text-sm">Write your thoughts</p>
          </div>
          <div className="text-4xl">→</div>
          <div className="flex flex-col items-center">
            <Sparkles size={64} className="mb-2" />
            <p className="text-sm">AI summarizes</p>
          </div>
          <div className="text-4xl">→</div>
          <div className="flex flex-col items-center">
            <Twitter size={64} className="mb-2" />
            <p className="text-sm">Share as a tweet</p>
          </div>
        </div>

        <div className={cn("flex gap-4 items-center flex-col sm:flex-row")}>
          <Link
            href="/signup"
            className={cn(
              "rounded-full border border-solid border-transparent transition-colors",
              "flex items-center justify-center bg-foreground text-background gap-2",
              "hover:bg-[#383838] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 text-white",
              " dark:border-white/[.145] dark:hover:bg-[#1a1a1a] dark:hover:bg-[#ccc]"
            )}
          >
            Start Writing
          </Link>
          <Link
            href="/about"
            className={cn(
              "rounded-full border border-solid border-black/[.08] sm:min-w-44 ",
              "transition-colors flex items-center justify-center",
              "hover:bg-[#f2f2f2] hover:border-transparent px-4 sm:px-5",
              "text-sm sm:text-base h-10 sm:h-12 dark:hover:bg-[#1a1a1a] dark:border-white/[.145]"
            )}
          >
            Learn More
          </Link>
        </div>
      </main>

      <footer
        className={cn(
          "flex gap-6 flex-wrap items-center justify-center text-sm"
        )}
      >
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
        <Link href="/contact" className="hover:underline">
          Contact Us
        </Link>
      </footer>
      {/* <CookieStatus /> */}
    </div>
  );
}
