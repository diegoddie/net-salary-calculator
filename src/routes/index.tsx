import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Info } from "lucide-react";

import { calculateNetSalary } from "@/lib/tax/engine";
import { CONFIG_2026 as C } from "@/lib/tax/config2026";
import type { Mensilita } from "@/lib/tax/types";
import {
  formatAliquota,
  formatEuro,
  formatPercent,
  formatThousandsInput,
  parseItalianNumber,
} from "@/lib/tax/format";
import { BreakdownDonut } from "@/components/calculator/breakdown-donut";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calcolo stipendio netto 2026 da RAL — Milano" },
      {
        name: "description",
        content:
          "Inserisci la RAL e vedi netto annuo e mensile 2026: contributi INPS, IRPEF, addizionali di Lombardia e Milano, taglio del cuneo e trattamento integrativo.",
      },
      { property: "og:title", content: "Calcolo stipendio netto 2026 da RAL" },
      {
        property: "og:description",
        content:
          "Dalla RAL al netto in busta paga, con il dettaglio di ogni trattenuta e bonus.",
      },
    ],
  }),
  component: Calcolatore,
});

const PRESETS = [25000, 35000, 45000, 60000, 90000];

function Calcolatore() {
  const [raw, setRaw] = useState("");
  const [mensilita, setMensilita] = useState<Mensilita>(13);

  const ral = parseItalianNumber(raw);
  const valid =
    ral !== null && ral > 0 && ral <= C.limiti.ralMax ? ral : null;

  const result = useMemo(
    () => (valid ? calculateNetSalary({ ral: valid, mensilita }) : null),
    [valid, mensilita],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Dalla RAL allo stipendio netto, {C.anno}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Una stima trasparente per un dipendente del settore privato residente
          a {C.comune}: ogni trattenuta è spiegata e ogni numero è ricavato da
          una regola che puoi leggere.
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* ---------- Form ---------- */}
        <div className="surface h-fit p-5">
          <label
            htmlFor="ral"
            className="text-sm font-medium text-foreground"
          >
            Retribuzione annua lorda (RAL)
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring/50">
            <span className="num text-muted-foreground">€</span>
            <input
              id="ral"
              inputMode="numeric"
              value={raw}
              onChange={(e) => setRaw(formatThousandsInput(e.target.value))}
              className="num w-full bg-transparent text-lg outline-none"
              placeholder="Inserisci la tua RAL"
              aria-describedby="ral-help"
            />
            <span className="text-xs text-muted-foreground">/ anno</span>
          </div>
          <p id="ral-help" className="mt-2 text-xs text-muted-foreground">
            Solo la RAL da contratto: senza TFR e senza contributi a carico
            dell'azienda.
          </p>
          {!valid && raw.trim() !== "" && (
            <p className="mt-2 text-xs text-destructive">
              Inserisci un importo tra 1 € e {formatEuro(C.limiti.ralMax)}.
            </p>
          )}

          <input
            type="range"
            min={10000}
            max={150000}
            step={500}
            value={valid ?? 10000}
            onChange={(e) =>
              setRaw(formatThousandsInput(String(e.target.value)))
            }
            className="mt-4 w-full accent-[var(--netto)]"
            aria-label="Regola la RAL"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setRaw(formatThousandsInput(String(p)))}
                className={cn(
                  "num rounded-full border border-border px-3 py-1 text-xs transition-colors hover:bg-secondary",
                  valid === p && "border-transparent bg-accent text-accent-foreground",
                )}
              >
                {formatEuro(p).replace(",00", "")}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <span className="text-sm font-medium">Mensilità</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([13, 14] as Mensilita[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMensilita(m)}
                  aria-pressed={mensilita === m}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm transition-colors",
                    mensilita === m
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  {m} mensilità
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              La RAL non cambia: cambia solo come viene distribuita nelle buste
              paga.
            </p>
          </div>
        </div>

        {/* ---------- Risultati ---------- */}
        {!result && (
          <div className="surface flex h-fit items-center gap-3 p-5 text-sm text-muted-foreground">
            <Info className="size-4 shrink-0" />
            <span>
              Inserisci la tua RAL per vedere lo stipendio netto e il dettaglio
              delle trattenute.
            </span>
          </div>
        )}
        {result && (
          <div className="space-y-6">
            <div className="surface p-5">
              <div className="grid gap-5 sm:grid-cols-2 sm:items-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Netto mensile stimato
                  </p>
                  <p className="num mt-1 text-4xl font-semibold text-[var(--netto)]">
                    {formatEuro(result.nettoMensile)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    su {mensilita} mensilità
                  </p>

                  <dl className="mt-5 space-y-2 text-sm">
                    <Row
                      label="Netto annuo"
                      value={formatEuro(result.nettoAnnuo)}
                    />
                    <Row
                      label="Totale trattenute"
                      value={formatEuro(result.totaleTrattenute)}
                    />
                    <Row
                      label="Bonus non tassati"
                      value={formatEuro(result.bonusFiscali)}
                    />
                    <Row
                      label="Prelievo effettivo sulla RAL"
                      value={formatPercent(result.aliquotaEffettiva, 1)}
                    />
                  </dl>
                </div>

                <BreakdownDonut
                  centerLabel="RAL"
                  centerValue={formatEuro(result.input.ral).replace(",00", "")}
                  slices={[
                    {
                      name: "Netto da retribuzione",
                      value: result.nettoDaRetribuzione,
                      color: "var(--netto)",
                    },
                    {
                      name: "Contributi INPS",
                      value: result.contributiINPS,
                      color: "var(--contributi)",
                    },
                    {
                      name: "Imposte",
                      value: result.totaleImposte,
                      color: "var(--imposte)",
                    },
                  ]}
                />
              </div>

              {result.bonusFiscali > 0 && (
                <p className="mt-4 flex gap-2 rounded-xl bg-[var(--bonus-soft)] p-3 text-xs text-foreground">
                  <Info className="mt-0.5 size-4 shrink-0 text-[var(--bonus)]" />
                  <span>
                    {formatEuro(result.bonusFiscali)} arrivano da somme non
                    tassate (taglio del cuneo e trattamento integrativo): si
                    sommano al netto ma non fanno parte della RAL tassata.
                  </span>
                </p>
              )}
            </div>

            {/* Dettaglio */}
            <div className="surface overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
                <h2 className="text-sm font-semibold">Dettaglio del calcolo</h2>
                <Link
                  to="/regole"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Come si calcola <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <table className="w-full text-sm">
                <tbody>
                  <Line
                    label="RAL"
                    value={result.input.ral}
                    strong
                    anchor={undefined}
                  />
                  <Line
                    label={`Contributi INPS (${formatAliquota(C.inps.aliquotaBase)})`}
                    value={-result.contributiBase}
                    tone="contributi"
                    anchor="contributi-inps"
                  />
                  {result.contributoAggiuntivo > 0 && (
                    <Line
                      label="Contributo aggiuntivo 1%"
                      value={-result.contributoAggiuntivo}
                      tone="contributi"
                      anchor="contributi-inps"
                    />
                  )}
                  <Line
                    label="Imponibile IRPEF"
                    value={result.redditoImponibile}
                    strong
                    anchor="imponibile"
                  />
                  <Line
                    label="IRPEF lorda"
                    value={-result.irpefLorda}
                    tone="imposte"
                    anchor="irpef-scaglioni"
                  />
                  <Line
                    label="Detrazione lavoro dipendente"
                    value={result.detrazioneLavoro}
                    tone="imposte"
                    anchor="detrazione-lavoro"
                  />
                  {result.ulterioreDetrazioneCuneo > 0 && (
                    <Line
                      label="Ulteriore detrazione (taglio cuneo)"
                      value={result.ulterioreDetrazioneCuneo}
                      tone="imposte"
                      anchor="taglio-cuneo"
                    />
                  )}
                  <Line
                    label="IRPEF netta"
                    value={-result.irpefNetta}
                    tone="imposte"
                    strong
                    anchor="irpef-netta"
                  />
                  <Line
                    label={`Addizionale regionale ${C.regione}`}
                    value={-result.addizionaleRegionale}
                    tone="imposte"
                    anchor="addizionale-regionale"
                  />
                  <Line
                    label={`Addizionale comunale ${C.comune}`}
                    value={-result.addizionaleComunale}
                    tone="imposte"
                    anchor="addizionale-comunale"
                  />
                  {result.sommaEsenteCuneo > 0 && (
                    <Line
                      label="Somma esente (taglio cuneo)"
                      value={result.sommaEsenteCuneo}
                      tone="bonus"
                      anchor="taglio-cuneo"
                    />
                  )}
                  {result.trattamentoIntegrativo > 0 && (
                    <Line
                      label="Trattamento integrativo"
                      value={result.trattamentoIntegrativo}
                      tone="bonus"
                      anchor="trattamento-integrativo"
                    />
                  )}
                  <Line
                    label="Netto annuo"
                    value={result.nettoAnnuo}
                    strong
                    anchor="panoramica"
                  />
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">
              Stima media annua: in busta paga le addizionali sono trattenute a
              rate e la tredicesima ha una tassazione diversa dalle mensilità
              ordinarie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="num font-medium">{value}</dd>
    </div>
  );
}

function Line({
  label,
  value,
  tone,
  strong,
  anchor,
}: {
  label: string;
  value: number;
  tone?: "contributi" | "imposte" | "bonus";
  strong?: boolean;
  anchor?: string;
}) {
  return (
    <tr className={cn("border-b border-border/60", strong && "bg-secondary/50")}>
      <td className="px-5 py-2.5">
        {anchor ? (
          <Link
            to="/regole"
            hash={anchor}
            className="hover:text-primary hover:underline"
          >
            {label}
          </Link>
        ) : (
          label
        )}
        {tone && (
          <span
            className="ml-2 inline-block size-2 rounded-full align-middle"
            style={{ backgroundColor: `var(--${tone})` }}
            aria-hidden
          />
        )}
      </td>
      <td
        className={cn(
          "num px-5 py-2.5 text-right",
          strong && "font-semibold",
          value < 0 && "text-muted-foreground",
        )}
      >
        {value < 0 ? `− ${formatEuro(-value)}` : formatEuro(value)}
      </td>
    </tr>
  );
}
