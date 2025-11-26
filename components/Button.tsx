import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm";
  const variants: Record<string, string> = {
    primary: "bg-sky-600 text-white hover:bg-sky-700",
    ghost:
      "bg-transparent border border-zinc-200 text-zinc-800 hover:bg-zinc-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
