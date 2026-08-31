import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GCC | Global Collaboration Cell — BMSIT",
    template: "%s | GCC BMSIT",
  },
  description:
    "Official platform for the Global Collaboration Cell at BMS Institute of Technology and Management.",
  keywords: ["GCC", "BMSIT", "Global Collaboration Cell", "BMS Institute"],
  authors: [{ name: "GCC BMSIT" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
