import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  IPOTESI,
  LIMITI,
  PANORAMICA_STEPS,
  CONTRIBUTI_VS_IMPOSTE,
  REGOLE,
  GLOSSARIO,
} from "@/content/rules";
import { CONFIG_2026 as C, FONTI } from "@/lib/tax/config2026";
import { calculateNetSalary } from "@/lib/tax/engine";
import { buildSteps } from "@/lib/tax/steps";
import { formatEuro, formatThousandsInput, parseItalianNumber } from "@/lib/tax/format";
import type { Mensilita } from "@/lib/tax/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/regole")({
  head: () => ({
    meta: [
      { title: "Regole e metodologia del calcolo netto 2026" },
      {
        name: "description",
        content:
          "Tutte le regole usate per passare dalla RAL al netto 2026: contributi INPS, scaglioni IRPEF, detrazioni, taglio del cuneo, addizionali e fonti normative.",
      },
      {
        property: "og:title",
        content: "Regole e metodologia del calcolo netto 2026",
      },
      {
        property: "og:description",
        content:
          "Formule, soglie, esempio passo passo e fonti normative del calcolo dallo stipendio lordo al netto.",
      },
    ],
  }),
  component: Regole,
});

const SEZIONI = [
  { anchor: "panoramica", titolo: "Panoramica" },
  { anchor: "ipotesi", titolo: "Ipotesi del calcolo" },
  ...REGOLE.map((r) => ({ anchor: r.anchor, titolo: r.titolo })),
  { anchor: "esempio", titolo: "Esempio passo passo" },
  { anchor: "limiti", titolo: "Limiti del modello" },
  { anchor: "glossario", titolo: "Glossario" },
  { anchor: "fonti", titolo: "Fonti" },
];

function Regole() {
  const [raw, setRaw] = useState("35.000");
  const [mensilita, setMensilita] = useState<Mensilita>(14);
  const ral = parseItalianNumber(raw);
  const esempio = useMemo(
    () =>
      ral && ral > 0 && ral <= C.limiti.ralMax
        ? calculateNetSalary({ ral, mensilita })
        : null,
    [ral, mensilita],
  );
  const steps = useMemo(() => (esempio ? buildSteps(esempio) : []), [esempio]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Regole e metodologia
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Ogni numero del calcolatore nasce da una regola scritta qui: formula,
          quando si applica, e la fonte normativa. Parametri riferiti all'anno{" "}
          {C.anno}, {C.comune} ({C.regione}).
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex text-sm text-primary hover:underline"
        >
          ← Torna al calcolatore
        </Link>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <ul className="sticky top-24 space-y-1 text-sm">
            {SEZIONI.map((s) => (
              <li key={s.anchor}>
                <a
                  href={`#${s.anchor}`}
                  className="block rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {s.titolo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-12">
          <Section id="panoramica" titolo="Panoramica">
            <ol className="grid gap-3 sm:grid-cols-2">
              {PANORAMICA_STEPS.map((s, i) => (
                <li key={s.titolo} className="surface p-4">
                  <span className="num text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-1 text-sm font-medium">{s.titolo}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {s.testo}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="rounded-xl bg-[var(--contributi-soft)] p-4 text-xs leading-relaxed">
                {CONTRIBUTI_VS_IMPOSTE.contributi}
              </p>
              <p className="rounded-xl bg-[var(--imposte-soft)] p-4 text-xs leading-relaxed">
                {CONTRIBUTI_VS_IMPOSTE.imposte}
              </p>
            </div>
          </Section>

          <Section id="ipotesi" titolo="Ipotesi del calcolo">
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {IPOTESI.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-border" />
                  {t}
                </li>
              ))}
            </ul>
          </Section>

          {REGOLE.map((r) => (
            <Section key={r.anchor} id={r.anchor} titolo={r.titolo}>
              <p className="text-sm leading-relaxed">{r.cosaE}</p>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Quando si applica
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {r.quando.map((q) => (
                  <li key={q} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-border" />
                    {q}
                  </li>
                ))}
              </ul>
              {r.note.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                  {r.note.map((nota) => (
                    <li key={nota}>· {nota}</li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Fonte:</span>{" "}
                {r.fonte}
              </p>
            </Section>
          ))}

          <Section id="esempio" titolo="Esempio passo passo">
            <div className="surface flex flex-wrap items-end gap-4 p-4">
              <div>
                <label htmlFor="esempio-ral" className="text-xs font-medium">
                  RAL dell'esempio
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-input px-3 py-1.5">
                  <span className="num text-muted-foreground">€</span>
                  <input
                    id="esempio-ral"
                    inputMode="numeric"
                    value={raw}
                    onChange={(e) =>
                      setRaw(formatThousandsInput(e.target.value))
                    }
                    className="num w-28 bg-transparent outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {([13, 14] as Mensilita[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMensilita(m)}
                    aria-pressed={mensilita === m}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs",
                      mensilita === m
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border hover:bg-secondary",
                    )}
                  >
                    {m} mensilità
                  </button>
                ))}
              </div>
            </div>

            {esempio ? (
              <ol className="mt-4 space-y-3">
                {steps.map((s) => (
                  <li key={s.n} id={`step-${s.n}`} className="surface p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold">
                        <span className="num mr-2 text-muted-foreground">
                          {s.n}.
                        </span>
                        {s.titolo}
                      </h3>
                      <span className="num text-sm font-semibold text-[var(--netto)]">
                        {s.risultato}
                      </span>
                    </div>
                    <p className="num mt-2 whitespace-pre-line rounded-lg bg-secondary px-3 py-2 text-xs leading-relaxed">
                      {s.formula}
                    </p>
                    <p className="num mt-2 whitespace-pre-line px-3 text-xs leading-relaxed text-muted-foreground">
                      {s.valorizzata}
                    </p>
                    {s.nota && (
                      <p className="mt-2 px-3 text-xs text-muted-foreground">
                        {s.nota}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-destructive">
                Inserisci una RAL valida (fino a {formatEuro(C.limiti.ralMax)}).
              </p>
            )}
          </Section>

          <Section id="limiti" titolo="Limiti del modello">
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {LIMITI.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-border" />
                  {t}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="glossario" titolo="Glossario">
            <dl className="space-y-4">
              {GLOSSARIO.map((g) => (
                <div key={g.termine}>
                  <dt className="text-sm font-medium">{g.termine}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {g.definizione}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="fonti" titolo="Fonti">
            <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              {FONTI.map((f) => (
                <li key={f.id}>· {f.testo}</li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  titolo,
  children,
}: {
  id: string;
  titolo: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight">{titolo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
