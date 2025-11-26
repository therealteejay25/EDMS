import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm">
      {label ? <span className="text-zinc-700">{label}</span> : null}
      <input
        className={`w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none ${className}`}
        {...props}
      />
    </label>
  );
}
