import React from "react";

export default function Card({
  children,
  className = "",
  padding = "default",
}: React.PropsWithChildren<{ className?: string; padding?: "none" | "sm" | "default" | "lg" }>) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
