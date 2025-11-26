import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
  title: "EDMS — Admin",
  description: "Electronic Document Management System - UI (static)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-zinc-50 text-zinc-900`}
      >
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 p-6 md:p-10">
          <Sidebar />
          <main className="min-h-[calc(100vh-64px)] w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
