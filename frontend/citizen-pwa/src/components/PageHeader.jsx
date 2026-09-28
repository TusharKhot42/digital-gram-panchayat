import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

/**
 * Title block for a page: back button (default enabled), title, optional subtitle, optional trailing action.
 */
export function PageHeader({ title, subtitle, backTo, backLabel, action, className, showBack = true }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const label = backLabel || t('common.back', 'Back');

  return (
    <div className={cn('mb-5', className)}>
      {showBack ? (
        backTo ? (
          <Link
            to={backTo}
            className="mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#6495ED]/30 bg-card px-3 py-1 text-xs font-bold text-muted-foreground shadow-2xs transition-all hover:bg-primary/10 hover:text-primary active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#6495ED]/30 bg-card px-3 py-1 text-xs font-bold text-muted-foreground shadow-2xs transition-all hover:bg-primary/10 hover:text-primary active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{label}</span>
          </button>
        )
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title font-bold text-foreground">{title}</h1>
          {subtitle ? <p className="mt-1 text-body text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

/** Section heading inside a page, with an optional "see all"-style trailing link. */
export function SectionHeader({ title, action, className, id }) {
  return (
    <div className={cn('mb-2 flex items-center justify-between gap-2', className)}>
      <h2 id={id} className="text-section text-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}
