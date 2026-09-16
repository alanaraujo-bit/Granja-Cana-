"use client";

import { useSyncExternalStore } from "react";
import { granjaNow } from "./delivery";

/**
 * A hora atual é estado do cliente: calculá-la na renderização do servidor
 * produziria saudação, status e faixas de entrega errados, além de divergência
 * de hidratação. Este hook devolve `null` no servidor e no primeiro render, e
 * a hora real logo em seguida — cabe a quem chama reservar o espaço do texto
 * que ainda não chegou.
 */
export function useClientNow(): Date | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * A hora não é um sistema externo que emite eventos, então não há o que
 * assinar: o valor muda por envelhecimento, não por notificação.
 */
function subscribe(): () => void {
  return () => {};
}

// `getSnapshot` precisa devolver a mesma referência enquanto nada mudar, senão
// o React entra em laço de renderização. O valor é reaproveitado por um minuto,
// o que também evita que um aplicativo aberto por horas congele no passado.
const FRESHNESS_MS = 60_000;
let cached: { at: number; value: Date } | null = null;

function getSnapshot(): Date {
  const t = Date.now();
  // No relógio da granja, e não no do aparelho: as faixas oferecidas aqui
  // precisam ser as mesmas que o servidor aceita.
  if (!cached || t - cached.at > FRESHNESS_MS) cached = { at: t, value: granjaNow(new Date(t)) };
  return cached.value;
}

function getServerSnapshot(): null {
  return null;
}
