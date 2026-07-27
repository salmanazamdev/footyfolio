import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FootyFolio - Get Scouted, Get Seen",
  description: "Digital portfolio and scouting platform for amateur football talent across Pakistan & South Asia.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="%230F172A"/><rect x="4" y="4" width="24" height="24" rx="6" stroke="%23334155" stroke-width="2" fill="none"/><path d="M16 8v16" stroke="%2310B981" stroke-width="2"/><path d="M11 16a5 5 0 1 0 10 0 5 5 0 0 0-10 0z" stroke="%2334D399" stroke-width="2" fill="%2310B981" fill-opacity="0.2"/><circle cx="16" cy="16" r="2" fill="%2334D399"/></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#F8FAFC] text-[#111827] selection:bg-[#16A34A] selection:text-white">
        {children}
      </body>
    </html>
  );
}
