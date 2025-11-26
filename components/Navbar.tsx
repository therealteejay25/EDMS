"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function IconDocs() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 7h10M7 11h10M7 15h6"
      />
    </svg>
  );
}

export default function Navbar() {
  const [role, setRole] = useState<string>("Admin");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("edms:role") : null;
    if (stored) setRole(stored);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("edms:role", role);
  }, [role]);

  const showApprovals = role === "Admin";

  useEffect(() => {
    const load = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${API}/api/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          return;
        }
        const json = await res.json();
        setUser(json.user);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="text-sky-600 text-lg font-semibold">Zentra</div>
          <nav className="hidden md:flex gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100"
              href="/dashboard"
            >
              <IconDocs />
              Dashboard
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100"
              href="/documents"
            >
              Documents
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100"
              href="/upload"
            >
              Upload
            </Link>
            {showApprovals && (
              <Link
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100"
                href="/approvals"
              >
                Approvals
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm md:flex">
            Signed in as{" "}
            <span className="ml-2 font-medium">{user?.name ?? "Guest"}</span>
          </div>

          <label className="flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm">
            <span className="text-xs text-zinc-500">Role</span>
            <span className="text-xs text-zinc-500">{user?.role ?? role}</span>
          </label>

          <button
            type="button"
            onClick={async () => {
              try {
                const API = process.env.NEXT_PUBLIC_API_URL || "";
                await fetch(`${API}/api/auth/logout`, {
                  credentials: "include",
                });
              } catch (e) {
                // ignore
              }
              router.push("/login");
            }}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
