/**
 * Único ponto de troca da identidade. Quando a logomarca oficial chegar,
 * basta substituir o conteúdo deste componente por um <Image>: nenhuma outra
 * tela referencia a marca diretamente.
 */
export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scale = {
    sm: { mark: "size-7", name: "text-[15px]", sub: "text-[9px] tracking-[0.18em]" },
    md: { mark: "size-9", name: "text-[19px]", sub: "text-[10px] tracking-[0.2em]" },
    lg: { mark: "size-11", name: "text-[23px]", sub: "text-[11px] tracking-[0.2em]" },
  }[size];

  return (
    <div className="flex items-center gap-2.5">
      <EggMark className={scale.mark} />
      <div className="leading-none">
        <div className={`font-display font-semibold text-canaa-50 ${scale.name}`}>
          Granja Canaã
        </div>
        <div className={`mt-1 font-semibold uppercase text-canaa-300 ${scale.sub}`}>
          Ovos caipiras
        </div>
      </div>
    </div>
  );
}

export function EggMark({
  className = "size-9",
  outline = false,
}: {
  className?: string;
  /** Contorno em currentColor: legível sobre superfícies claras, onde a
   *  casca creme desaparece. */
  outline?: boolean;
}) {
  if (outline) {
    return (
      <svg viewBox="0 0 512 512" className={className} aria-hidden focusable="false">
        <path
          d="M256 112c74 0 118 118 118 184 0 66-53 108-118 108s-118-42-118-108c0-66 44-184 118-184z"
          fill="none"
          stroke="currentColor"
          strokeWidth="28"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden focusable="false">
      <defs>
        <radialGradient id="wm-shell" cx="0.36" cy="0.28" r="0.92">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset="0.48" stopColor="#f8f0de" />
          <stop offset="0.82" stopColor="#eed9ad" />
          <stop offset="1" stopColor="#e2bb77" />
        </radialGradient>
      </defs>
      <path
        d="M256 112c74 0 118 118 118 184 0 66-53 108-118 108s-118-42-118-108c0-66 44-184 118-184z"
        fill="url(#wm-shell)"
      />
    </svg>
  );
}
