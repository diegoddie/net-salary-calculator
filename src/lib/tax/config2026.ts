/**
 * Parametri fiscali - periodo d'imposta 2026.
 *
 * UNICA FONTE DI VERITÀ per aliquote, soglie e importi.
 * Nessun valore fiscale deve essere hardcoded altrove (engine, componenti, testi).
 */

export type Scaglione = {
  /** limite superiore dello scaglione in euro; null = nessun limite */
  limite: number | null;
  aliquota: number;
};

export const CONFIG_2026 = {
  anno: 2026,
  regione: "Lombardia",
  comune: "Milano",

  /**
   * Contributi INPS a carico del dipendente - FPLD.
   * Fonte: Circolare INPS n. 6 del 30 gennaio 2026.
   */
  inps: {
    aliquotaBase: 0.0919,
    /** prima fascia di retribuzione pensionabile 2026 */
    sogliaContributoAggiuntivo: 56224,
    aliquotaContributoAggiuntivo: 0.01,
  },

  /**
   * Scaglioni IRPEF 2026.
   * Fonte: Legge 30 dicembre 2025, n. 199 (Legge di Bilancio 2026),
   * che modifica l'art. 11 TUIR.
   */
  irpef: {
    scaglioni: [
      { limite: 28000, aliquota: 0.23 },
      { limite: 50000, aliquota: 0.33 },
      { limite: null, aliquota: 0.43 },
    ] as Scaglione[],
  },

  /**
   * Detrazione per lavoro dipendente.
   * Fonte: art. 13 TUIR (D.P.R. 917/1986), come modificato dal D.Lgs. 216/2023.
   */
  detrazioneLavoro: {
    soglia1: 15000,
    importoFisso: 1955,
    soglia2: 28000,
    base2: 1910,
    quota2: 1190,
    denominatore2: 13000,
    soglia3: 50000,
    base3: 1910,
    denominatore3: 22000,
    maggiorazione: {
      importo: 65,
      da: 25000,
      a: 35000,
    },
  },

  /**
   * Taglio del cuneo fiscale: somma esente + ulteriore detrazione.
   * Fonte: Legge 30 dicembre 2024, n. 207, art. 1, commi 4-9 (confermata per il 2026).
   */
  cuneo: {
    /** percentuale applicata all'INTERO reddito, non a scaglioni */
    sommaEsente: [
      { limite: 8500, aliquota: 0.071 },
      { limite: 15000, aliquota: 0.053 },
      { limite: 20000, aliquota: 0.048 },
    ] as Scaglione[],
    ulterioreDetrazione: {
      sogliaMin: 20000,
      importoPieno: 1000,
      sogliaPieno: 32000,
      sogliaMax: 40000,
      denominatoreDecalage: 8000,
    },
  },

  /**
   * Trattamento integrativo (ex "bonus 100 euro").
   * Fonte: D.L. 3/2020 e successive modifiche.
   */
  trattamentoIntegrativo: {
    importoMax: 1200,
    soglia1: 15000,
    correttivo: 75,
    soglia2: 28000,
  },

  /**
   * Addizionale regionale IRPEF Lombardia 2026.
   * Fonte: Regione Lombardia - addizionale regionale IRPEF e portale
   * addizionali IRPEF del Dipartimento delle Finanze (MEF).
   */
  addizionaleRegionale: {
    scaglioni: [
      { limite: 15000, aliquota: 0.0123 },
      { limite: 28000, aliquota: 0.0158 },
      { limite: 50000, aliquota: 0.0172 },
      { limite: null, aliquota: 0.0173 },
    ] as Scaglione[],
  },

  /**
   * Addizionale comunale IRPEF Milano 2026.
   * Fonte: Comune di Milano - addizionale comunale IRPEF.
   */
  addizionaleComunale: {
    aliquota: 0.008,
    /** se R <= soglia esenzione, addizionale = 0; oltre, si applica sull'intero imponibile */
    sogliaEsenzione: 23000,
  },

  limiti: {
    ralMax: 1000000,
  },
} as const;

export const FONTI = [
  {
    id: "irpef",
    testo:
      "Scaglioni IRPEF 2026: Legge 30 dicembre 2025, n. 199 (Legge di Bilancio 2026), che modifica l'art. 11 TUIR.",
  },
  {
    id: "detrazioni",
    testo:
      "Detrazioni lavoro dipendente: art. 13 TUIR (D.P.R. 917/1986), come modificato dal D.Lgs. 216/2023.",
  },
  {
    id: "cuneo",
    testo:
      "Taglio cuneo fiscale (somma esente e ulteriore detrazione): Legge 30 dicembre 2024, n. 207, art. 1, commi 4-9.",
  },
  {
    id: "trattamento",
    testo: "Trattamento integrativo: D.L. 3/2020 e successive modifiche.",
  },
  {
    id: "inps",
    testo:
      "Contributi INPS e soglia 1% aggiuntivo 2026: Circolare INPS n. 6 del 30 gennaio 2026.",
  },
  {
    id: "regionale",
    testo:
      "Addizionale regionale Lombardia: https://www.regione.lombardia.it/bollo-auto-e-tributi-regionali/red-addizionale-regionale-irpef e portale addizionali IRPEF del Dipartimento delle Finanze (MEF).",
  },
  {
    id: "comunale",
    testo:
      "Addizionale comunale Milano: https://www.comune.milano.it/argomenti/tributi/addizionale-comunale-irpef",
  },
] as const;
