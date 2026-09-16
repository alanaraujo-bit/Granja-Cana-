"use server";

import { randomInt } from "node:crypto";
import { db } from "./db";
import { findSlot, granjaNow } from "./delivery";
import { getProduct } from "./products";
import type { CartLine, PaymentMethod, PlacedOrder } from "./cart-store";

/**
 * O que o cliente envia. Preço, total, rótulo da faixa e código do pedido
 * ficam de fora de propósito: esta função é alcançável por POST direto, então
 * tudo que vale dinheiro ou identifica o pedido é decidido aqui.
 */
export type PlaceOrderInput = {
  lines: CartLine[];
  slotId: string;
  payment: PaymentMethod;
  customerName: string;
  address: string;
  reference: string;
  changeForCents: number | null;
};

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; reason: "slot" | "invalid" | "unavailable" };

const PAYMENTS: readonly PaymentMethod[] = ["pix", "cartao", "dinheiro"];
const MAX_QTY = 20;

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = parse(input);
  if (!parsed) return { ok: false, reason: "invalid" };

  // Revalida contra o relógio da granja: a faixa pode ter expirado entre a
  // escolha e o envio.
  const slot = findSlot(parsed.slotId, granjaNow());
  if (!slot) return { ok: false, reason: "slot" };

  const items = parsed.lines.map((line) => {
    const product = getProduct(line.productId)!;
    return { ...line, name: product.name, unitPriceCents: product.priceCents };
  });
  const totalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.qty, 0);
  const slotLabel = `${slot.dayLabel}, ${slot.dateLabel} · ${slot.timeLabel}`;
  const address = [parsed.address, parsed.reference].filter(Boolean).join(" · ");

  const client = await db.connect().catch((error: unknown) => {
    console.error("placeOrder: sem conexão com o banco", error);
    return null;
  });
  if (!client) return { ok: false, reason: "unavailable" };

  try {
    await client.query("begin");

    // Código de 4 dígitos é fácil de ditar, mas colide. `on conflict do
    // nothing` não aborta a transação, então basta sortear outro.
    let inserted: { id: string; code: string; created_at: Date } | undefined;
    for (let attempt = 0; attempt < 8 && !inserted; attempt++) {
      const { rows } = await client.query(
        `insert into orders
           (code, customer_name, address, reference, delivery_date, delivery_start_hour,
            slot_label, payment, change_for_cents, total_cents)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         on conflict (code) do nothing
         returning id, code, created_at`,
        [
          `GC-${randomInt(1000, 10000)}`,
          parsed.customerName,
          parsed.address,
          parsed.reference || null,
          slot.date,
          slot.startHour,
          slotLabel,
          parsed.payment,
          parsed.changeForCents,
          totalCents,
        ],
      );
      inserted = rows[0];
    }
    if (!inserted) throw new Error("não foi possível gerar um código de pedido livre");

    for (const item of items) {
      await client.query(
        `insert into order_items (order_id, product_id, product_name, unit_price_cents, qty)
         values ($1, $2, $3, $4, $5)`,
        [inserted.id, item.productId, item.name, item.unitPriceCents, item.qty],
      );
    }

    await client.query("commit");

    return {
      ok: true,
      order: {
        code: inserted.code,
        lines: parsed.lines,
        totalCents,
        slotId: slot.id,
        slotLabel,
        payment: parsed.payment,
        customerName: parsed.customerName,
        address,
        changeForCents: parsed.changeForCents,
        placedAt: inserted.created_at.toISOString(),
      },
    };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    console.error("placeOrder: falha ao gravar o pedido", error);
    return { ok: false, reason: "unavailable" };
  } finally {
    client.release();
  }
}

/** Valida a forma e os limites da entrada. Qualquer desvio invalida o pedido inteiro. */
function parse(input: unknown): PlaceOrderInput | null {
  if (typeof input !== "object" || input === null) return null;
  const i = input as Record<string, unknown>;

  const customerName = text(i.customerName, 120);
  const address = text(i.address, 300);
  const reference = i.reference === undefined ? "" : text(i.reference, 200);
  if (customerName === null || customerName.length < 2) return null;
  if (address === null || address.length < 6) return null;
  if (reference === null) return null;

  if (typeof i.slotId !== "string" || i.slotId.length > 32) return null;
  if (!PAYMENTS.includes(i.payment as PaymentMethod)) return null;
  const payment = i.payment as PaymentMethod;

  if (!Array.isArray(i.lines) || i.lines.length === 0 || i.lines.length > 10) return null;
  const seen = new Set<string>();
  const lines: CartLine[] = [];
  for (const raw of i.lines as unknown[]) {
    if (typeof raw !== "object" || raw === null) return null;
    const { productId, qty } = raw as Record<string, unknown>;
    if (typeof productId !== "string" || !getProduct(productId) || seen.has(productId)) return null;
    if (!Number.isInteger(qty) || (qty as number) < 1 || (qty as number) > MAX_QTY) return null;
    seen.add(productId);
    lines.push({ productId, qty: qty as number });
  }

  let changeForCents: number | null = null;
  if (payment === "dinheiro" && i.changeForCents != null) {
    const c = i.changeForCents;
    if (!Number.isInteger(c) || (c as number) <= 0 || (c as number) > 1_000_000) return null;
    changeForCents = c as number;
  }

  return { lines, slotId: i.slotId, payment, customerName, address, reference, changeForCents };
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : null;
}
