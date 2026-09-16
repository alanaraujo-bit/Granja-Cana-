const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Valores circulam em centavos inteiros; float só aparece na formatação. */
export function formatBRL(cents: number): string {
  return BRL.format(cents / 100);
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}
