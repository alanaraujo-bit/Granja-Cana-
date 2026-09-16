"use client";

import { CART_MAX_QTY } from "@/lib/cart-store";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  label: string;
  tone?: "soft" | "plain";
};

/**
 * Controle de quantidade. Botões de 44px, contador tabular para o número não
 * deslocar o layout ao passar de 9 para 10.
 */
export function QtyStepper({ value, onChange, min = 1, label, tone = "soft" }: Props) {
  const canDec = value > min;
  const canInc = value < CART_MAX_QTY;

  return (
    <div
      className={`flex items-center rounded-pill ${
        tone === "soft" ? "bg-surface-sunken" : "border border-line-strong bg-surface"
      }`}
    >
      <StepButton
        onClick={() => canDec && onChange(value - 1)}
        disabled={!canDec}
        label={`Diminuir quantidade de ${label}`}
      >
        <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
          <path d="M6 12h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </StepButton>

      <span
        className="nums w-8 text-center text-[16px] font-bold text-ink"
        aria-live="polite"
        aria-label={`Quantidade: ${value}`}
      >
        {value}
      </span>

      <StepButton
        onClick={() => canInc && onChange(value + 1)}
        disabled={!canInc}
        label={`Aumentar quantidade de ${label}`}
      >
        <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
          <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </StepButton>
    </div>
  );
}

function StepButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="tap grid size-11 shrink-0 place-items-center rounded-pill text-canaa-700
        disabled:text-ink-subtle/50 active:bg-canaa-100 disabled:active:bg-transparent"
    >
      {children}
    </button>
  );
}
