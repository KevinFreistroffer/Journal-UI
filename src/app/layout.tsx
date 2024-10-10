import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import Header from "@/components/ui/Header/Header";
import { AuthProvider } from "@/hooks/useAuth";
import Footer from "@/components/ui/Footer";
import { JournalProvider } from "@/hooks/useJournal";
import { ModalProvider } from "@/GlobalModalContext";
import CookieConsent from "@/components/ui/CookieConsent";
import { SearchProvider } from "@/SearchContext";
import GlobalModal from "@/components/ui/GlobalModal";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Journals",
  description: "Entrie your life",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const user = await getUser();/ /how to make this work?
  const cookieStore = cookies();
  const consentCookie = cookieStore.get("cookieConsent");
  // const initialConsent = consentCookie ? consentCookie.value === "true" : null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <SearchProvider>
            <AuthProvider>
              <JournalProvider>
                <Theme>
                  <ModalProvider>
                    <Header />
                    {children}
                    <CookieConsent
                      initialConsent={consentCookie !== undefined}
                    />
                    <GlobalModal />
                    <Footer />
                  </ModalProvider>
                </Theme>
              </JournalProvider>
            </AuthProvider>
          </SearchProvider>
        </div>
      </body>
    </html>
  );
}
