import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

/**
 * A module's title, on a soft branded band with the module's own motif behind it.
 * Features an integrated Back navigation button.
 */
export function ModuleHeader({ art: Art, title, description, action, className, backTo, showBack = true }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'relative isolate mb-5 overflow-hidden rounded-2xl border border-border',
        'bg-gradient-to-r from-primary-subtle via-primary-subtle/40 to-card',
        'px-4 py-4 sm:px-5',
        className,
      )}
    >
      {Art ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-2 hidden h-[130%] text-primary opacity-[0.14] sm:block"
        >
          <Art className="h-full w-auto" />
        </div>
      ) : null}

      {showBack ? (
        backTo ? (
          <Link
            to={backTo}
            className="mb-2.5 inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-primary/20 bg-white/80 dark:bg-card px-2.5 py-1 text-xs font-bold text-primary shadow-2xs transition-all hover:bg-primary hover:text-white active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('common.back', 'Back')}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-2.5 inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-primary/20 bg-white/80 dark:bg-card px-2.5 py-1 text-xs font-bold text-primary shadow-2xs transition-all hover:bg-primary hover:text-white active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('common.back', 'Back')}</span>
          </button>
        )
      ) : null}

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title font-bold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1 text-body text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
