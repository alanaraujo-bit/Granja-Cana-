export type Product = {
  id: string;
  /** Quantidade de ovos na bandeja. */
  units: number;
  /** Nome curto do nível, usado no card. A contagem já é dita pelo selo. */
  tier: string;
  name: string;
  shortName: string;
  priceCents: number;
  /** Frase curta de posicionamento — não é descrição de catálogo. */
  tagline: string;
  badge?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "duzia",
    units: 12,
    tier: "Dúzia caipira",
    name: "Bandeja com 12 ovos",
    shortName: "12 ovos",
    priceCents: 1300,
    tagline: "A dúzia de sempre, para a semana da casa.",
  },
  {
    id: "quinze",
    units: 15,
    tier: "Bandeja cheia",
    name: "Bandeja com 15 ovos",
    shortName: "15 ovos",
    priceCents: 1600,
    tagline: "Três ovos a mais pelo melhor custo por unidade.",
    badge: "Mais pedida",
  },
  {
    id: "trinta",
    units: 30,
    tier: "Cartela da casa",
    name: "Cartela com 30 ovos",
    shortName: "30 ovos",
    priceCents: 3000,
    tagline: "Para famílias grandes e quem cozinha todo dia.",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** Preço por ovo, em centavos fracionários — usado só para comparação. */
export function unitPriceCents(p: Product): number {
  return p.priceCents / p.units;
}

/** Economia contra a dúzia. Abaixo de R$ 1,00 não vale ser anunciada:
 *  um selo de "economia de R$ 0,25" enfraquece a oferta em vez de vendê-la. */
export function savingsVsDozen(p: Product): number {
  const dozen = PRODUCTS[0];
  const baseline = unitPriceCents(dozen) * p.units;
  const diff = Math.round(baseline - p.priceCents);
  return diff >= 100 ? diff : 0;
}
