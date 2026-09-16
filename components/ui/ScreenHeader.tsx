"use client";

import { useRouter } from "next/navigation";

/**
 * Cabeçalho das telas empilhadas. Fixo no topo, com respiro de safe area, e
 * um único alvo de retorno — navegação de aplicativo, não de site.
 */
export function ScreenHeader({ title, step }: { title: string; step?: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-canvas">
      <div className="pad-safe-t" />
      <div className="flex h-14 items-center gap-1 px-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Voltar"
          className="tap grid size-11 shrink-0 place-items-center rounded-pill text-canaa-700 active:bg-canaa-100"
        >
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
            <path
              d="m15 5-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[18px] font-semibold leading-tight text-ink">
            {title}
          </h1>
          {step && (
            <p className="truncate text-[11.5px] font-medium leading-tight text-ink-subtle">{step}</p>
          )}
        </div>
      </div>
      <div className="h-px bg-line" />
    </header>
  );
}
