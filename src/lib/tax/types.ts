export type Mensilita = 13 | 14;

export type CalculationInput = {
  /** euro/anno, > 0 */
  ral: number;
  mensilita: Mensilita;
};

export type DettaglioScaglione = {
  da: number;
  a: number | null;
  aliquota: number;
  imponibileNelloScaglione: number;
  imposta: number;
};

export type CalculationResult = {
  input: CalculationInput;

  // Step 1
  contributiBase: number;
  contributoAggiuntivo: number;
  contributiINPS: number;

  // Step 2
  redditoImponibile: number;

  // Step 3
  irpefLorda: number;
  dettaglioIrpef: DettaglioScaglione[];

  // Step 4
  detrazioneLavoro: number;
  maggiorazioneDetrazione: number;

  // Step 5
  sommaEsenteCuneo: number;
  aliquotaSommaEsente: number;
  ulterioreDetrazioneCuneo: number;

  // Step 6
  irpefNetta: number;

  // Step 7
  trattamentoIntegrativo: number;

  // Step 8
  addizionaleRegionale: number;
  dettaglioAddizionaleRegionale: DettaglioScaglione[];

  // Step 9
  addizionaleComunale: number;

  // Step 10
  totaleImposte: number;
  totaleTrattenute: number;
  bonusFiscali: number;
  nettoDaRetribuzione: number;
  nettoAnnuo: number;
  nettoMensile: number;
  /** in percentuale (es. 25.6) */
  aliquotaEffettiva: number;
};
