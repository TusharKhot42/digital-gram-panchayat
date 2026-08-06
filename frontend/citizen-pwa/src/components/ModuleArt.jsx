/**
 * Module motifs — the line drawing that sits behind a module's title band.
 *
 * Deliberately quieter than the empty-state family: these are always on screen while a citizen
 * reads real content, so they run at low opacity behind the heading and never compete with it.
 * Same 120-box, same stroke weight, no backing disc — that is what makes a module header read
 * as the same system as an empty state rather than a second set of drawings.
 *
 * All decorative. Every one is aria-hidden; the `<h1>` beside it carries the meaning.
 */
const stroke = {
  stroke: 'currentColor',
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
};

function Motif({ children, className }) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="presentation"
      aria-hidden="true"
      className={className ?? 'h-full w-full'}
    >
      {children}
    </svg>
  );
}

/** A speech bubble with a map pin — a complaint reported from where it is. */
export function ComplaintMotif(props) {
  return (
    <Motif {...props}>
      <path
        d="M22 34a6 6 0 0 1 6-6h44a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H44l-14 12V66h-2a6 6 0 0 1-6-6Z"
        {...stroke}
      />
      <path
        d="M92 40a10 10 0 0 1 10 10c0 8-10 20-10 20s-10-12-10-20a10 10 0 0 1 10-10Z"
        {...stroke}
      />
      <circle cx="92" cy="50" r="3" {...stroke} />
    </Motif>
  );
}

/** A sealed certificate. */
export function CertificateMotif(props) {
  return (
    <Motif {...props}>
      <rect x="24" y="22" width="56" height="70" rx="5" {...stroke} />
      <path d="M36 40h32M36 52h32M36 64h20" {...stroke} className="opacity-60" />
      <circle cx="86" cy="74" r="14" {...stroke} />
      <path d="M80 86l-4 14 10-5 10 5-4-14" {...stroke} />
    </Motif>
  );
}

/** A rupee note and a receipt — the demand and the payment. */
export function TaxMotif(props) {
  return (
    <Motif {...props}>
      <rect x="18" y="34" width="60" height="38" rx="5" {...stroke} />
      <path d="M36 46h16M36 53h16M46 46c6 0 6 8 0 8h-6l12 11" {...stroke} />
      <path d="M86 30h20v62l-5-4-5 4-5-4-5 4V30Z" {...stroke} className="opacity-70" />
    </Motif>
  );
}

/** An open hand receiving a document — welfare assistance. */
export function SchemeMotif(props) {
  return (
    <Motif {...props}>
      <rect x="38" y="18" width="44" height="34" rx="4" {...stroke} />
      <path d="M50 30h20M50 40h14" {...stroke} className="opacity-60" />
      <path d="M28 92V72a6 6 0 0 1 12 0v6l22 4a8 8 0 0 1 6 8v2" {...stroke} />
      <path d="M92 92V70a6 6 0 0 0-12 0v10" {...stroke} />
    </Motif>
  );
}

/** A calendar with a marked day. */
export function EventMotif(props) {
  return (
    <Motif {...props}>
      <rect x="22" y="30" width="76" height="64" rx="6" {...stroke} />
      <path d="M22 48h76M42 20v18M78 20v18" {...stroke} />
      <circle cx="60" cy="70" r="9" {...stroke} className="opacity-70" />
    </Motif>
  );
}

/** A notice board with a pinned sheet. */
export function NoticeMotif(props) {
  return (
    <Motif {...props}>
      <rect x="26" y="24" width="68" height="52" rx="5" {...stroke} />
      <path d="M40 40h40M40 52h26" {...stroke} className="opacity-60" />
      <path d="M60 76v18M42 94h36" {...stroke} />
    </Motif>
  );
}

/** A bell — the notification centre. */
export function NotificationMotif(props) {
  return (
    <Motif {...props}>
      <path d="M60 22a24 24 0 0 1 24 24v20l9 14H27l9-14V46a24 24 0 0 1 24-24Z" {...stroke} />
      <path d="M50 80a10 10 0 0 0 20 0" {...stroke} />
      <path d="M60 22v-8" {...stroke} className="opacity-60" />
    </Motif>
  );
}

/** Three figures — the elected members of the panchayat. */
export function DirectoryMotif(props) {
  return (
    <Motif {...props}>
      <circle cx="60" cy="36" r="13" {...stroke} />
      <path d="M38 82a22 22 0 0 1 44 0" {...stroke} />
      <circle cx="24" cy="48" r="9" {...stroke} className="opacity-60" />
      <path d="M8 86a16 16 0 0 1 22-15" {...stroke} className="opacity-60" />
      <circle cx="96" cy="48" r="9" {...stroke} className="opacity-60" />
      <path d="M112 86a16 16 0 0 0-22-15" {...stroke} className="opacity-60" />
    </Motif>
  );
}

/** The panchayat office under a horizon — the village profile. */
export function VillageMotif(props) {
  return (
    <Motif {...props}>
      <path d="M18 58 60 30l42 28" {...stroke} />
      <path d="M30 58v34h60V58" {...stroke} />
      <path d="M44 92V70h14v22M74 70h10v12H74Z" {...stroke} className="opacity-70" />
      <path d="M60 30V16" {...stroke} className="opacity-60" />
    </Motif>
  );
}

/** A shield with a cross — emergency contacts. */
export function EmergencyMotif(props) {
  return (
    <Motif {...props}>
      <path d="M60 16 96 30v26c0 22-16 36-36 44-20-8-36-22-36-44V30Z" {...stroke} />
      <path d="M60 42v28M46 56h28" {...stroke} />
    </Motif>
  );
}
