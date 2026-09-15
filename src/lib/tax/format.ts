const currency = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integer = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });

/** € 1.234,56 */
export function formatEuro(value: number): string {
  return currency.format(value);
}

/** 1.234,56 (senza simbolo) */
export function formatNumber(value: number): string {
  return decimal.format(value);
}

/** 1.234 */
export function formatInt(value: number): string {
  return integer.format(value);
}

/** 25,6% */
export function formatPercent(value: number, decimals = 2): string {
  return (
    new Intl.NumberFormat("it-IT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value) + "%"
  );
}

/** 9,19% da 0.0919 */
export function formatAliquota(value: number, decimals = 2): string {
  return formatPercent(value * 100, decimals);
}

/** parsing di un input italiano "35.000,50" -> 35000.5 */
export function parseItalianNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s|€/g, "").replace(/\./g, "").replace(",", ".");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** formatta mentre si digita, con separatore migliaia italiano */
export function formatThousandsInput(raw: string): string {
  const onlyDigits = raw.replace(/[^\d]/g, "");
  if (onlyDigits === "") return "";
  return integer.format(Number(onlyDigits));
}
