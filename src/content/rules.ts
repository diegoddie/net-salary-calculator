/**
 * Testi descrittivi della pagina "Regole e metodologia".
 * Qui NON vivono valori numerici fiscali: aliquote, soglie e importi
 * vengono letti da config2026.ts e dal motore di calcolo.
 */

export const IPOTESI: string[] = [
  "Lavoratore dipendente del settore privato, impiegato, contratto a tempo indeterminato, full-time, assunto per l'intero anno (365 giorni).",
  "Residenza e domicilio fiscale a Milano (Regione Lombardia).",
  "Nessun familiare a carico e nessuna agevolazione particolare: no impatriati, no welfare, no fringe benefit, no premi di produttività, no straordinari.",
  "Unico reddito del contribuente è il lavoro dipendente: reddito complessivo = reddito imponibile IRPEF.",
  "Nessun onere deducibile oltre ai contributi INPS a carico del lavoratore.",
  "Aliquota contributiva INPS standard FPLD.",
];

export const LIMITI: string[] = [
  "Il netto mensile è una media: in busta paga reale le addizionali regionale e comunale vengono trattenute a rate nell'anno successivo e la tredicesima/quattordicesima ha una tassazione diversa dalle mensilità ordinarie.",
  "Il contributo aggiuntivo INPS dell'1% è calcolato su base annua, non mensilizzata.",
  "Non considera familiari a carico, altri redditi, oneri deducibili o detraibili, fringe benefit, welfare, premi di produttività, fondo pensione e contributi specifici di CCNL (es. fondi sanitari).",
  "Il TFR non è una trattenuta e non è incluso nel netto.",
  "L'aliquota INPS usata è quella standard: alcuni settori hanno aliquote leggermente diverse.",
];

export const PANORAMICA_STEPS: { titolo: string; testo: string }[] = [
  { titolo: "RAL", testo: "Il costo lordo annuo in contratto, esclusi TFR e contributi a carico azienda." },
  { titolo: "Contributi INPS", testo: "La quota previdenziale a carico del dipendente, trattenuta dal lordo." },
  { titolo: "Imponibile IRPEF", testo: "RAL meno i contributi: è la base su cui si calcolano le imposte." },
  { titolo: "IRPEF lorda", testo: "Imposta progressiva calcolata per scaglioni sull'imponibile." },
  { titolo: "Detrazione lavoro", testo: "Riduce l'imposta dovuta e decresce al crescere del reddito." },
  { titolo: "Taglio del cuneo", testo: "Somma esente per i redditi bassi e ulteriore detrazione per quelli medi." },
  { titolo: "IRPEF netta", testo: "IRPEF lorda meno le detrazioni, mai sotto zero." },
  { titolo: "Trattamento integrativo", testo: "Bonus che si aggiunge al netto per i redditi bassi con detrazioni capienti." },
  { titolo: "Addizionali", testo: "Imposte locali regionale e comunale calcolate sull'imponibile." },
  { titolo: "Netto", testo: "RAL meno contributi e imposte, più i bonus fiscali non tassati." },
];

export const CONTRIBUTI_VS_IMPOSTE = {
  contributi:
    "I contributi previdenziali (INPS) non sono tasse: finanziano la tua pensione futura e riducono la base imponibile su cui si calcola l'IRPEF.",
  imposte:
    "Le imposte (IRPEF e addizionali regionale e comunale) finanziano la fiscalità generale dello Stato e degli enti locali.",
};

export type RegolaContenuto = {
  anchor: string;
  titolo: string;
  cosaE: string;
  quando: string[];
  note: string[];
  fonte: string;
};

