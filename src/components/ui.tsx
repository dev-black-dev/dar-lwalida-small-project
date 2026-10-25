import type { ReactNode } from "react";

/** Étoile à 8 branches (rub el hizb) — motif zellige. */
export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="6.5" y="6.5" width="11" height="11" />
        <rect x="6.5" y="6.5" width="11" height="11" transform="rotate(45 12 12)" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Séparateur décoratif : — ✦ — */
export function StarDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      aria-hidden="true"
    >
      <span className="h-px w-14 bg-current opacity-40" />
      <Star className="h-5 w-5" />
      <span className="h-px w-14 bg-current opacity-40" />
    </div>
  );
}

/** En-tête de section éditorial. */
export function SectionHeading({
  kicker,
  title,
  intro,
  tone = "dark",
  align = "center",
  id,
}: {
  id?: string;
  kicker: string;
  title: string;
  intro?: string;
  tone?: "dark" | "light";
  align?: "center" | "start";
}) {
  const light = tone === "light";
  return (
    <div
      className={`max-w-2xl ${
        align === "center" ? "mx-auto text-center" : "text-start"
      }`}
    >
      <p
        className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] ${
          align === "center" ? "justify-center" : ""
        } ${light ? "text-gold-300" : "text-clay-600"}`}
      >
        <Star className="h-3.5 w-3.5" />
        {kicker}
      </p>
      <h2
        id={id}
        className={`mt-3 font-display text-3xl leading-tight sm:text-4xl ${
          light ? "text-cream-50" : "text-cocoa-900"
        }`}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={`mt-4 text-base leading-relaxed ${
            light ? "text-cream-200/85" : "text-cocoa-700/85"
          }`}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

/** Petit badge signalant un visuel d'illustration (pas une photo vérifiée). */
export function ConceptBadge({ label }: { label: string }) {
  return (
    <span className="absolute bottom-3 end-3 z-10 rounded-full bg-cocoa-950/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-cream-100 backdrop-blur-sm">
      {label}
    </span>
  );
}

/** Cœur logotypé : étoile 8 branches + « DW ». */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="14.5" y="14.5" width="19" height="19" />
        <rect x="14.5" y="14.5" width="19" height="19" transform="rotate(45 24 24)" />
      </g>
      <circle cx="24" cy="24" r="7.5" fill="var(--color-cocoa-950)" stroke="none" />
      <text
        x="24"
        y="27.4"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="700"
        fill="currentColor"
        fontFamily="Georgia, serif"
      >
        DW
      </text>
    </svg>
  );
}

/** Illustration SVG : tajine vide (états « panier vide » / « aucun résultat »). */
export function EmptyTajine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true">
      <g fill="none" stroke="var(--color-gold-500)" strokeWidth="1.2" opacity="0.7">
        <rect x="72" y="6" width="16" height="16" />
        <rect x="72" y="6" width="16" height="16" transform="rotate(45 80 14)" />
      </g>
      {/* couvercle conique */}
      <path d="M80 30 C 76 30 74 34 74 37 L 52 78 L 108 78 L 86 37 C 86 34 84 30 80 30 Z" fill="var(--color-clay-500)" />
      <path d="M80 30 C 77 30 75.5 33 75.5 36 L 64 78 L 72 78 L 80 37 Z" fill="var(--color-clay-400)" opacity="0.7" />
      <circle cx="80" cy="30" r="4" fill="var(--color-clay-600)" />
      <path d="M56 62 L 104 62" stroke="var(--color-gold-300)" strokeWidth="2" strokeDasharray="3 4" />
      {/* plat */}
      <ellipse cx="80" cy="84" rx="58" ry="10" fill="var(--color-clay-700)" />
      <ellipse cx="80" cy="81" rx="52" ry="7" fill="var(--color-clay-500)" />
      <path d="M28 84 Q 80 112 132 84" fill="var(--color-clay-600)" />
      {/* menthe */}
      <path d="M128 96 q 8 -6 14 -2 q -6 8 -14 2 z" fill="#6f8f4e" />
      <path d="M126 100 q 2 -10 10 -12" stroke="#55703a" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

/** Bannière à motif zellige (catégories sans photo). */
export function PatternBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="zellige-dark relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-cocoa-900 via-cocoa-950 to-clay-800">
      <div aria-hidden="true" className="absolute -end-10 -top-10 h-48 w-48 text-gold-500/20">
        <Star className="h-full w-full" />
      </div>
      <div aria-hidden="true" className="absolute -bottom-12 -start-8 h-40 w-40 text-gold-500/15">
        <Star className="h-full w-full" />
      </div>
      <span className="sr-only">
        {title} — {subtitle}
      </span>
    </div>
  );
}

/** Mot du restaurant (wordmark textuel). */
export function Wordmark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const main = tone === "light" ? "text-cream-50" : "text-cocoa-900";
  const sub = tone === "light" ? "text-gold-300" : "text-clay-600";
  return (
    <span className="flex flex-col leading-none">
      <span className={`font-script text-[20px] min-[360px]:text-[22px] sm:text-[26px] font-bold tracking-wide ${main} whitespace-nowrap`}>
        Dar L&rsquo;Walida
      </span>
      <span
        className={`mt-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.14em] min-[360px]:tracking-[0.22em] sm:tracking-[0.34em] ${sub} whitespace-nowrap`}
      >
        Authentic Moroccan Cuisine
      </span>
    </span>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  onClick,
}: {
  href: string;
  variant?: "primary" | "outline" | "outline-light" | "ghost";
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-clay-600 text-cream-50 shadow-soft hover:bg-clay-700 active:bg-clay-800",
    outline:
      "border border-cocoa-900/25 bg-transparent text-cocoa-900 hover:border-clay-600 hover:text-clay-700",
    "outline-light":
      "border border-cream-100/40 bg-transparent text-cream-50 hover:border-gold-300 hover:text-gold-300",
    ghost: "text-cocoa-800 hover:text-clay-700",
  };
  return (
    <a
      href={href}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
