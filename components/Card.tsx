import React from "react";

export default function Card({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-lg border border-zinc-100 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
