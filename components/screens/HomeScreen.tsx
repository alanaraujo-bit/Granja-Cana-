"use client";

import { useMemo } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { ProductCard } from "@/components/order/ProductCard";
import { OrderBar, OrderBarSpacer } from "@/components/order/OrderBar";
import { PRODUCTS } from "@/lib/products";
import { getOpenStatus } from "@/lib/delivery";
import { useCart } from "@/lib/cart-store";
import { useClientNow } from "@/lib/use-client-now";

export function HomeScreen() {
  const add = useCart((s) => s.add);
  const now = useClientNow();
  const status = useMemo(() => (now ? getOpenStatus(now) : null), [now]);
  const greeting = useMemo(() => {
    if (!now) return null;
    const h = now.getHours();
    return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  }, [now]);

  return (
    <>
      <header className="relative overflow-hidden bg-canaa-800 text-canaa-50">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 70% at 85% 0%, rgba(226,165,60,0.18) 0%, rgba(226,165,60,0) 60%)",
          }}
        />

        <div className="pad-safe-t relative">
          <div className="flex items-center justify-between px-5 pb-1 pt-5">
            <Wordmark />
            <StatusPill status={status} />
          </div>

          <div className="px-5 pb-8 pt-6">
            <p className="h-[18px] text-[13px] font-medium text-canaa-300">
              {greeting && <span className="animate-fade-in">{greeting}</span>}
            </p>
            <h1 className="mt-1.5 text-balance font-display text-[25px] font-semibold leading-[1.2] tracking-[-0.01em] xs:text-[27px]">
              Ovos caipiras de verdade, entregues na sua porta.
            </h1>
            <p className="mt-3 max-w-[30ch] text-[14px] leading-relaxed text-canaa-200">
              Criação solta, colheita do dia e entrega feita por quem cuida das galinhas.
            </p>
          </div>
        </div>

        <DeliveryStrip />
      </header>

      <main className="relative -mt-4 rounded-t-sheet bg-canvas px-4 pt-6">
        <h2 className="mb-3.5 px-1 font-display text-[19px] font-semibold text-ink">
          Escolha sua bandeja
        </h2>

        <div className="flex flex-col gap-3">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} onAdd={(qty) => add(product.id, qty)} />
          ))}
        </div>

        <FarmNote />
        <OrderBarSpacer />
        <div className="pad-safe-b h-6" />
      </main>

      <OrderBar />
    </>
  );
}

function StatusPill({ status }: { status: { open: boolean; label: string } | null }) {
  if (!status) {
    // Reserva exata do espaço final: nada se desloca quando o texto chega.
    return <div aria-hidden className="h-7 w-[9.5rem] rounded-pill bg-canaa-700/60" />;
  }

  return (
    <div className="animate-fade-in flex h-7 items-center gap-1.5 rounded-pill bg-canaa-700/80 pl-2 pr-2.5">
      <span className="relative flex size-2">
        {status.open && (
          <span className="absolute inline-flex size-full animate-ping rounded-pill bg-gema-300 opacity-60" />
        )}
        <span
          className={`relative inline-flex size-2 rounded-pill ${
            status.open ? "bg-gema-300" : "bg-canaa-400"
          }`}
        />
      </span>
      <span className="text-[11px] font-semibold text-canaa-100">
        {status.open ? "Aberto agora" : "Fechado"}
      </span>
    </div>
  );
}

function DeliveryStrip() {
  return (
    <div className="relative border-t border-canaa-700/60 bg-canaa-900/40 px-5 py-3.5 pb-7">
      <div className="flex items-center gap-3">
        <Fact icon={<PinIcon />} title="Canaã dos Carajás" note="Entrega já inclusa" />
        <div className="h-8 w-px shrink-0 bg-canaa-700/70" />
        <Fact icon={<ClockIcon />} title="Terça a domingo" note="08h às 16h" />
      </div>
    </div>
  );
}

function Fact({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-pill bg-canaa-700/70 text-canaa-200">
        {icon}
      </span>
      <div className="min-w-0 leading-tight">
        <div className="text-[12.5px] font-semibold text-canaa-50">{title}</div>
        <div className="mt-0.5 text-[11px] text-canaa-300">{note}</div>
      </div>
    </div>
  );
}

function FarmNote() {
  return (
    <p className="mt-6 px-2 text-center font-display text-[14px] italic leading-relaxed text-ink-muted">
      “Todo ovo que sai daqui é do jeito que eu levaria pra minha própria casa.”
      <span className="mt-1.5 block text-[11px] font-semibold uppercase not-italic tracking-[0.14em] text-ink-subtle">
        Granja Canaã
      </span>
    </p>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[15px]" aria-hidden>
      <path
        d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[15px]" aria-hidden>
      <circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.6V12l3 1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
