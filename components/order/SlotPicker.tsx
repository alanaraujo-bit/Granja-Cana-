"use client";

import type { DeliveryDay } from "@/lib/delivery";

export function SlotPicker({
  days,
  activeDate,
  onDateChange,
  value,
  onChange,
}: {
  days: DeliveryDay[];
  activeDate: string | null;
  onDateChange: (date: string) => void;
  value: string | null;
  onChange: (slotId: string) => void;
}) {
  const day = days.find((d) => d.date === activeDate) ?? days[0];
  if (!day) return null;

  return (
    <div>
      {/* Faixa de dias: rolagem horizontal é o padrão nativo aqui, e é a única
          rolagem interna do aplicativo — deliberada, não acidental. */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1" style={{ scrollSnapType: "x proximity" }}>
        <div className="flex w-max gap-2">
          {days.map((d) => {
            const selected = d.date === day.date;
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => onDateChange(d.date)}
                aria-pressed={selected}
                style={{ scrollSnapAlign: "start" }}
                className={`tap flex h-[3.4rem] min-w-[5.5rem] flex-col items-center justify-center rounded-control border px-3
                  ${
                    selected
                      ? "border-canaa-700 bg-canaa-700 text-canaa-50 shadow-raised"
                      : "border-line-strong bg-surface text-ink active:bg-surface-sunken"
                  }`}
              >
                <span className="text-[13.5px] font-bold leading-tight">{d.dayLabel}</span>
                <span
                  className={`nums text-[11.5px] leading-tight ${
                    selected ? "text-canaa-200" : "text-ink-subtle"
                  }`}
                >
                  {d.dateLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="radiogroup" aria-label="Faixa de horário" className="mt-2.5 grid grid-cols-2 gap-2">
        {day.slots.map((slot) => {
          const selected = value === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(slot.id)}
              className={`tap flex h-[3.1rem] items-center justify-center gap-2 rounded-control border text-[14px] font-semibold
                ${
                  selected
                    ? "border-canaa-600 bg-canaa-50 text-canaa-800 shadow-raised"
                    : "border-line-strong bg-surface text-ink active:bg-surface-sunken"
                }`}
            >
              <span className="nums">{slot.timeLabel}</span>
              {selected && (
                <svg viewBox="0 0 24 24" className="size-[17px] shrink-0 text-canaa-600" aria-hidden>
                  <path
                    d="m5 12.5 4.5 4.5L19 7.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
