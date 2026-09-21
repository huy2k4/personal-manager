import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Manager - Hello World",
  description: "A modern Personal Manager application built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
