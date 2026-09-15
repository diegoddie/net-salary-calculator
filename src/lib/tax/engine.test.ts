import { describe, expect, it } from "vitest";
import { CONFIG_2026 } from "./config2026";
import {
  calcolaAddizionaleComunale,
  calcolaDetrazioneLavoro,
  calcolaSommaEsente,
  calcolaTrattamentoIntegrativo,
  calcolaUlterioreDetrazioneCuneo,
  calcolaContributiINPS,
  calculateNetSalary,
} from "./engine";

const T = 0.05;

type Atteso = {
  ral: number;
  inps: number;
  imponibile: number;
  irpefLorda: number;
  detrazioneLavoro: number;
  ulterioreDetrazione: number;
  irpefNetta: number;
  addReg: number;
  addCom: number;
  sommaEsente: number;
  trattIntegr: number;
  nettoAnnuo: number;
  nettoMensile: number;
};

const casi: Atteso[] = [
  {
    ral: 14000,
    inps: 1286.6,
    imponibile: 12713.4,
    irpefLorda: 2924.08,
    detrazioneLavoro: 1955,
    ulterioreDetrazione: 0,
    irpefNetta: 969.08,
    addReg: 156.37,
    addCom: 0,
    sommaEsente: 673.81,
    trattIntegr: 1200,
    nettoAnnuo: 13461.75,
    nettoMensile: 1035.52,
  },
  {
    ral: 20000,
    inps: 1838,
    imponibile: 18162,
    irpefLorda: 4177.26,
    detrazioneLavoro: 2810.56,
    ulterioreDetrazione: 0,
    irpefNetta: 1366.7,
    addReg: 234.46,
    addCom: 0,
    sommaEsente: 871.78,
    trattIntegr: 0,
    nettoAnnuo: 17432.61,
    nettoMensile: 1340.97,
  },
  {
    ral: 28000,
    inps: 2573.2,
    imponibile: 25426.8,
    irpefLorda: 5848.16,
    detrazioneLavoro: 2210.55,
    ulterioreDetrazione: 1000,
    irpefNetta: 2637.62,
    addReg: 349.24,
    addCom: 203.41,
    sommaEsente: 0,
    trattIntegr: 0,
    nettoAnnuo: 22236.52,
    nettoMensile: 1710.5,
  },
  {
    ral: 35000,
    inps: 3216.5,
    imponibile: 31783.5,
    irpefLorda: 7688.56,
    detrazioneLavoro: 1646.52,
    ulterioreDetrazione: 1000,
    irpefNetta: 5042.03,
    addReg: 454.98,
    addCom: 254.27,
    sommaEsente: 0,
    trattIntegr: 0,
    nettoAnnuo: 26032.22,
    nettoMensile: 2002.48,
  },
  {
    ral: 45000,
    inps: 4135.5,
    imponibile: 40864.5,
    irpefLorda: 10685.28,
    detrazioneLavoro: 793.13,
    ulterioreDetrazione: 0,
    irpefNetta: 9892.16,
    addReg: 611.17,
    addCom: 326.92,
    sommaEsente: 0,
    trattIntegr: 0,
    nettoAnnuo: 30034.26,
    nettoMensile: 2310.33,
  },
  {
    ral: 60000,
    inps: 5551.76,
    imponibile: 54448.24,
    irpefLorda: 15612.74,
    detrazioneLavoro: 0,
    ulterioreDetrazione: 0,
    irpefNetta: 15612.74,
    addReg: 845.25,
    addCom: 435.59,
    sommaEsente: 0,
    trattIntegr: 0,
    nettoAnnuo: 37554.66,
    nettoMensile: 2888.82,
  },
];

