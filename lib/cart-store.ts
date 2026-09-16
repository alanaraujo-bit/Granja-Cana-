"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getProduct } from "./products";

export type CartLine = { productId: string; qty: number };

export type PaymentMethod = "pix" | "cartao" | "dinheiro";

export type PlacedOrder = {
  code: string;
  lines: CartLine[];
  totalCents: number;
  slotId: string;
  slotLabel: string;
  payment: PaymentMethod;
  customerName: string;
  address: string;
  /** Troco solicitado, em centavos. Só existe no pagamento em dinheiro. */
  changeForCents: number | null;
  placedAt: string;
};

type CartState = {
  lines: CartLine[];
  lastOrder: PlacedOrder | null;
  add: (productId: string, qty: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  completeOrder: (order: PlacedOrder) => void;
};

const MAX_QTY = 20;

/**
 * No servidor não existe localStorage. Sem um storage válido o middleware de
 * persistência nem chega a expor `store.persist`, e todo o controle de
 * hidratação deixaria de existir durante a renderização estática.
 */
const serverStorage: Storage = {
  length: 0,
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      lastOrder: null,

      add: (productId, qty) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === productId);
          if (!existing) {
            return { lines: [...state.lines, { productId, qty: clamp(qty) }] };
          }
          return {
            lines: state.lines.map((l) =>
              l.productId === productId ? { ...l, qty: clamp(l.qty + qty) } : l,
            ),
          };
        }),

      setQty: (productId, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) =>
                  l.productId === productId ? { ...l, qty: clamp(qty) } : l,
                ),
        })),

      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),

      completeOrder: (order) => set({ lines: [], lastOrder: order }),
    }),
    {
      name: "granja-canaa:pedido",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? serverStorage : localStorage,
      ),
      partialize: (s) => ({ lines: s.lines, lastOrder: s.lastOrder }),
      // A leitura do storage é disparada manualmente após a montagem, em
      // <CartHydration/>. Sem isso, o HTML do servidor e o primeiro render do
      // cliente divergem e o React descarta a árvore.
      skipHydration: true,
    },
  ),
);

function clamp(n: number): number {
  return Math.max(1, Math.min(MAX_QTY, Math.round(n)));
}

export const CART_MAX_QTY = MAX_QTY;

/* ---- Seletores derivados ---- */

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export function cartTotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, l) => {
    const p = getProduct(l.productId);
    return p ? sum + p.priceCents * l.qty : sum;
  }, 0);
}

export function cartEggCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => {
    const p = getProduct(l.productId);
    return p ? sum + p.units * l.qty : sum;
  }, 0);
}

/**
 * Indica se o store já leu o localStorage. Toda tela que decide algo com base
 * no carrinho (redirecionar, mostrar estado vazio) precisa esperar por isto —
 * antes da hidratação o carrinho está sempre vazio, e agir nesse instante
 * expulsaria o cliente de um pedido que ele de fato tem.
 */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useCart.persist.onFinishHydration(onChange),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}
