"use client";

import type { PaymentMethod } from "@/lib/cart-store";

const METHODS: { id: PaymentMethod; label: string; note: string; icon: React.ReactNode }[] = [
  {
    id: "pix",
    label: "Pix",
    note: "A chave é enviada na confirmação",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden>
        <path
          d="M12 3.6 20.4 12 12 20.4 3.6 12z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M8.6 8.6 12 12l3.4-3.4M8.6 15.4 12 12l3.4 3.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "cartao",
    label: "Cartão",
    note: "Maquininha na entrega",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden>
        <rect x="3" y="5.5" width="18" height="13" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6.5 14.5h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "dinheiro",
    label: "Dinheiro",
    note: "Informe se precisa de troco",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden>
        <rect x="2.8" y="6.5" width="18.4" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
];

export function PaymentPicker({
  value,
  onChange,
}: {
  value: PaymentMethod | null;
  onChange: (m: PaymentMethod) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Forma de pagamento" className="flex flex-col gap-2">
      {METHODS.map((m) => {
        const selected = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(m.id)}
            className={`tap flex items-center gap-3 rounded-control border px-3.5 py-3 text-left
              ${
                selected
                  ? "border-canaa-600 bg-canaa-50 shadow-raised"
                  : "border-line-strong bg-surface active:bg-surface-sunken"
              }`}
          >
            <span className={selected ? "text-canaa-700" : "text-ink-muted"}>{m.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink">{m.label}</span>
              <span className="block text-[12.5px] leading-tight text-ink-muted">{m.note}</span>
            </span>
            <Radio selected={selected} />
          </button>
        );
      })}
    </div>
  );
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      className={`grid size-[22px] shrink-0 place-items-center rounded-full border-2 transition-colors duration-150 ${
        selected ? "border-canaa-600" : "border-line-strong"
      }`}
    >
      <span
        className={`size-[11px] rounded-full bg-canaa-600 transition-transform duration-200 ${
          selected ? "scale-100" : "scale-0"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
      />
    </span>
  );
}
