"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
  children: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-canaa-700 text-canaa-50 shadow-raised active:bg-canaa-800 disabled:bg-canaa-700/40 disabled:shadow-none",
  secondary:
    "bg-surface text-canaa-800 border border-line-strong active:bg-surface-sunken disabled:text-ink-subtle",
  ghost: "bg-transparent text-canaa-700 active:bg-canaa-50 disabled:text-ink-subtle",
};

const SIZES: Record<Size, string> = {
  // Alvos de toque nunca abaixo de 44px.
  md: "h-11 px-4 text-[15px] rounded-control",
  lg: "h-14 px-5 text-[16px] rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  full = false,
  className = "",
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`tap relative inline-flex select-none items-center justify-center gap-2 font-semibold
        disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      <span
        className={`inline-flex items-center gap-2 transition-opacity duration-150 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner />
        </span>
      )}
    </button>
  );
}

export function Spinner({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} animate-spin-soft`} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
