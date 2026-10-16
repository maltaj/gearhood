import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boleka | Earn from gear you hardly use",
  description:
    "Register your tents, cooler boxes, baby gear and tools as a founding owner on Boleka, Cape Town's neighbour-to-neighbour gear rental.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Figtree:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="font-body text-[16px] leading-relaxed">{children}</body>
    </html>
  );
}
