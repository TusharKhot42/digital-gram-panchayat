import { useTranslation } from 'react-i18next';
import { FilePlus, X, FileText, Image as ImageIcon } from 'lucide-react';
import { MAX_CERT_DOCUMENTS, MAX_UPLOAD_SIZE_BYTES } from '@dgp/shared';
import toast from 'react-hot-toast';

/** Supporting-document picker (PDF or image, up to 5). */
export function DocUploader({ files, onChange }) {
  const { t } = useTranslation();

  const handleAdd = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const next = [...files];
    for (const file of picked) {
      if (next.length >= MAX_CERT_DOCUMENTS) {
        toast.error(t('dakhala.form.maxDocs', { count: MAX_CERT_DOCUMENTS }));
        break;
      }
      const ok = file.type.startsWith('image/') || file.type === 'application/pdf';
      if (!ok) {
        toast.error(t('dakhala.form.docType'));
        continue;
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        toast.error(t('dakhala.form.docTooLarge'));
        continue;
      }
      next.push(file);
    }
    onChange(next);
  };

  const removeAt = (idx) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {t('dakhala.form.documents')} ({files.length}/{MAX_CERT_DOCUMENTS})
      </label>

      <ul className="space-y-2">
        {files.map((file, idx) => (
          <li
            key={`${file.name}-${idx}`}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            {file.type === 'application/pdf' ? (
              <FileText className="h-4 w-4 text-primary" />
            ) : (
              <ImageIcon className="h-4 w-4 text-primary" />
            )}
            <span className="flex-1 truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => removeAt(idx)}
              aria-label={t('dakhala.form.removeDoc')}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>

      {files.length < MAX_CERT_DOCUMENTS ? (
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground">
          <FilePlus className="h-4 w-4" />
          {t('dakhala.form.addDoc')}
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={handleAdd}
          />
        </label>
      ) : null}
    </div>
  );
}
