import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { CERT_TYPES, CERT_TYPE_FIELDS, CERT_DOC_REQUIREMENTS } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { DocUploader } from '../components/DocUploader';
import { useApplyCertificate } from '../hooks';

export function ApplyCertificate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [certificateType, setCertificateType] = useState('Residence');
  // One flat list of { file, group, docType } — the server needs files + positional metadata.
  const [docs, setDocs] = useState([]);
  const applyMutation = useApplyCertificate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fields = CERT_TYPE_FIELDS[certificateType] || [];
  const requirements = CERT_DOC_REQUIREMENTS[certificateType] || [];

  const onTypeChange = (e) => {
    setCertificateType(e.target.value);
    reset({});
    setDocs([]); // required documents differ per type
  };

  const onSubmit = async (values) => {
    // Client-side mirror of the server's required-document rule.
    const missing = requirements.filter(
      (g) => g.required && !docs.some((d) => d.group === g.key && g.anyOf.includes(d.docType)),
    );
    if (missing.length) {
      toast.error(t('dakhala.form.missingDocs'));
      return;
    }
    try {
      const created = await applyMutation.mutateAsync({
        certificateType,
        applicationData: values,
        documents: docs.map((d) => d.file),
        documentMeta: docs.map((d) => ({ group: d.group, docType: d.docType })),
      });
      toast.success(t('dakhala.form.submitted', { id: created.applicationId }));
      navigate(`/dakhala/${created.id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('dakhala.form.failed'));
    }
  };

  const inputClass =
    'h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <Link
        to="/dakhala"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('dakhala.form.back')}
      </Link>
      <h1 className="mb-4 text-lg font-semibold text-foreground">{t('dakhala.form.title')}</h1>

      <div className="mb-4 space-y-1">
        <label className="block text-sm font-medium text-foreground">
          {t('dakhala.form.type')}
        </label>
        <select value={certificateType} onChange={onTypeChange} className={inputClass}>
          {CERT_TYPES.map((c) => (
            <option key={c} value={c}>
              {t(`dakhala.type.${c}`, c)}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t(`dakhala.field.${field.key}`, field.label)}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register(field.key, { required: field.required && t('dakhala.form.required') })}
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                className={inputClass}
                {...register(field.key, { required: field.required && t('dakhala.form.required') })}
              />
            )}
            {errors[field.key] ? (
              <p className="text-xs text-destructive">{errors[field.key].message}</p>
            ) : null}
          </div>
        ))}

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">{t('dakhala.form.documents')}</p>
          {requirements.map((group) => (
            <DocUploader
              key={group.key}
              group={group}
              entries={docs.filter((d) => d.group === group.key)}
              totalCount={docs.length}
              onAdd={(files, docType) =>
                setDocs((prev) => [
                  ...prev,
                  ...files.map((file) => ({ file, group: group.key, docType })),
                ])
              }
              onRemove={(entry) => setDocs((prev) => prev.filter((d) => d !== entry))}
            />
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={applyMutation.isPending}>
          {applyMutation.isPending ? t('common.loading') : t('dakhala.form.submit')}
        </Button>
      </form>
    </div>
  );
}
