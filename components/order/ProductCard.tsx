"use client";

import { useState } from "react";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { Button } from "@/components/ui/Button";
import { type Product, savingsVsDozen, unitPriceCents } from "@/lib/products";
import { formatBRL } from "@/lib/format";

export function ProductCard({
  product,
  index,
  onAdd,
}: {
  product: Product;
  index: number;
  onAdd: (qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const savings = savingsVsDozen(product);

  function handleAdd() {
    onAdd(qty);
    setQty(1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article
      className="animate-rise rounded-card border border-line bg-surface p-4 shadow-raised"
      style={{ animationDelay: `${60 + index * 70}ms` }}
    >
      <div className="flex items-start gap-3.5">
        <UnitTile units={product.units} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-[17px] font-semibold leading-tight text-ink">
              {product.tier}
            </h3>
            <div className="shrink-0 text-right">
              <div className="nums font-display text-[18px] font-bold leading-none text-canaa-700">
                {formatBRL(product.priceCents)}
              </div>
              <div className="nums mt-1 text-[11px] leading-none text-ink-subtle">
                {formatBRL(Math.round(unitPriceCents(product)))} por ovo
              </div>
            </div>
          </div>

          <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">{product.tagline}</p>

          {(product.badge || savings > 0) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {product.badge && (
                <span className="rounded-pill bg-gema-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-gema-600">
                  {product.badge}
                </span>
              )}
              {savings > 0 && (
                <span className="nums rounded-pill bg-canaa-50 px-2 py-1 text-[11px] font-semibold text-canaa-600">
                  Economia de {formatBRL(savings)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-line pt-3.5">
        <QtyStepper value={qty} onChange={setQty} label={product.shortName} />
        <Button full onClick={handleAdd} aria-label={`Adicionar ${qty} × ${product.name} ao pedido`}>
          {added ? (
            <>
              <CheckIcon /> Adicionado
            </>
          ) : (
            "Adicionar"
          )}
        </Button>
      </div>
    </article>
  );
}

/** Substitui a fotografia: a contagem é a informação, então ela é o visual. */
function UnitTile({ units }: { units: number }) {
  return (
    <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gema-100 to-[#f6e9cd] text-gema-600">
      <div className="text-center leading-none">
        <div className="nums font-display text-[24px] font-bold text-canaa-700">{units}</div>
        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-gema-600">
          ovos
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path
        d="m5 12.5 4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