describe("calculateNetSalary - casi con valori attesi (13 mensilità)", () => {
  for (const c of casi) {
    it(`RAL ${c.ral}`, () => {
      const r = calculateNetSalary({ ral: c.ral, mensilita: 13 });
      expect(r.contributiINPS).toBeCloseTo(c.inps, 1);
      expect(Math.abs(r.contributiINPS - c.inps)).toBeLessThanOrEqual(T);
      expect(Math.abs(r.redditoImponibile - c.imponibile)).toBeLessThanOrEqual(T);
      expect(Math.abs(r.irpefLorda - c.irpefLorda)).toBeLessThanOrEqual(T);
      expect(
        Math.abs(r.detrazioneLavoro - c.detrazioneLavoro),
      ).toBeLessThanOrEqual(T);
      expect(
        Math.abs(r.ulterioreDetrazioneCuneo - c.ulterioreDetrazione),
      ).toBeLessThanOrEqual(T);
      expect(Math.abs(r.irpefNetta - c.irpefNetta)).toBeLessThanOrEqual(T);
      expect(Math.abs(r.addizionaleRegionale - c.addReg)).toBeLessThanOrEqual(T);
      expect(Math.abs(r.addizionaleComunale - c.addCom)).toBeLessThanOrEqual(T);
      expect(Math.abs(r.sommaEsenteCuneo - c.sommaEsente)).toBeLessThanOrEqual(T);
      expect(
        Math.abs(r.trattamentoIntegrativo - c.trattIntegr),
      ).toBeLessThanOrEqual(T);
      expect(Math.abs(r.nettoAnnuo - c.nettoAnnuo)).toBeLessThanOrEqual(T);
      expect(Math.abs(r.nettoMensile - c.nettoMensile)).toBeLessThanOrEqual(T);
    });
  }
});

describe("invarianti", () => {
  for (const c of casi) {
    it(`RAL ${c.ral}`, () => {
      const r = calculateNetSalary({ ral: c.ral, mensilita: 13 });
      expect(
        r.input.ral -
          r.contributiINPS -
          r.totaleImposte +
          r.bonusFiscali -
          r.nettoAnnuo,
      ).toBeCloseTo(0, 6);
      expect(
        r.nettoDaRetribuzione +
          r.contributiINPS +
          r.irpefNetta +
          r.addizionaleRegionale +
          r.addizionaleComunale -
          r.input.ral,
      ).toBeCloseTo(0, 6);
      expect(r.nettoMensile * 13).toBeCloseTo(r.nettoAnnuo, 6);
      for (const v of Object.values(r)) {
        if (typeof v === "number") expect(v).toBeGreaterThanOrEqual(0);
      }
    });
  }

  it("mensilità 14", () => {
    const r = calculateNetSalary({ ral: 35000, mensilita: 14 });
    expect(r.nettoMensile * 14).toBeCloseTo(r.nettoAnnuo, 6);
  });
});

describe("confini - detrazione lavoro dipendente", () => {
  it("R = 15.000 usa l'importo fisso (condizione <=)", () => {
    expect(calcolaDetrazioneLavoro(15000).detrazioneLavoro).toBeCloseTo(1955, 6);
  });
  it("R poco sopra 15.000 passa alla seconda formula", () => {
    expect(calcolaDetrazioneLavoro(15000.01).detrazioneLavoro).toBeCloseTo(
      1910 + (1190 * (28000 - 15000.01)) / 13000,
      6,
    );
  });

  it("R = 25.000 non ha maggiorazione (condizione >)", () => {
    expect(calcolaDetrazioneLavoro(25000).maggiorazione).toBe(0);
  });
  it("R = 25.000,01 ha maggiorazione 65", () => {
    expect(calcolaDetrazioneLavoro(25000.01).maggiorazione).toBe(65);
  });
  it("R = 35.000 ha ancora maggiorazione (condizione <=)", () => {
    expect(calcolaDetrazioneLavoro(35000).maggiorazione).toBe(65);
  });
  it("R = 35.000,01 non ha maggiorazione", () => {
    expect(calcolaDetrazioneLavoro(35000.01).maggiorazione).toBe(0);
  });
  it("R = 28.000", () => {
    expect(calcolaDetrazioneLavoro(28000).detrazioneLavoro).toBeCloseTo(
      1910 + 65,
      6,
    );
  });
  it("R = 50.000 -> 0 + nessuna maggiorazione", () => {
    expect(calcolaDetrazioneLavoro(50000).detrazioneLavoro).toBeCloseTo(0, 6);
  });
  it("R > 50.000 -> 0", () => {
    expect(calcolaDetrazioneLavoro(50000.01).detrazioneLavoro).toBe(0);
  });
});

