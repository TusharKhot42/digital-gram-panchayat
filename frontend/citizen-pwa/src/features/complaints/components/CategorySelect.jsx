import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { COMPLAINT_CATEGORIES } from '@dgp/shared';
import { cn } from '@/utils/cn';

export function CategorySelect({ register, error }) {
  const { t } = useTranslation();
  const id = useId();

  return (
    <div className="space-y-1">
      {/*
       * Explicit htmlFor rather than wrapping the control, as FormRow does: a <select> nested
       * inside its label folds the selected option's text into the field's accessible name.
       * Before this the label had neither `for` nor nesting, so the field had no name at all.
       */}
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {t('complaint.form.category')}
      </label>
      <select
        id={id}
        className={cn(
          'h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
          error && 'border-destructive',
        )}
        {...register}
      >
        <option value="">{t('complaint.form.chooseCategory')}</option>
        {COMPLAINT_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t(`complaint.category.${c}`, c)}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-destructive">{error.message}</p> : null}
    </div>
  );
}
