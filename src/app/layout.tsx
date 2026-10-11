import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const metadata: Metadata = {
  title: "Monis.rent Studio — Design your Bali workspace",
  description:
    "Build your perfect rented workspace piece by piece: desks, chairs, monitors and more, delivered across Bali. Demo experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "#fcf9f1", border: "1px solid #e1d7c1", color: "#2e2a24", borderRadius: "12px" },
          }}
        />
      </body>
    </html>
  );
}