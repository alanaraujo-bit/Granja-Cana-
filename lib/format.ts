const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Valores circulam em centavos inteiros; float só aparece na formatação. */
export function formatBRL(cents: number): string {
  return BRL.format(cents / 100);
}

/** "R$ 13,00" -> "13,00", para composições com o cifrão em tamanho menor. */
export function splitBRL(cents: number): { symbol: string; amount: string } {
  return { symbol: "R$", amount: BRL.format(cents / 100).replace(/^R\$\s*/, "") };
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}
