import type { ReactNode } from "react";

/**
 * No celular a aplicação ocupa a tela inteira. No desktop ela vira uma coluna
 * centrada sobre um fundo ambiente — a identidade do aplicativo é preservada
 * em vez de esticada. O documento é o único elemento que rola: não existe
 * scroll interno concorrente em nenhuma tela.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden sm:block"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, #35502e 0%, #22331f 45%, #162115 100%)",
        }}
      />
      <div className="relative mx-auto min-h-dvh w-full max-w-[30rem] bg-canvas sm:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)]">
        {children}
      </div>
    </div>
  );
}
