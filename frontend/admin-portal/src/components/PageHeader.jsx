import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Title block for a page: optional back link, title, optional subtitle, optional trailing
 * action. Replaces the hand-rolled `<Link><ArrowLeft/>back</Link>` + `<h1>` pair that every
 * detail page repeated with slightly different spacing.
 */
export function PageHeader({ title, subtitle, backTo, backLabel, action, className }) {
  return (
    <div className={cn('mb-5', className)}>
      {backTo ? (
        <Link
          to={backTo}
          className="mb-3 -ml-1 inline-flex min-h-9 items-center gap-1 rounded-md px-1 text-body text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title text-foreground">{title}</h1>
          {subtitle ? <p className="mt-1 text-body text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

/** Section heading inside a page, with an optional "see all"-style trailing link. */
export function SectionHeader({ title, action, className }) {
  return (
    <div className={cn('mb-2 flex items-center justify-between gap-2', className)}>
      <h2 className="text-section text-foreground">{title}</h2>
      {action}
    </div>
  );
}