describe("confini - somma esente cuneo", () => {
  it("R = 8.500 al 7,1%", () => {
    expect(calcolaSommaEsente(8500).sommaEsenteCuneo).toBeCloseTo(8500 * 0.071, 6);
  });
  it("R = 8.500,01 al 5,3%", () => {
    expect(calcolaSommaEsente(8500.01).aliquota).toBe(0.053);
  });
  it("R = 15.000 al 5,3%", () => {
    expect(calcolaSommaEsente(15000).aliquota).toBe(0.053);
  });
  it("R = 15.000,01 al 4,8%", () => {
    expect(calcolaSommaEsente(15000.01).aliquota).toBe(0.048);
  });
  it("R = 20.000 spetta ancora", () => {
    expect(calcolaSommaEsente(20000).sommaEsenteCuneo).toBeCloseTo(20000 * 0.048, 6);
  });
  it("R = 20.000,01 non spetta", () => {
    expect(calcolaSommaEsente(20000.01).sommaEsenteCuneo).toBe(0);
  });
});

describe("confini - ulteriore detrazione cuneo", () => {
  it("R = 20.000 -> 0", () => {
    expect(calcolaUlterioreDetrazioneCuneo(20000)).toBe(0);
  });
  it("R = 20.000,01 -> 1.000", () => {
    expect(calcolaUlterioreDetrazioneCuneo(20000.01)).toBe(1000);
  });
  it("R = 32.000 -> 1.000", () => {
    expect(calcolaUlterioreDetrazioneCuneo(32000)).toBe(1000);
  });
  it("R = 32.000,01 -> decalage", () => {
    expect(calcolaUlterioreDetrazioneCuneo(32000.01)).toBeLessThan(1000);
  });
  it("R = 40.000 -> 0", () => {
    expect(calcolaUlterioreDetrazioneCuneo(40000)).toBeCloseTo(0, 6);
  });
  it("R = 40.000,01 -> 0", () => {
    expect(calcolaUlterioreDetrazioneCuneo(40000.01)).toBe(0);
  });
});

describe("confini - addizionale comunale Milano", () => {
  it("R = 23.000 esente", () => {
    expect(calcolaAddizionaleComunale(23000)).toBe(0);
  });
  it("R = 23.000,01 si applica sull'intero imponibile (scalino)", () => {
    expect(calcolaAddizionaleComunale(23000.01)).toBeCloseTo(23000.01 * 0.008, 6);
  });
});

describe("confini - trattamento integrativo", () => {
  it("R = 15.000 con capienza -> 1.200", () => {
    const irpefLorda = 15000 * 0.23;
    expect(calcolaTrattamentoIntegrativo(15000, irpefLorda, 1955)).toBe(1200);
  });
  it("R = 28.000 con detrazione > irpef lorda", () => {
    expect(calcolaTrattamentoIntegrativo(28000, 1000, 1500)).toBeCloseTo(500, 6);
  });
  it("R = 28.000,01 -> 0", () => {
    expect(calcolaTrattamentoIntegrativo(28000.01, 1000, 1500)).toBe(0);
  });
});

describe("confini - contributo aggiuntivo INPS 1%", () => {
  it("RAL = 56.224 nessun contributo aggiuntivo", () => {
    expect(
      calcolaContributiINPS(CONFIG_2026.inps.sogliaContributoAggiuntivo)
        .contributoAggiuntivo,
    ).toBeCloseTo(0, 6);
  });
  it("RAL = 56.225 -> 1% sull'eccedenza", () => {
    expect(calcolaContributiINPS(56225).contributoAggiuntivo).toBeCloseTo(0.01, 6);
  });
});
