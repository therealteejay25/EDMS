import Link from "next/link";
import React from "react";

export default function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 md:block">
      <div className="sticky h-full top-20 space-y-3">
        <nav className=" border h-full border-zinc-100 bg-white p-3 text-sm">
          <Link
            className="block rounded-md px-3 py-2 hover:bg-zinc-50"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="block rounded-md px-3 py-2 hover:bg-zinc-50"
            href="/documents"
          >
            Documents
          </Link>
          <Link
            className="block rounded-md px-3 py-2 hover:bg-zinc-50"
            href="/upload"
          >
            Upload
          </Link>
          <Link
            className="block rounded-md px-3 py-2 hover:bg-zinc-50"
            href="/approvals"
          >
            Approvals
          </Link>
        </nav>
      </div>
    </aside>
  );
}
