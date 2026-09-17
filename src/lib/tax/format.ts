// Formattazione italiana deterministica (niente Intl: l'ICU del runtime server
// può differire da quello del browser e causare mismatch di hydration).

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatFixed(value: number, decimals: number): string {
  const negative = value < 0 || Object.is(value, -0);
  const abs = Math.abs(value);
  const fixed = abs.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const out = groupThousands(intPart) + (decPart ? "," + decPart : "");
  return (negative && Number(fixed) !== 0 ? "-" : "") + out;
}

/** 1.234,56 € */
export function formatEuro(value: number): string {
  return formatFixed(value, 2) + "\u00A0€";
}

/** 1.234,56 (senza simbolo) */
export function formatNumber(value: number): string {
  return formatFixed(value, 2);
}

/** 1.234 */
export function formatInt(value: number): string {
  return formatFixed(value, 0);
}

/** 25,6% */
export function formatPercent(value: number, decimals = 2): string {
  return formatFixed(value, decimals) + "%";
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
  return formatInt(Number(onlyDigits));
}

