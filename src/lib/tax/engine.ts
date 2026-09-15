/**
 * Motore di calcolo RAL -> Netto (2026).
 * Funzioni pure, deterministiche, senza dipendenze React e senza formattazione.
 * Tutti i parametri fiscali provengono da config2026.ts.
 */
import { CONFIG_2026, type Scaglione } from "./config2026";
import type {
  CalculationInput,
  CalculationResult,
  DettaglioScaglione,
} from "./types";

const C = CONFIG_2026;

function applicaScaglioni(
  base: number,
  scaglioni: Scaglione[],
): { totale: number; dettaglio: DettaglioScaglione[] } {
  let precedente = 0;
  let totale = 0;
  const dettaglio: DettaglioScaglione[] = [];

  for (const s of scaglioni) {
    const limite = s.limite ?? Infinity;
    const quota = Math.max(0, Math.min(base, limite) - precedente);
    const imposta = quota * s.aliquota;
    totale += imposta;
    dettaglio.push({
      da: precedente,
      a: s.limite,
      aliquota: s.aliquota,
      imponibileNelloScaglione: quota,
      imposta,
    });
    precedente = limite;
  }

  return { totale, dettaglio };
}

/** Step 1 — Contributi previdenziali INPS a carico del dipendente */
export function calcolaContributiINPS(ral: number) {
  const contributiBase = ral * C.inps.aliquotaBase;
  const contributoAggiuntivo =
    Math.max(0, ral - C.inps.sogliaContributoAggiuntivo) *
    C.inps.aliquotaContributoAggiuntivo;
  return {
    contributiBase,
    contributoAggiuntivo,
    contributiINPS: contributiBase + contributoAggiuntivo,
  };
}

/** Step 2 — Reddito imponibile IRPEF */
export function calcolaImponibile(ral: number, contributiINPS: number): number {
  return ral - contributiINPS;
}

/** Step 3 — IRPEF lorda (scaglioni progressivi) */
export function calcolaIrpefLorda(R: number) {
  const { totale, dettaglio } = applicaScaglioni(R, C.irpef.scaglioni);
  return { irpefLorda: totale, dettaglio };
}

/** Step 4 — Detrazione per lavoro dipendente (art. 13 TUIR) */
export function calcolaDetrazioneLavoro(R: number) {
  const d = C.detrazioneLavoro;
  let base: number;

  if (R <= d.soglia1) {
    base = d.importoFisso;
  } else if (R <= d.soglia2) {
    base = d.base2 + (d.quota2 * (d.soglia2 - R)) / d.denominatore2;
  } else if (R <= d.soglia3) {
    base = (d.base3 * (d.soglia3 - R)) / d.denominatore3;
  } else {
    base = 0;
  }

  const maggiorazione =
    R > d.maggiorazione.da && R <= d.maggiorazione.a
      ? d.maggiorazione.importo
      : 0;

  return { detrazioneLavoro: base + maggiorazione, maggiorazione };
}

/** Step 5a — Somma esente taglio cuneo (bonus non tassato) */
export function calcolaSommaEsente(R: number) {
  for (const s of C.cuneo.sommaEsente) {
    if (R <= (s.limite ?? Infinity)) {
      return { sommaEsenteCuneo: R * s.aliquota, aliquota: s.aliquota };
    }
  }
  return { sommaEsenteCuneo: 0, aliquota: 0 };
}

/** Step 5b — Ulteriore detrazione IRPEF taglio cuneo */
export function calcolaUlterioreDetrazioneCuneo(R: number): number {
  const u = C.cuneo.ulterioreDetrazione;
  if (R <= u.sogliaMin) return 0;
  if (R <= u.sogliaPieno) return u.importoPieno;
  if (R <= u.sogliaMax)
    return (u.importoPieno * (u.sogliaMax - R)) / u.denominatoreDecalage;
  return 0;
}

