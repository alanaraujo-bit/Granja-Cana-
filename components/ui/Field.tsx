"use client";

import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string | null;
  hint?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel";
  multiline?: boolean;
};

/**
 * Campo de formulário com estética de aplicativo: rótulo acima, superfície
 * preenchida, altura confortável e erro que aparece sem deslocar a tela.
 */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  autoComplete,
  inputMode = "text",
  multiline = false,
}: Props) {
  const id = useId();
  const errorId = `${id}-erro`;
  const Tag = multiline ? "textarea" : "input";

  return (
    <div className="mb-2">
      <label htmlFor={id} className="mb-1.5 block px-1 text-[13px] font-semibold text-ink">
        {label}
      </label>
      <Tag
        id={id}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        rows={multiline ? 2 : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full resize-none rounded-control border bg-surface px-3.5 py-3 leading-snug
          text-ink placeholder:text-ink-subtle/80 transition-colors duration-150
          focus:border-canaa-500 focus-visible:outline-none
          ${error ? "border-critical bg-critical/[0.04]" : "border-line-strong"}
          ${multiline ? "min-h-[4.25rem]" : "h-[3.25rem]"}`}
        style={{ userSelect: "text", WebkitUserSelect: "text" }}
      />
      <div className="min-h-[1.15rem] px-1 pt-1">
        {error ? (
          <p id={errorId} role="alert" className="animate-fade-in text-[12px] font-medium text-critical">
            {error}
          </p>
        ) : hint ? (
          <p className="text-[12px] text-ink-subtle">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
