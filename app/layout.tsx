import type { Metadata } from "next";
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
        <div className="mx-auto flex h-screen overflow-hidden gap-6">
          <Sidebar />
          <main className="min-h-[calc(100vh-64px)] p-6 md:p-10 w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
