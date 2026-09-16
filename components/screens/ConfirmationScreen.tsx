"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, useCartHydrated, type PlacedOrder } from "@/lib/cart-store";
import { getProduct } from "@/lib/products";
import { formatBRL } from "@/lib/format";

const PAYMENT_LABEL: Record<PlacedOrder["payment"], string> = {
  pix: "Pix",
  cartao: "Cartão na entrega",
  dinheiro: "Dinheiro na entrega",
};

export function ConfirmationScreen() {
  const router = useRouter();
  const lastOrder = useCart((s) => s.lastOrder);
  const hydrated = useCartHydrated();

  // Só redireciona depois que o store leu o localStorage; caso contrário um
  // recarregamento desta tela expulsaria o cliente do próprio pedido.
  useEffect(() => {
    if (hydrated && !lastOrder) router.replace("/");
  }, [hydrated, lastOrder, router]);

  if (!lastOrder) return <div className="min-h-dvh bg-canaa-800" />;

  return (
    <div className="min-h-dvh bg-canaa-800 text-canaa-50">
      <div className="pad-safe-t" />

      <section className="relative overflow-hidden px-6 pb-9 pt-10 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 12%, rgba(226,165,60,0.22) 0%, rgba(226,165,60,0) 70%)",
          }}
        />

        <div className="relative">
          <SuccessMark />

          <h1 className="animate-rise mt-6 font-display text-[25px] font-semibold leading-tight" style={{ animationDelay: "220ms" }}>
            Pedido confirmado!
          </h1>
          <p
            className="animate-rise mx-auto mt-2.5 max-w-[30ch] text-[14px] leading-relaxed text-canaa-200"
            style={{ animationDelay: "300ms" }}
          >
            Tudo certo, {firstName(lastOrder.customerName)}! Já avisamos a granja e seus ovos serão
            separados para a entrega.
          </p>

          <div
            className="animate-rise mt-5 inline-flex items-center gap-2 rounded-pill bg-canaa-900/50 py-2 pl-3 pr-3.5"
            style={{ animationDelay: "370ms" }}
          >
            <span className="text-[11.5px] font-medium text-canaa-300">Código</span>
            <span data-selectable className="nums text-[15px] font-bold tracking-wide text-gema-300">
              {lastOrder.code}
            </span>
          </div>
        </div>
      </section>

      <section className="animate-rise rounded-t-sheet bg-canvas px-4 pb-4 pt-6 text-ink" style={{ animationDelay: "420ms" }}>
        <div className="rounded-card border border-line bg-surface">
          <Detail
            icon={<ClockIcon />}
            label="Entrega"
            value={lastOrder.slotLabel}
            note="Você recebe uma mensagem quando o entregador sair."
          />
          <Divider />
          <Detail icon={<PinIcon />} label="Endereço" value={lastOrder.address} selectable />
          <Divider />
          <Detail
            icon={<WalletIcon />}
            label="Pagamento"
            value={PAYMENT_LABEL[lastOrder.payment]}
            note={
              lastOrder.payment === "pix"
                ? "A chave Pix chega junto com a confirmação."
                : lastOrder.changeForCents
                  ? `Levaremos troco para ${formatBRL(lastOrder.changeForCents)}.`
                  : undefined
            }
          />
        </div>

        <div className="mt-3 rounded-card border border-line bg-surface p-4">
          <h2 className="mb-2.5 font-display text-[15px] font-semibold text-ink">Itens</h2>
          <ul className="flex flex-col gap-1.5">
            {lastOrder.lines.map((line) => {
              const product = getProduct(line.productId);
              if (!product) return null;
              return (
                <li key={line.productId} className="flex items-baseline justify-between gap-3">
                  <span className="nums min-w-0 truncate text-[13.5px] text-ink-muted">
                    {line.qty} × {product.name}
                  </span>
                  <span className="nums shrink-0 text-[13.5px] font-semibold text-ink">
                    {formatBRL(product.priceCents * line.qty)}
                  </span>
                </li>
              );
            })}
            <li className="flex items-baseline justify-between gap-3 pt-1">
              <span className="text-[13.5px] text-ink-muted">Entrega</span>
              <span className="text-[13.5px] font-semibold text-positive">Inclusa</span>
            </li>
          </ul>

          <div className="my-3 h-px bg-line" />
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[16px] font-semibold text-ink">Total</span>
            <span className="nums font-display text-[22px] font-bold text-canaa-700">
              {formatBRL(lastOrder.totalCents)}
            </span>
          </div>
        </div>

        <p className="mt-4 px-3 text-center text-[12.5px] leading-relaxed text-ink-subtle">
          Versão de testes: o pedido fica registrado, mas nada é cobrado e a granja ainda não
          recebe aviso automático.
        </p>

        <Link
          href="/"
          className="tap mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-canaa-700 text-[15px] font-semibold text-canaa-50 shadow-raised active:bg-canaa-800"
        >
          Voltar ao início
        </Link>

        <div className="pad-safe-b h-5" />
      </section>
    </div>
  );
}

function firstName(full: string): string {
  return full.split(" ")[0] || full;
}

/** Marca de sucesso: o traço é desenhado, não apenas revelado. */
function SuccessMark() {
  return (
    <div className="animate-pop relative mx-auto grid size-[86px] place-items-center">
      <span className="absolute inset-0 rounded-full bg-canaa-50/10" />
      <span className="absolute inset-[9px] rounded-full bg-canaa-50/15" />
      <span className="relative grid size-[62px] place-items-center rounded-full bg-canvas">
        <svg viewBox="0 0 24 24" className="size-8 text-canaa-700" aria-hidden>
          <path
            d="m5 12.5 4.5 4.5L19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw"
            style={{ strokeDasharray: 30, ["--dash" as string]: 30 }}
          />
        </svg>
      </span>
      <span className="sr-only">Pedido confirmado</span>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
  note,
  selectable = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note?: string;
  selectable?: boolean;
}) {
  return (
    <div className="flex gap-3 p-4">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-pill bg-canaa-50 text-canaa-600">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
          {label}
        </div>
        <div
          {...(selectable ? { "data-selectable": true } : {})}
          className="mt-1 text-[14.5px] font-semibold leading-snug text-ink"
        >
          {value}
        </div>
        {note && <div className="mt-1 text-[12.5px] leading-snug text-ink-muted">{note}</div>}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="mx-4 h-px bg-line" />;
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[17px]" aria-hidden>
      <circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M12 7.6V12l3 1.8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[17px]" aria-hidden>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[17px]" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16.5 12h2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}