export const REGOLE: RegolaContenuto[] = [
  {
    anchor: "contributi-inps",
    titolo: "Contributi previdenziali INPS",
    cosaE:
      "Sono la quota di previdenza obbligatoria a carico del lavoratore, trattenuta direttamente dalla retribuzione lorda. Oltre all'aliquota ordinaria è previsto un contributo aggiuntivo dell'1% sulla parte di retribuzione che supera la prima fascia di retribuzione pensionabile.",
    quando: [
      "L'aliquota base si applica sempre, sull'intera RAL.",
      "Il contributo aggiuntivo si applica solo alla parte di RAL eccedente la soglia annua della prima fascia.",
    ],
    note: [
      "Nel prototipo il calcolo è annuale e non mensilizzato: in busta paga la soglia della prima fascia viene verificata mese per mese.",
      "Non viene applicato alcun massimale contributivo.",
    ],
    fonte: "Circolare INPS n. 6 del 30 gennaio 2026.",
  },
  {
    anchor: "imponibile",
    titolo: "Reddito imponibile IRPEF",
    cosaE:
      "L'imponibile è ciò che resta della RAL dopo aver sottratto i contributi previdenziali a carico del lavoratore, che sono oneri deducibili. È la base su cui si calcolano IRPEF e addizionali.",
    quando: [
      "Si applica sempre: R = RAL − contributi INPS a carico del dipendente.",
    ],
    note: [
      "Poiché il lavoro dipendente è l'unico reddito ipotizzato, reddito complessivo e imponibile IRPEF coincidono.",
    ],
    fonte: "Art. 51 e art. 10 TUIR (D.P.R. 917/1986).",
  },
  {
    anchor: "irpef-scaglioni",
    titolo: "IRPEF lorda e scaglioni",
    cosaE:
      "L'IRPEF è progressiva: ogni aliquota si applica solo alla porzione di reddito compresa nel proprio scaglione, non a tutto il reddito. Superare uno scaglione non aumenta l'imposta sulla parte sottostante.",
    quando: [
      "L'aliquota del primo scaglione si applica alla quota di imponibile fino al primo limite.",
      "Le aliquote successive si applicano solo alla quota eccedente il limite precedente.",
    ],
    note: [
      "La somma delle imposte di scaglione è l'IRPEF lorda, prima delle detrazioni.",
    ],
    fonte:
      "Legge 30 dicembre 2025, n. 199 (Legge di Bilancio 2026), che modifica l'art. 11 TUIR.",
  },
  {
    anchor: "detrazione-lavoro",
    titolo: "Detrazione per lavoro dipendente",
    cosaE:
      "È uno sconto d'imposta riconosciuto a chi produce reddito da lavoro dipendente. Decresce al crescere del reddito fino ad azzerarsi, e prevede una maggiorazione fissa per una fascia intermedia di reddito.",
    quando: [
      "Importo fisso fino alla prima soglia di reddito (condizione R ≤ soglia).",
      "Formula decrescente nelle fasce intermedie, con estremi inclusi (condizione ≤).",
      "Nulla oltre l'ultima soglia (condizione R > soglia).",
      "La maggiorazione spetta solo nell'intervallo indicato, estremo inferiore escluso e superiore incluso.",
    ],
    note: [
      "È una detrazione, non una deduzione: riduce l'imposta, non l'imponibile.",
      "Tra la prima e la seconda fascia la formula produce uno scalino, perché la legge definisce importi distinti per intervalli distinti.",
    ],
    fonte:
      "Art. 13 TUIR (D.P.R. 917/1986), come modificato dal D.Lgs. 216/2023.",
  },
  {
    anchor: "taglio-cuneo",
    titolo: "Taglio del cuneo fiscale",
    cosaE:
      "Misura in due parti. Per i redditi più bassi è riconosciuta una somma esente, che non viene tassata e si aggiunge al netto. Per i redditi medi spetta invece un'ulteriore detrazione IRPEF, che riduce l'imposta dovuta.",
    quando: [
      "La somma esente spetta solo se l'imponibile è entro la soglia massima prevista (condizione ≤).",
      "L'ulteriore detrazione spetta solo oltre quella soglia (condizione >) e fino alla soglia massima (condizione ≤), con décalage lineare nell'ultimo tratto.",
    ],
    note: [
      "La percentuale della somma esente si applica all'INTERO reddito, non a scaglioni: superare una soglia riduce la percentuale su tutto il reddito.",
      "La somma esente non è tassata e non riduce l'IRPEF: si somma al netto.",
    ],
    fonte: "Legge 30 dicembre 2024, n. 207, art. 1, commi 4-9.",
  },
  {
    anchor: "irpef-netta",
    titolo: "IRPEF netta",
    cosaE:
      "È l'imposta effettivamente dovuta: IRPEF lorda meno la detrazione per lavoro dipendente e l'eventuale ulteriore detrazione del taglio del cuneo. Non può essere negativa.",
    quando: [
      "Si applica sempre; il risultato è azzerato quando le detrazioni superano l'imposta lorda.",
    ],
    note: [
      "Incapienza: le detrazioni non utilizzate vanno perse e non vengono rimborsate.",
    ],
    fonte: "Art. 11 e art. 13 TUIR (D.P.R. 917/1986).",
  },
  {
    anchor: "trattamento-integrativo",
    titolo: "Trattamento integrativo",
    cosaE:
      "È il bonus in busta paga (ex 'bonus 100 euro') riconosciuto ai redditi bassi con imposta capiente. Non riduce l'IRPEF: viene erogato e si somma al netto.",
    quando: [
      "Spetta per intero entro la prima soglia di reddito, se l'IRPEF lorda supera la detrazione da lavoro diminuita del correttivo.",
      "Nella fascia successiva spetta solo se la detrazione da lavoro supera l'IRPEF lorda, nel limite della differenza e comunque entro l'importo massimo annuo.",
      "Oltre la seconda soglia non spetta.",
    ],
    note: ["È un bonus che si AGGIUNGE al netto, non una riduzione d'imposta."],
    fonte: "D.L. 3/2020 e successive modifiche.",
  },
  {
    anchor: "addizionale-regionale",
    titolo: "Addizionale regionale IRPEF",
    cosaE:
      "Imposta locale calcolata sull'imponibile IRPEF, con scaglioni progressivi fissati dalla Regione di residenza. Nel prototipo la residenza è in Lombardia.",
    quando: [
      "Si applica sull'imponibile per scaglioni, come l'IRPEF: ogni aliquota vale solo per la quota di reddito nel proprio scaglione.",
    ],
    note: [
      "In busta paga reale viene trattenuta a rate nell'anno successivo a quello di competenza.",
    ],
    fonte:
      "Regione Lombardia - addizionale regionale IRPEF; portale addizionali IRPEF del Dipartimento delle Finanze (MEF).",
  },
  {
    anchor: "addizionale-comunale",
    titolo: "Addizionale comunale IRPEF",
    cosaE:
      "Imposta locale con aliquota unica fissata dal Comune di residenza, qui Milano, con una soglia di esenzione sotto la quale non è dovuta nulla.",
    quando: [
      "Entro la soglia di esenzione (condizione R ≤ soglia) l'imposta è zero.",
      "Oltre la soglia (condizione R > soglia) l'aliquota si applica sull'INTERO imponibile, non solo sulla parte eccedente.",
    ],
    note: [
      "È il classico 'scalino': superare di un euro la soglia fa nascere l'imposta su tutto il reddito.",
      "Anche questa viene trattenuta a rate nell'anno successivo.",
    ],
    fonte: "Comune di Milano - addizionale comunale IRPEF.",
  },
];

