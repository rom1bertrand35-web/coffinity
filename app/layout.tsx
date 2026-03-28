import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/components/NavigationBar";
import { PointsProvider } from "@/components/PointsFeedback";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Coffinity - Your Coffee Tasting App",
  description: "Scan, rate, and share your coffee tastings with the community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} pb-20 bg-[var(--color-background)] min-h-screen text-[var(--color-foreground)]`}>
        <PointsProvider>
          <main className="max-w-md mx-auto min-h-screen relative">
            {children}
            <NavigationBar />
          </main>
        </PointsProvider>
      </body>
    </html>
  );
}
