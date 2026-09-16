import { Link } from "@tanstack/react-router";
import { CONFIG_2026 } from "@/lib/tax/config2026";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight">
            Lordo → Netto
          </span>
          <span className="num rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
            {CONFIG_2026.anno}
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary !text-foreground font-medium" }}
          >
            Calcolatore
          </Link>
          <Link
            to="/regole"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary !text-foreground font-medium" }}
          >
            Regole e metodologia
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70">
      <div className="mx-auto max-w-6xl px-5 py-8 text-xs leading-relaxed text-muted-foreground">
        <p>
          Stima indicativa per un lavoratore dipendente del settore privato
          residente a {CONFIG_2026.comune} ({CONFIG_2026.regione}), anno{" "}
          {CONFIG_2026.anno}. Non sostituisce la busta paga né una consulenza
          fiscale.
        </p>
      </div>
    </footer>
  );
}