/** Step 6 — IRPEF netta */
export function calcolaIrpefNetta(
  irpefLorda: number,
  detrazioneLavoro: number,
  ulterioreDetrazioneCuneo: number,
): number {
  return Math.max(0, irpefLorda - detrazioneLavoro - ulterioreDetrazioneCuneo);
}

/** Step 7 — Trattamento integrativo */
export function calcolaTrattamentoIntegrativo(
  R: number,
  irpefLorda: number,
  detrazioneLavoro: number,
): number {
  const t = C.trattamentoIntegrativo;
  if (R <= t.soglia1) {
    return irpefLorda > detrazioneLavoro - t.correttivo ? t.importoMax : 0;
  }
  if (R <= t.soglia2) {
    return detrazioneLavoro > irpefLorda
      ? Math.min(t.importoMax, detrazioneLavoro - irpefLorda)
      : 0;
  }
  return 0;
}

/** Step 8 — Addizionale regionale Lombardia */
export function calcolaAddizionaleRegionale(R: number) {
  const { totale, dettaglio } = applicaScaglioni(
    R,
    C.addizionaleRegionale.scaglioni,
  );
  return { addizionaleRegionale: totale, dettaglio };
}

/** Step 9 — Addizionale comunale Milano */
export function calcolaAddizionaleComunale(R: number): number {
  if (R <= C.addizionaleComunale.sogliaEsenzione) return 0;
  return R * C.addizionaleComunale.aliquota;
}

/** Orchestrazione completa */
export function calculateNetSalary(
  input: CalculationInput,
): CalculationResult {
  const { ral, mensilita } = input;

  const { contributiBase, contributoAggiuntivo, contributiINPS } =
    calcolaContributiINPS(ral);
  const R = calcolaImponibile(ral, contributiINPS);
  const { irpefLorda, dettaglio: dettaglioIrpef } = calcolaIrpefLorda(R);
  const { detrazioneLavoro, maggiorazione } = calcolaDetrazioneLavoro(R);
  const { sommaEsenteCuneo, aliquota: aliquotaSommaEsente } =
    calcolaSommaEsente(R);
  const ulterioreDetrazioneCuneo = calcolaUlterioreDetrazioneCuneo(R);
  const irpefNetta = calcolaIrpefNetta(
    irpefLorda,
    detrazioneLavoro,
    ulterioreDetrazioneCuneo,
  );
  const trattamentoIntegrativo = calcolaTrattamentoIntegrativo(
    R,
    irpefLorda,
    detrazioneLavoro,
  );
  const { addizionaleRegionale, dettaglio: dettaglioAddizionaleRegionale } =
    calcolaAddizionaleRegionale(R);
  const addizionaleComunale = calcolaAddizionaleComunale(R);

  const totaleImposte = irpefNetta + addizionaleRegionale + addizionaleComunale;
  const totaleTrattenute = contributiINPS + totaleImposte;
  const bonusFiscali = sommaEsenteCuneo + trattamentoIntegrativo;
  const nettoDaRetribuzione = ral - totaleTrattenute;
  const nettoAnnuo = nettoDaRetribuzione + bonusFiscali;
  const nettoMensile = nettoAnnuo / mensilita;
  const aliquotaEffettiva = ((ral - nettoAnnuo) / ral) * 100;

  return {
    input,
    contributiBase,
    contributoAggiuntivo,
    contributiINPS,
    redditoImponibile: R,
    irpefLorda,
    dettaglioIrpef,
    detrazioneLavoro,
    maggiorazioneDetrazione: maggiorazione,
    sommaEsenteCuneo,
    aliquotaSommaEsente,
    ulterioreDetrazioneCuneo,
    irpefNetta,
    trattamentoIntegrativo,
    addizionaleRegionale,
    dettaglioAddizionaleRegionale,
    addizionaleComunale,
    totaleImposte,
    totaleTrattenute,
    bonusFiscali,
    nettoDaRetribuzione,
    nettoAnnuo,
    nettoMensile,
    aliquotaEffettiva,
  };
}
