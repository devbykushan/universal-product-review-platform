import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

export const metadata: Metadata = {
  title: "UniversalReview | All-in-One Expert & Community Product Review Platform",
  description:
    "Honest in-depth reviews and community ratings across Tech, Food & Beverage, Beauty, Home Kitchen, and Fashion with category-specific dynamic rating metrics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <StoreProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AuthModal />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
