import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/ui/Header/Header";
import Footer from "@/components/ui/Footer";
import { JournalProvider } from "@/hooks/useJournal";
import { ModalProvider } from "@/context/GlobalModalContext";
import CookieConsent from "@/components/ui/CookieConsent";
import GlobalModal from "@/components/ui/GlobalModal";
import { SearchProvider } from "@/context/SearchContext";
import { ViewportProvider } from "@/context/ViewportContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NotificationProvider } from "@/context/NotificationContext";
import { LOCAL_STORAGE_PREFIX } from "@/lib/services/localStorageService";

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

const monaSans = localFont({
  src: "../fonts/Mona-Sans.woff2",
  variable: "--font-mona-sans",
  weight: "100 200 300 400 500 600 700 800 900",
});

export const metadata: Metadata = {
  title: "SumX",
  description: "Think > Summarize > Tweet",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const user = await getUser();/ /how to make this work?
  const cookieStore = await cookies();
  const consentCookie = await cookieStore.get("cookieConsent");
  // const initialConsent = consentCookie ? consentCookie.value === "true" : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${monaSans.variable} antialiased`}>
        <div className="flex flex-col min-h-screen">
          <SearchProvider>
            <AuthProvider>
              <NotificationProvider>
                <JournalProvider>
                  <ViewportProvider>
                    <ThemeProvider
                      attribute="class"
                      defaultTheme="light"
                      enableSystem={false}
                      disableTransitionOnChange
                      storageKey={LOCAL_STORAGE_PREFIX + "theme"}
                    >
                      <ModalProvider>
                        <Header />
                        {children}
                        <CookieConsent
                          initialConsent={consentCookie !== undefined}
                        />
                        <GlobalModal />
                        <Footer />
                      </ModalProvider>
                    </ThemeProvider>
                  </ViewportProvider>
                </JournalProvider>
              </NotificationProvider>
            </AuthProvider>
          </SearchProvider>
        </div>
      </body>
    </html>
  );
}
