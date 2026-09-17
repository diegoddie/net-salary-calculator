# Calcolatore RAL → Netto 2026

Applicazione web che stima lo stipendio netto annuo e mensile a partire dalla RAL,
con il dettaglio completo di contributi, imposte e bonus e una pagina che spiega
ogni regola applicata.

## Pagine

- `/` — calcolatore: input RAL, scelta 13/14 mensilità, netto mensile e annuo,
  grafico della composizione della RAL e tabella di dettaglio con rimandi alle regole.
- `/regole` — regole e metodologia: panoramica, ipotesi, spiegazione di ogni step,
  esempio passo passo calcolato sui dati reali, glossario, limiti e fonti normative.

## Ipotesi del calcolo

- Lavoratore dipendente del settore privato, contratto a tempo indeterminato.
- Iscrizione INPS al Fondo Pensioni Lavoratori Dipendenti, aliquota standard a carico del dipendente.
- Residenza e domicilio fiscale a Milano (Lombardia) per le addizionali.
- La RAL è l'unico reddito imponibile del contribuente.
- Nessun carico familiare, nessuna agevolazione (impatriati, ricercatori, premi di risultato),
  nessun fringe benefit, nessuna trattenuta sindacale o previdenza complementare.
- Anno fiscale pieno (12 mesi di lavoro).

## Limiti

- Stima annua media: in busta paga le addizionali sono trattenute a rate mensili e
  la tredicesima ha un trattamento fiscale diverso dalle mensilità ordinarie.
- Non sono considerati conguagli, arretrati, TFR, straordinari e variabili.
- Le addizionali comunali di comuni diversi da Milano non sono supportate.
- I parametri 2026 possono cambiare in seguito a nuovi provvedimenti normativi.

## Struttura del codice

- `src/lib/tax/config2026.ts` — unica fonte di verità dei parametri fiscali 2026 e delle fonti.
- `src/lib/tax/engine.ts` — funzioni pure di calcolo e orchestrazione (`calculateNetSalary`).
- `src/lib/tax/types.ts` — tipi di input e risultato.
- `src/lib/tax/format.ts` — formattazione e parsing in formato italiano.
- `src/lib/tax/steps.ts` — costruzione dell'esempio passo passo.
- `src/content/rules.ts` — testi di regole, ipotesi, limiti e glossario.
- `src/routes/` — pagine (TanStack Start).

## Sviluppo

```bash
bun install
bun run dev     # http://localhost:8080
bun run test    # test del motore di calcolo
```
