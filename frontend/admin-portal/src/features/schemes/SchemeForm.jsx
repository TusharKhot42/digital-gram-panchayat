import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { SCHEME_CATEGORIES } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useScheme, useSchemeMutations } from './hooks';

export function SchemeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const { data: existing } = useScheme(id);
  const m = useSchemeMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { category: 'Other', isPublished: false } });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        summary: existing.summary || '',
        description: existing.description,
        category: existing.category,
        eligibility: existing.eligibility || '',
        requiredDocuments: (existing.requiredDocuments || []).join('\n'),
        benefits: existing.benefits || '',
        applicationProcess: existing.applicationProcess || '',
        officialWebsite: existing.officialWebsite || '',
        isPublished: existing.isPublished,
      });
    }
  }, [existing, reset]);

  const onSubmit = async (values) => {
    const payload = { ...values };
    try {
      if (isEdit) {
        await m.update.mutateAsync({ id, values: payload, file });
        toast.success(t('scheme.form.updated'));
      } else {
        await m.create.mutateAsync({ values: payload, file });
        toast.success(t('scheme.form.created'));
      }
      navigate('/schemes', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('scheme.form.failed'));
    }
  };

  const input =
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';
  const area =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="max-w-2xl">
      <Link
        to="/schemes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('scheme.form.back')}
      </Link>

      <h1 className="mb-4 text-lg font-semibold text-foreground">
        {isEdit ? t('scheme.form.editTitle') : t('scheme.form.createTitle')}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('scheme.form.title')}
          </label>
          <input
            className={input}
            {...register('title', { required: t('scheme.form.required') })}
          />
          {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t('scheme.form.category')}
            </label>
            <select className={input} {...register('category')}>
              {SCHEME_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`scheme.category.${c}`, c)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t('scheme.form.website')}
            </label>
            <input className={input} placeholder="https://…" {...register('officialWebsite')} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('scheme.form.summary')}
          </label>
          <input className={input} maxLength={300} {...register('summary')} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('scheme.form.description')}
          </label>
          <textarea
            rows={5}
            className={area}
            {...register('description', { required: t('scheme.form.required') })}
          />
          {errors.description ? (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('scheme.form.eligibility')}
          </label>
          <textarea rows={3} className={area} {...register('eligibility')} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('scheme.form.requiredDocuments')}
          </label>
          <textarea
            rows={3}
            className={area}
            placeholder={t('scheme.form.docsHint')}
            {...register('requiredDocuments')}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('scheme.form.benefits')}
          </label>
          <textarea rows={3} className={area} {...register('benefits')} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('scheme.form.applicationProcess')}
          </label>
          <textarea rows={3} className={area} {...register('applicationProcess')} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('scheme.form.image')}
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
            {file
              ? file.name
              : existing?.imageUrl
                ? t('scheme.form.replaceImage')
                : t('scheme.form.chooseImage')}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" {...register('isPublished')} />
          {t('scheme.form.publishNow')}
        </label>

        <Button type="submit" disabled={m.create.isPending || m.update.isPending}>
          {m.create.isPending || m.update.isPending ? t('common.loading') : t('scheme.form.save')}
        </Button>
      </form>
    </div>
  );
}
