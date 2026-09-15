/**
 * Helper di presentazione: trasformano un CalculationResult + config
 * nelle stringhe "formula con valori sostituiti" usate nella pagina /regole.
 * Nessun numero fiscale è scritto a mano qui.
 */
import { CONFIG_2026 as C } from "./config2026";
import { formatAliquota, formatEuro, formatInt, formatNumber } from "./format";
import type { CalculationResult } from "./types";

export type Step = {
  n: number;
  anchor: string;
  titolo: string;
  formula: string;
  valorizzata: string;
  risultato: string;
  nota?: string;
};

const n = formatNumber;
const i = formatInt;

export function buildSteps(r: CalculationResult): Step[] {
  const R = r.redditoImponibile;
  const ral = r.input.ral;
  const d = C.detrazioneLavoro;
  const u = C.cuneo.ulterioreDetrazione;
  const t = C.trattamentoIntegrativo;

  // Step 4 — ramo applicato
  let detrFormula: string;
  let detrValori: string;
  if (R <= d.soglia1) {
    detrFormula = `R ≤ ${i(d.soglia1)} → ${i(d.importoFisso)} €`;
    detrValori = `R = ${n(R)} ≤ ${i(d.soglia1)} → ${n(d.importoFisso)} €`;
  } else if (R <= d.soglia2) {
    detrFormula = `${i(d.base2)} + ${i(d.quota2)} × (${i(d.soglia2)} − R) / ${i(d.denominatore2)}`;
    detrValori = `${i(d.base2)} + ${i(d.quota2)} × (${i(d.soglia2)} − ${n(R)}) / ${i(d.denominatore2)}`;
  } else if (R <= d.soglia3) {
    detrFormula = `${i(d.base3)} × (${i(d.soglia3)} − R) / ${i(d.denominatore3)}`;
    detrValori = `${i(d.base3)} × (${i(d.soglia3)} − ${n(R)}) / ${i(d.denominatore3)}`;
  } else {
    detrFormula = `R > ${i(d.soglia3)} → 0 €`;
    detrValori = `R = ${n(R)} > ${i(d.soglia3)} → 0 €`;
  }
  if (r.maggiorazioneDetrazione > 0) {
    detrFormula += ` + ${i(d.maggiorazione.importo)}`;
    detrValori += ` + ${i(d.maggiorazione.importo)}`;
  }

  // Step 5a
  const esenteFormula =
    r.sommaEsenteCuneo > 0
      ? `R × ${formatAliquota(r.aliquotaSommaEsente, 1)}`
      : `spetta solo se R ≤ ${i(20000)}`;
  const esenteValori =
    r.sommaEsenteCuneo > 0
      ? `${n(R)} × ${formatAliquota(r.aliquotaSommaEsente, 1)}`
      : `Non spetta perché R = ${n(R)} € > ${i(C.cuneo.sommaEsente[2].limite ?? 0)} €`;

  // Step 5b
  let ulterioreValori: string;
  if (R <= u.sogliaMin) {
    ulterioreValori = `Non spetta perché R = ${n(R)} € ≤ ${i(u.sogliaMin)} €`;
  } else if (R <= u.sogliaPieno) {
    ulterioreValori = `${i(u.sogliaMin)} < ${n(R)} ≤ ${i(u.sogliaPieno)} → ${n(u.importoPieno)} €`;
  } else if (R <= u.sogliaMax) {
    ulterioreValori = `${i(u.importoPieno)} × (${i(u.sogliaMax)} − ${n(R)}) / ${i(u.denominatoreDecalage)}`;
  } else {
    ulterioreValori = `Non spetta perché R = ${n(R)} € > ${i(u.sogliaMax)} €`;
  }

  // Step 7
  let tiValori: string;
  if (R <= t.soglia1) {
    tiValori = `R = ${n(R)} ≤ ${i(t.soglia1)} e IRPEF lorda ${n(r.irpefLorda)} ${
      r.irpefLorda > r.detrazioneLavoro - t.correttivo ? ">" : "≤"
    } ${n(r.detrazioneLavoro)} − ${i(t.correttivo)}`;
  } else if (R <= t.soglia2) {
    tiValori =
      r.detrazioneLavoro > r.irpefLorda
        ? `min(${i(t.importoMax)}; ${n(r.detrazioneLavoro)} − ${n(r.irpefLorda)})`
        : `Non spetta perché la detrazione ${n(r.detrazioneLavoro)} € non supera l'IRPEF lorda ${n(r.irpefLorda)} €`;
  } else {
    tiValori = `Non spetta perché R = ${n(R)} € > ${i(t.soglia2)} €`;
  }

  // Step 9
  const comValori =
    r.addizionaleComunale > 0
      ? `${n(R)} × ${formatAliquota(C.addizionaleComunale.aliquota, 1)}`
      : `Non spetta perché R = ${n(R)} € ≤ ${i(C.addizionaleComunale.sogliaEsenzione)} € (soglia di esenzione)`;

  return [
    {
      n: 1,
      anchor: "contributi-inps",
      titolo: "Contributi previdenziali INPS",
      formula: `RAL × ${formatAliquota(C.inps.aliquotaBase)} + max(0; RAL − ${i(C.inps.sogliaContributoAggiuntivo)}) × ${formatAliquota(C.inps.aliquotaContributoAggiuntivo, 0)}`,
      valorizzata: `${n(ral)} × ${formatAliquota(C.inps.aliquotaBase)} + max(0; ${n(ral)} − ${i(C.inps.sogliaContributoAggiuntivo)}) × ${formatAliquota(C.inps.aliquotaContributoAggiuntivo, 0)} = ${n(r.contributiINPS)} €`,
      risultato: formatEuro(r.contributiINPS),
    },
    {
      n: 2,
      anchor: "imponibile",
      titolo: "Reddito imponibile IRPEF",
      formula: "R = RAL − contributi INPS",
      valorizzata: `${n(ral)} − ${n(r.contributiINPS)} = ${n(R)} €`,
      risultato: formatEuro(R),
    },
    {
      n: 3,
      anchor: "irpef-scaglioni",
      titolo: "IRPEF lorda (scaglioni progressivi)",
      formula: C.irpef.scaglioni
        .map(
          (s, idx) =>
            `${idx === 0 ? `fino a ${i(s.limite!)}` : s.limite ? `${i(C.irpef.scaglioni[idx - 1].limite!)}–${i(s.limite)}` : `oltre ${i(C.irpef.scaglioni[idx - 1].limite!)}`} → ${formatAliquota(s.aliquota, 0)}`,
        )
        .join("  ·  "),
      valorizzata: r.dettaglioIrpef
        .filter((s) => s.imponibileNelloScaglione > 0)
        .map(
          (s) =>
            `${n(s.imponibileNelloScaglione)} × ${formatAliquota(s.aliquota, 0)} = ${n(s.imposta)}`,
        )
        .join("  +  "),
      risultato: formatEuro(r.irpefLorda),
    },
    {
      n: 4,
      anchor: "detrazione-lavoro",
      titolo: "Detrazione per lavoro dipendente",
      formula: detrFormula,
      valorizzata: `${detrValori} = ${n(r.detrazioneLavoro)} €`,
      risultato: formatEuro(r.detrazioneLavoro),
      nota:
        r.maggiorazioneDetrazione > 0
          ? `Inclusa la maggiorazione di ${i(d.maggiorazione.importo)} € prevista per ${i(d.maggiorazione.da)} < R ≤ ${i(d.maggiorazione.a)}.`
          : undefined,
    },
    {
      n: 5,
      anchor: "taglio-cuneo",
      titolo: "Taglio del cuneo fiscale",
      formula: `Somma esente: ${esenteFormula}  ·  Ulteriore detrazione: ${i(u.importoPieno)} € se ${i(u.sogliaMin)} < R ≤ ${i(u.sogliaPieno)}, poi décalage fino a ${i(u.sogliaMax)}`,
      valorizzata: `Somma esente: ${esenteValori}${r.sommaEsenteCuneo > 0 ? ` = ${n(r.sommaEsenteCuneo)} €` : ""}\nUlteriore detrazione: ${ulterioreValori}${r.ulterioreDetrazioneCuneo > 0 ? ` = ${n(r.ulterioreDetrazioneCuneo)} €` : ""}`,
      risultato: `${formatEuro(r.sommaEsenteCuneo)} esenti · ${formatEuro(r.ulterioreDetrazioneCuneo)} di detrazione`,
    },
    {
      n: 6,
      anchor: "irpef-netta",
      titolo: "IRPEF netta",
      formula: "max(0; IRPEF lorda − detrazione lavoro − ulteriore detrazione)",
      valorizzata: `max(0; ${n(r.irpefLorda)} − ${n(r.detrazioneLavoro)} − ${n(r.ulterioreDetrazioneCuneo)}) = ${n(r.irpefNetta)} €`,
      risultato: formatEuro(r.irpefNetta),
      nota:
        r.irpefLorda - r.detrazioneLavoro - r.ulterioreDetrazioneCuneo < 0
          ? "Incapienza: la parte di detrazioni non utilizzata va persa, non viene rimborsata."
          : undefined,
    },
    {
      n: 7,
      anchor: "trattamento-integrativo",
      titolo: "Trattamento integrativo",
      formula: `max ${i(t.importoMax)} € se R ≤ ${i(t.soglia1)} e IRPEF lorda > detrazione − ${i(t.correttivo)}; se ${i(t.soglia1)} < R ≤ ${i(t.soglia2)} → min(${i(t.importoMax)}; detrazione − IRPEF lorda)`,
      valorizzata: `${tiValori}${r.trattamentoIntegrativo > 0 ? ` = ${n(r.trattamentoIntegrativo)} €` : ""}`,
      risultato: formatEuro(r.trattamentoIntegrativo),
    },
    {
      n: 8,
      anchor: "addizionale-regionale",
      titolo: `Addizionale regionale ${C.regione}`,
      formula: C.addizionaleRegionale.scaglioni
        .map(
          (s, idx) =>
            `${idx === 0 ? `fino a ${i(s.limite!)}` : s.limite ? `${i(C.addizionaleRegionale.scaglioni[idx - 1].limite!)}–${i(s.limite)}` : `oltre ${i(C.addizionaleRegionale.scaglioni[idx - 1].limite!)}`} → ${formatAliquota(s.aliquota)}`,
        )
        .join("  ·  "),
      valorizzata: r.dettaglioAddizionaleRegionale
        .filter((s) => s.imponibileNelloScaglione > 0)
        .map(
          (s) =>
            `${n(s.imponibileNelloScaglione)} × ${formatAliquota(s.aliquota)} = ${n(s.imposta)}`,
        )
        .join("  +  "),
      risultato: formatEuro(r.addizionaleRegionale),
    },
    {
      n: 9,
      anchor: "addizionale-comunale",
      titolo: `Addizionale comunale ${C.comune}`,
      formula: `R ≤ ${i(C.addizionaleComunale.sogliaEsenzione)} → 0; R > ${i(C.addizionaleComunale.sogliaEsenzione)} → R × ${formatAliquota(C.addizionaleComunale.aliquota, 1)} sull'intero imponibile`,
      valorizzata: `${comValori}${r.addizionaleComunale > 0 ? ` = ${n(r.addizionaleComunale)} €` : ""}`,
      risultato: formatEuro(r.addizionaleComunale),
    },
    {
      n: 10,
      anchor: "panoramica",
      titolo: "Dal lordo al netto",
      formula:
        "netto annuo = RAL − contributi − imposte + bonus fiscali;  netto mensile = netto annuo / mensilità",
      valorizzata: `${n(ral)} − ${n(r.contributiINPS)} − ${n(r.totaleImposte)} + ${n(r.bonusFiscali)} = ${n(r.nettoAnnuo)} €\n${n(r.nettoAnnuo)} / ${r.input.mensilita} = ${n(r.nettoMensile)} € al mese`,
      risultato: formatEuro(r.nettoAnnuo),
    },
  ];
}
