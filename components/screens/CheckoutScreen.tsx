"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { OrderTotals } from "@/components/order/OrderTotals";
import { SlotPicker } from "@/components/order/SlotPicker";
import { PaymentPicker } from "@/components/order/PaymentPicker";
import {
  cartCount,
  cartTotalCents,
  generateOrderCode,
  useCart,
  useCartHydrated,
  type PaymentMethod,
} from "@/lib/cart-store";
import { getAvailableDays } from "@/lib/delivery";
import { useClientNow } from "@/lib/use-client-now";

type Errors = Partial<Record<"name" | "address" | "slot" | "payment", string>>;

export function CheckoutScreen() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const completeOrder = useCart((s) => s.completeOrder);

  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [changeFor, setChangeFor] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  // Finalizar o pedido esvazia o carrinho. Sem esta trava, a regra de
  // "carrinho vazio" dispararia no mesmo instante e mandaria o cliente de
  // volta para o resumo em vez da confirmação.
  const [placed, setPlaced] = useState(false);

  // As faixas dependem da hora atual, que só existe no cliente — por isso são
  // derivadas, e não guardadas em estado por um efeito.
  const now = useClientNow();
  const days = useMemo(() => (now ? getAvailableDays(now) : null), [now]);
  // Sem escolha explícita, o primeiro dia disponível já vem aberto.
  const activeDate = pickedDate ?? days?.[0]?.date ?? null;

  const count = cartCount(lines);
  const hydrated = useCartHydrated();

  // Carrinho vazio aqui só acontece por link direto ou volta do navegador — e
  // só pode ser avaliado depois da hidratação.
  useEffect(() => {
    if (hydrated && count === 0 && !placed) router.replace("/pedido");
  }, [hydrated, count, placed, router]);

  const slot = useMemo(
    () => days?.flatMap((d) => d.slots).find((s) => s.id === slotId) ?? null,
    [days, slotId],
  );

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Informe o nome de quem vai receber.";
    if (address.trim().length < 6) next.address = "Informe rua, número e bairro.";
    if (!slotId) next.slot = "Escolha um horário de entrega.";
    if (!payment) next.payment = "Escolha a forma de pagamento.";
    return next;
  }

  async function handleSubmit() {
    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // O anexo é recalculado no próximo quadro, já com os erros aplicados.
      requestAnimationFrame(() => {
        const anchor = document.querySelector<HTMLElement>("[data-error-anchor]");
        anchor?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setSubmitting(true);
    setPlaced(true);
    // Único estado assíncrono honesto do fluxo: o envio do pedido. O restante
    // dos dados é local, e exibir "carregando" sobre eles seria encenação.
    await new Promise((r) => setTimeout(r, 900));

    completeOrder({
      code: generateOrderCode(),
      lines,
      totalCents: cartTotalCents(lines),
      slotId: slotId!,
      slotLabel: slot ? `${slot.dayLabel}, ${slot.dateLabel} · ${slot.timeLabel}` : "",
      payment: payment!,
      customerName: name.trim(),
      address: [address.trim(), reference.trim()].filter(Boolean).join(" · "),
      changeForCents: parseChange(changeFor),
      placedAt: new Date().toISOString(),
    });

    router.replace("/confirmacao");
  }

  if (count === 0 && !placed) return null;

  const anchor = errors.name
    ? "name"
    : errors.address
      ? "address"
      : errors.slot
        ? "slot"
        : errors.payment
          ? "payment"
          : null;

  return (
    <>
      <ScreenHeader title="Entrega e pagamento" step="Passo 2 de 2" />

      <main className="px-4 pt-5">
        <Section title="Quem vai receber">
          <div data-error-anchor={anchor === "name" ? "" : undefined}>
            <Field
              label="Nome"
              value={name}
              onChange={(v) => {
                setName(v);
                if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
              }}
              placeholder="Como devemos chamar você"
              autoComplete="name"
              error={errors.name ?? null}
            />
          </div>

          <div data-error-anchor={anchor === "address" ? "" : undefined}>
            <Field
              label="Endereço de entrega"
              value={address}
              onChange={(v) => {
                setAddress(v);
                if (errors.address) setErrors((e) => ({ ...e, address: undefined }));
              }}
              placeholder="Rua, número e bairro"
              autoComplete="street-address"
              multiline
              error={errors.address ?? null}
              hint="Entregamos em Canaã dos Carajás."
            />
          </div>

          <Field
            label="Ponto de referência"
            value={reference}
            onChange={setReference}
            placeholder="Opcional — ajuda a achar mais rápido"
          />
        </Section>

        <Section title="Quando entregar">
          <div data-error-anchor={anchor === "slot" ? "" : undefined}>
            {days === null ? (
              <SlotSkeleton />
            ) : days.length === 0 ? (
              <ClosedNote />
            ) : (
              <SlotPicker
                days={days}
                activeDate={activeDate}
                onDateChange={(d) => {
                  setPickedDate(d);
                  setSlotId(null);
                }}
                value={slotId}
                onChange={(id) => {
                  setSlotId(id);
                  setErrors((e) => ({ ...e, slot: undefined }));
                }}
              />
            )}
            <ErrorLine message={errors.slot} />
          </div>
        </Section>

        <Section title="Como pagar">
          <div data-error-anchor={anchor === "payment" ? "" : undefined}>
            <PaymentPicker
              value={payment}
              onChange={(m) => {
                setPayment(m);
                setErrors((e) => ({ ...e, payment: undefined }));
              }}
            />
            <ErrorLine message={errors.payment} />
          </div>

          {payment === "dinheiro" && (
            <div className="animate-rise mt-1">
              <Field
                label="Precisa de troco para quanto?"
                value={changeFor}
                onChange={setChangeFor}
                placeholder="Opcional — ex.: 50"
                inputMode="numeric"
              />
            </div>
          )}
        </Section>

        <Section title="Resumo">
          <OrderTotals lines={lines} compact />
        </Section>

        <div className="pad-safe-b h-[6.5rem]" />
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <div className="pointer-events-auto w-full max-w-[30rem] bg-canvas px-4 pt-3 shadow-bar">
          <Button size="lg" full loading={submitting} onClick={handleSubmit}>
            Finalizar pedido
          </Button>
          <div className="pad-safe-b h-3" />
        </div>
      </div>
    </>
  );
}

/** "50", "50,00" ou "R$ 50" -> centavos. Campo livre, entrada tolerante. */
function parseChange(raw: string): number | null {
  const digits = raw.replace(/[^\d,.]/g, "").replace(",", ".");
  if (!digits) return null;
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2.5 px-1 font-display text-[16px] font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function ErrorLine({ message }: { message?: string }) {
  return (
    <div className="min-h-[1.15rem] px-1 pt-1">
      {message && (
        <p role="alert" className="animate-fade-in text-[12px] font-medium text-critical">
          {message}
        </p>
      )}
    </div>
  );
}

function SlotSkeleton() {
  return (
    <div aria-hidden>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <Shimmer key={i} className="h-[3.4rem] w-[5.5rem] rounded-control" />
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-[3.1rem] rounded-control" />
        ))}
      </div>
    </div>
  );
}

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-surface-sunken ${className}`}>
      <div
        className="animate-sweep absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
        }}
      />
    </div>
  );
}

function ClosedNote() {
  return (
    <div className="rounded-card border border-line bg-surface p-4 text-[13.5px] leading-relaxed text-ink-muted">
      Não há faixas disponíveis no momento. As entregas acontecem de terça a domingo, das 08h às 16h.
    </div>
  );
}
