import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import { NOTICE_CATEGORIES, SMS_SUMMARY_MAX_LENGTH } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useNotice, useNoticeMutations } from './hooks';

export function NoticeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const { data: existing } = useNotice(id);
  const m = useNoticeMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { category: 'General', isPublished: false } });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        summary: existing.summary || '',
        content: existing.content,
        category: existing.category,
        expiryDate: existing.expiryDate ? existing.expiryDate.slice(0, 10) : '',
        isPublished: existing.isPublished,
      });
    }
  }, [existing, reset]);

  const onSubmit = async (values) => {
    const payload = { ...values };
    if (payload.expiryDate) payload.expiryDate = new Date(payload.expiryDate).toISOString();
    try {
      if (isEdit) {
        await m.update.mutateAsync({ id, values: payload, file });
        toast.success(t('notice.form.updated'));
      } else {
        await m.create.mutateAsync({ values: payload, file });
        toast.success(t('notice.form.created'));
      }
      navigate('/notices', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('notice.form.failed'));
    }
  };

  const inputClass =
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="max-w-2xl">
      <Link
        to="/notices"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('notice.form.back')}
      </Link>

      <h1 className="mb-4 text-lg font-semibold text-foreground">
        {isEdit ? t('notice.form.editTitle') : t('notice.form.createTitle')}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('notice.form.title')}
          </label>
          <input
            className={inputClass}
            {...register('title', { required: t('notice.form.required') })}
          />
          {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('notice.form.summary')}
          </label>
          <input
            className={inputClass}
            maxLength={SMS_SUMMARY_MAX_LENGTH}
            {...register('summary')}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('notice.form.content')}
          </label>
          <textarea
            rows={6}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('content', { required: t('notice.form.required') })}
          />
          {errors.content ? (
            <p className="text-xs text-destructive">{errors.content.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t('notice.form.category')}
            </label>
            <select className={inputClass} {...register('category')}>
              {NOTICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`notice.category.${c}`, c)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t('notice.form.expiry')}
            </label>
            <input type="date" className={inputClass} {...register('expiryDate')} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('notice.form.attachment')}
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground">
            <Paperclip className="h-4 w-4" />
            {file
              ? file.name
              : existing?.attachmentUrl
                ? t('notice.form.replaceFile')
                : t('notice.form.chooseFile')}
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" {...register('isPublished')} />
          {t('notice.form.publishNow')}
        </label>

        <Button type="submit" disabled={m.create.isPending || m.update.isPending}>
          {m.create.isPending || m.update.isPending ? t('common.loading') : t('notice.form.save')}
        </Button>
      </form>
    </div>
  );
}