export const GLOSSARIO: { termine: string; definizione: string }[] = [
  {
    termine: "RAL",
    definizione:
      "Retribuzione Annua Lorda: il totale lordo annuo previsto dal contratto, prima di contributi e imposte. Non comprende il TFR né i contributi a carico dell'azienda.",
  },
  {
    termine: "Imponibile",
    definizione:
      "La parte di reddito su cui si calcola l'imposta, ottenuta togliendo dalla RAL i contributi previdenziali a carico del lavoratore.",
  },
  {
    termine: "Imposta lorda e imposta netta",
    definizione:
      "L'imposta lorda è quella calcolata sugli scaglioni; l'imposta netta è ciò che resta dopo aver applicato le detrazioni spettanti.",
  },
  {
    termine: "Detrazione vs deduzione",
    definizione:
      "La deduzione riduce l'imponibile prima del calcolo dell'imposta (come i contributi INPS); la detrazione riduce direttamente l'imposta già calcolata.",
  },
  {
    termine: "Incapienza",
    definizione:
      "Quando le detrazioni spettanti superano l'imposta dovuta: l'eccedenza non viene rimborsata e va persa.",
  },
  {
    termine: "Mensilità",
    definizione:
      "Il numero di rate in cui la retribuzione annua viene distribuita: 13 con la tredicesima, 14 anche con la quattordicesima. La RAL non cambia: cambia solo l'importo della singola busta.",
  },
  {
    termine: "TFR",
    definizione:
      "Trattamento di Fine Rapporto: quota accantonata dal datore di lavoro ed erogata alla fine del rapporto. Non è una trattenuta e non fa parte del netto mensile.",
  },
  {
    termine: "Familiari a carico e Assegno Unico",
    definizione:
      "Le detrazioni per coniuge e altri familiari e l'Assegno Unico e Universale per i figli dipendono dalla composizione del nucleo e, per l'Assegno Unico, dall'ISEE: sono fuori dallo scopo di questo prototipo, che ipotizza un contribuente senza familiari a carico.",
  },
];
