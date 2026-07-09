import { useTranslation } from 'react-i18next';

export function FormRow({ label, error, optional, children }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {optional ? (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            ({t('complaint.form.optional')})
          </span>
        ) : null}
      </label>
      {children}
      {error ? <p className="text-xs text-destructive">{error.message}</p> : null}
    </div>
  );
}
