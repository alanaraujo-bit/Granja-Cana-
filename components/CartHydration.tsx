"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

/**
 * O store persistido só lê o localStorage depois da montagem. Isso mantém o
 * primeiro render do cliente idêntico ao HTML do servidor e elimina o
 * descarte de árvore por divergência de hidratação.
 */
export function CartHydration() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);
  return null;
}
