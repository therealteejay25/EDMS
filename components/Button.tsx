import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  as?: "button" | "span";
  loading?: boolean;
  loadingText?: string;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  as: Component = "button",
  loading = false,
  loadingText,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primary focus:ring-primary dark:bg-primary dark:hover:bg-primary",
    secondary: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    outline: "border border-zinc-300 bg-transparent text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
    ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-500 dark:text-zinc-300 dark:hover:bg-zinc-800",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800",
  };

  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : null}
      {loading ? (loadingText || children) : children}
    </>
  );

  if (Component === "span") {
    const spanProps = props as React.HTMLAttributes<HTMLSpanElement>;
    return (
      <span
        className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
        aria-disabled={isDisabled}
        {...spanProps}
      >
        {content}
      </span>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
      disabled={isDisabled}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
