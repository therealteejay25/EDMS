import React from "react";

export default function Badge({
  children,
  variant = "default",
  className = "",
}: React.PropsWithChildren<{ variant?: "default" | "success" | "warning" | "danger" | "info"; className?: string }>) {
  const variants: Record<string, string> = {
    default: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
