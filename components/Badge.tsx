import React from "react";

export default function Badge({
  children,
  color = "gray",
}: React.PropsWithChildren<{ color?: string }>) {
  const colors: Record<string, string> = {
    gray: "bg-zinc-100 text-zinc-800",
    green: "bg-emerald-100 text-emerald-800",
    yellow: "bg-amber-100 text-amber-800",
    red: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
        colors[color] || colors.gray
      }`}
    >
      {children}
    </span>
  );
}
