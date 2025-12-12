import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
};

export default function Select({
  label,
  error,
  helperText,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm">
      {label && (
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </span>
      )}
      <select
        className={`w-full rounded-lg border ${
          error
            ? "border-red-300 dark:border-red-700"
            : "border-zinc-300 dark:border-zinc-700"
        } bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/50 focus:outline-none transition-colors ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</span>
      )}
    </label>
  );
}


