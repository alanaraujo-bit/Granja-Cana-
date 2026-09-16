import { cartEggCount, cartTotalCents, type CartLine } from "@/lib/cart-store";
import { formatBRL } from "@/lib/format";

/**
 * Resumo de valores. A entrega aparece explicitamente como inclusa — um campo
 * de frete vazio levanta dúvida justamente na hora de fechar o pedido.
 */
export function OrderTotals({ lines, compact = false }: { lines: CartLine[]; compact?: boolean }) {
  const subtotal = cartTotalCents(lines);
  const eggs = cartEggCount(lines);

  return (
    <div className={`rounded-card border border-line bg-surface ${compact ? "p-3.5" : "p-4"}`}>
      <Row label={`Subtotal · ${eggs} ovos`} value={formatBRL(subtotal)} />
      <Row label="Entrega em Canaã dos Carajás" value="Inclusa" accent />
      <div className="my-3 h-px bg-line" />
      <div className="flex items-baseline justify-between">
        <span className="font-display text-[16px] font-semibold text-ink">Total</span>
        <span className="nums font-display text-[22px] font-bold text-canaa-700">
          {formatBRL(subtotal)}
        </span>
      </div>
    </div>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-[13.5px] text-ink-muted">{label}</span>
      <span
        className={`nums shrink-0 text-[13.5px] font-semibold ${
          accent ? "text-positive" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
