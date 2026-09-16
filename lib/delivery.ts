/**
 * Janela de operação da Granja Canaã: terça a domingo, 08h às 16h.
 * As faixas são calculadas a partir do horário real — nunca listadas fixas —
 * para que o cliente jamais veja um horário que já passou.
 */

export const OPEN_WEEKDAYS = [2, 3, 4, 5, 6, 0] as const; // ter..dom (0 = domingo)

/** Canaã dos Carajás (PA): UTC−3, sem horário de verão. */
export const GRANJA_TIME_ZONE = "America/Belem";

const WALL_CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: GRANJA_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});

/**
 * O relógio da granja, em qualquer máquina. Devolve um Date cujos getters
 * locais (getHours, getDay…) leem o horário de Canaã — o servidor da Vercel
 * roda em UTC, e um celular pode estar em outro fuso. Todas as regras deste
 * arquivo trabalham com getters locais, então basta passar este valor.
 */
export function granjaNow(at: Date = new Date()): Date {
  const p = Object.fromEntries(
    WALL_CLOCK.formatToParts(at).map((part) => [part.type, Number(part.value)]),
  );
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

export type Band = { startHour: number; endHour: number };

export const BANDS: Band[] = [
  { startHour: 8, endHour: 10 },
  { startHour: 10, endHour: 12 },
  { startHour: 12, endHour: 14 },
  { startHour: 14, endHour: 16 },
];

export type DeliverySlot = {
  id: string;
  /** Data local no formato AAAA-MM-DD. */
  date: string;
  dayLabel: string;
  dateLabel: string;
  timeLabel: string;
  startHour: number;
  isToday: boolean;
};

export type DeliveryDay = {
  date: string;
  dayLabel: string;
  dateLabel: string;
  isToday: boolean;
  slots: DeliverySlot[];
};

const WEEKDAY_LONG = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const MONTH_SHORT = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function isOpenDay(d: Date): boolean {
  return (OPEN_WEEKDAYS as readonly number[]).includes(d.getDay());
}

function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatBand(b: Band): string {
  return `${String(b.startHour).padStart(2, "0")}h às ${String(b.endHour).padStart(2, "0")}h`;
}

/**
 * Faixas disponíveis a partir de `now`, agrupadas por dia.
 * Uma faixa do dia corrente some assim que seu horário de início passa — é a
 * regra mais previsível para o cliente e para a operação.
 */
export function getAvailableDays(now: Date = new Date(), maxDays = 5): DeliveryDay[] {
  const days: DeliveryDay[] = [];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; days.length < maxDays && offset < 14; offset++) {
    const date = addDays(today, offset);
    if (!isOpenDay(date)) continue;

    const isToday = offset === 0;
    const bands = isToday
      ? BANDS.filter((b) => now.getHours() < b.startHour)
      : BANDS;

    if (bands.length === 0) continue;

    const iso = toISODate(date);
    const dayLabel = isToday
      ? "Hoje"
      : offset === 1
        ? "Amanhã"
        : WEEKDAY_LONG[date.getDay()].replace("-feira", "");
    const dateLabel = `${date.getDate()} de ${MONTH_SHORT[date.getMonth()]}`;

    days.push({
      date: iso,
      dayLabel,
      dateLabel,
      isToday,
      slots: bands.map((b) => ({
        id: `${iso}#${b.startHour}`,
        date: iso,
        dayLabel,
        dateLabel,
        timeLabel: formatBand(b),
        startHour: b.startHour,
        isToday,
      })),
    });
  }

  return days;
}

/** Faixa ainda oferecida em `now`. Um id de faixa expirada ou forjado não é encontrado. */
export function findSlot(id: string, now: Date): DeliverySlot | undefined {
  for (const day of getAvailableDays(now)) {
    const slot = day.slots.find((s) => s.id === id);
    if (slot) return slot;
  }
  return undefined;
}

/** Texto curto de status para a Home: aberto agora ou próxima abertura. */
export function getOpenStatus(now: Date = new Date()): { open: boolean; label: string } {
  const hour = now.getHours();
  const openToday = isOpenDay(now);

  if (openToday && hour >= 8 && hour < 16) {
    return { open: true, label: "Entregando agora · até 16h" };
  }

  const next = getAvailableDays(now, 1)[0];
  if (!next) return { open: false, label: "Terça a domingo, 08h às 16h" };

  const when = next.isToday
    ? `hoje a partir das ${String(next.slots[0].startHour).padStart(2, "0")}h`
    : next.dayLabel === "Amanhã"
      ? "amanhã às 08h"
      : `${next.dayLabel.toLowerCase()} às 08h`;

  return { open: false, label: `Fechado · entregas ${when}` };
}
