import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "isMoreTools - Local Browser Tools",
    template: "%s | isMoreTools"
  },
  description:
    "Privacy-friendly browser tools for developers, text, files, and images. All operations run locally in your browser.",
  metadataBase: new URL("https://ismoretools.local"),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/brands/logo.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
