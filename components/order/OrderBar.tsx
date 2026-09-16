"use client";

import Link from "next/link";
import { cartCount, cartTotalCents, useCart } from "@/lib/cart-store";
import { formatBRL, plural } from "@/lib/format";

/**
 * Barra fixa de acesso ao pedido. Entra por baixo e some quando o carrinho
 * esvazia. O respiro inferior vem da safe area, nunca de um valor fixo — é o
 * que impede o botão de ficar sob a barra de gestos em modo standalone.
 */
export function OrderBar({ label = "Ver pedido", href = "/pedido" }: { label?: string; href?: string }) {
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);

  if (count === 0) return null;

  const total = cartTotalCents(lines);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="pointer-events-auto w-full max-w-[30rem] animate-rise bg-canvas px-4 pt-3 shadow-bar">
        <Link
          href={href}
          className="tap flex h-14 w-full items-center justify-between gap-3 rounded-2xl bg-canaa-700 pl-4 pr-3 text-canaa-50 shadow-lifted active:bg-canaa-800"
        >
          <span className="flex items-center gap-2.5">
            <span className="nums grid size-7 place-items-center rounded-pill bg-canaa-50 text-[13px] font-bold text-canaa-800">
              {count}
            </span>
            <span className="text-[15px] font-semibold">
              {label}
              <span className="ml-1 font-normal text-canaa-200">
                · {count} {plural(count, "item", "itens")}
              </span>
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="nums text-[16px] font-bold">{formatBRL(total)}</span>
            <svg viewBox="0 0 24 24" className="size-5 text-canaa-200" aria-hidden>
              <path
                d="m9 5 7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
        <div className="pad-safe-b h-3" />
      </div>
    </div>
  );
}

/** Espaçador que impede a barra fixa de cobrir o fim do conteúdo. */
export function OrderBarSpacer() {
  const lines = useCart((s) => s.lines);
  if (cartCount(lines) === 0) return null;
  return <div aria-hidden className="pad-safe-b h-[4.75rem]" />;
}
