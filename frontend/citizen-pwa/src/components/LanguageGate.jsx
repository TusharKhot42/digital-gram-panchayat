import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/store';

const CHOSEN_KEY = 'dgp_lang_chosen';

/** Whether the visitor has already made an explicit language choice. */
function hasChosen() {
  try {
    return localStorage.getItem(CHOSEN_KEY) === '1';
  } catch {
    return true; // storage blocked — never trap the user behind the gate
  }
}

/**
 * First-visit language chooser. Shown once, before anything else on the public entry page, so
 * a new visitor picks English or Marathi up front; the choice persists (i18next already caches
 * the active language, plus a `dgp_lang_chosen` flag so the gate never reappears). Returning
 * visitors and anyone who has used Settings skip it entirely. Bilingual by design — it must be
 * readable whichever language the reader prefers.
 */
export function LanguageGate() {
  const { setLanguage } = useLanguage();
  const [open, setOpen] = useState(() => !hasChosen());

  useEffect(() => {
    if (!open) return;
    // Lock background scroll while the choice is pending.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const choose = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem(CHOSEN_KEY, '1');
    } catch {
      /* ignore storage failure */
    }
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-lg">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
          <Languages className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 id="lang-gate-title" className="text-title text-foreground">
          Choose language
        </h2>
        <p className="mt-1 text-body text-muted-foreground">भाषा निवडा</p>
        <div className="mt-5 grid gap-2.5">
          <button
            type="button"
            onClick={() => choose('en')}
            className="min-h-12 rounded-lg border border-input bg-background px-4 text-body font-medium text-foreground transition-colors duration-150 hover:border-primary hover:bg-primary-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            English
          </button>
          <button
            type="button"
            onClick={() => choose('mr')}
            className="min-h-12 rounded-lg border border-input bg-background px-4 text-body font-medium text-foreground transition-colors duration-150 hover:border-primary hover:bg-primary-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            मराठी
          </button>
        </div>
        <p className="mt-4 text-caption text-muted-foreground">
          You can change this anytime · हे कधीही बदलता येईल
        </p>
      </div>
    </div>
  );
}
