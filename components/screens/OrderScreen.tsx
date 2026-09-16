"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { Button } from "@/components/ui/Button";
import { OrderTotals } from "@/components/order/OrderTotals";
import { EggMark } from "@/components/brand/Wordmark";
import { cartCount, cartEggCount, useCart, useCartHydrated } from "@/lib/cart-store";
import { getProduct } from "@/lib/products";
import { formatBRL, plural } from "@/lib/format";

export function OrderScreen() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const hydrated = useCartHydrated();
  const count = cartCount(lines);
  const eggs = cartEggCount(lines);

  // Antes da hidratação o carrinho parece vazio; mostrar o estado vazio nesse
  // instante seria uma informação errada piscando na tela.
  if (!hydrated) return <LoadingOrder />;
  if (count === 0) return <EmptyOrder />;

  return (
    <>
      <ScreenHeader title="Seu pedido" step={`${eggs} ovos · ${count} ${plural(count, "item", "itens")}`} />

      <main className="px-4 pt-4">
        <ul className="flex flex-col gap-2.5">
          {lines.map((line, i) => {
            const product = getProduct(line.productId);
            if (!product) return null;

            return (
              <li
                key={line.productId}
                className="animate-rise rounded-card border border-line bg-surface p-3.5 shadow-raised"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gema-100 to-[#f6e9cd]">
                    <span className="nums font-display text-[17px] font-bold text-canaa-700">
                      {product.units}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[16px] font-semibold leading-tight text-ink">
                      {product.tier}
                    </h2>
                    <p className="nums mt-0.5 text-[12.5px] text-ink-muted">
                      {product.units} ovos · {formatBRL(product.priceCents)} cada
                    </p>
                  </div>

                  <div className="nums shrink-0 font-display text-[16px] font-bold text-canaa-700">
                    {formatBRL(product.priceCents * line.qty)}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <QtyStepper
                    value={line.qty}
                    onChange={(next) => setQty(line.productId, next)}
                    label={product.shortName}
                  />
                  <button
                    type="button"
                    onClick={() => remove(line.productId)}
                    className="tap h-11 rounded-control px-3 text-[13.5px] font-semibold text-ink-muted active:bg-surface-sunken active:text-critical"
                  >
                    Remover
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4">
          <OrderTotals lines={lines} />
        </div>

        <Link
          href="/"
          className="tap mt-3 flex h-12 items-center justify-center gap-1.5 rounded-control text-[14px] font-semibold text-canaa-700 active:bg-canaa-50"
        >
          <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
            <path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          Adicionar mais bandejas
        </Link>

        <div className="pad-safe-b h-[6.5rem]" />
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <div className="pointer-events-auto w-full max-w-[30rem] bg-canvas px-4 pt-3 shadow-bar">
          <Button size="lg" full onClick={() => router.push("/checkout")}>
            Escolher entrega e pagamento
          </Button>
          <div className="pad-safe-b h-3" />
        </div>
      </div>
    </>
  );
}

/** Espera pela leitura do carrinho: a moldura da tela já existe, só o
 *  conteúdo é que ainda não. Nada se desloca quando ele chega. */
function LoadingOrder() {
  return (
    <>
      <ScreenHeader title="Seu pedido" />
      <main className="px-4 pt-4" aria-busy>
        <div className="flex flex-col gap-2.5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-[8.75rem] animate-pulse rounded-card border border-line bg-surface-sunken"
            />
          ))}
        </div>
        <span className="sr-only">Carregando seu pedido</span>
      </main>
    </>
  );
}

function EmptyOrder() {
  return (
    <>
      <ScreenHeader title="Seu pedido" />
      <main className="flex min-h-[70dvh] flex-col items-center justify-center px-8 text-center">
        <div className="animate-pop grid size-20 place-items-center rounded-full bg-canaa-50 text-canaa-300">
          <EggMark outline className="size-9" />
        </div>
        <h2 className="animate-rise mt-5 font-display text-[20px] font-semibold text-ink">
          Seu pedido está vazio
        </h2>
        <p className="animate-rise mt-2 max-w-[28ch] text-[14px] leading-relaxed text-ink-muted" style={{ animationDelay: "60ms" }}>
          Escolha uma bandeja na tela inicial e ela aparece aqui para você conferir antes de fechar.
        </p>
        <Link
          href="/"
          className="tap mt-7 flex h-12 items-center rounded-2xl bg-canaa-700 px-6 text-[15px] font-semibold text-canaa-50 shadow-raised active:bg-canaa-800"
        >
          Ver as bandejas
        </Link>
      </main>
    </>
  );
}
