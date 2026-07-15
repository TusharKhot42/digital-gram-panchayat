import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilePlus, X, FileText } from 'lucide-react';
import { MAX_CERT_DOCUMENTS, MAX_UPLOAD_SIZE_BYTES } from '@dgp/shared';
import toast from 'react-hot-toast';

const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

/**
 * Uploader for ONE required document group (e.g. "Identity proof"). The citizen picks which
 * document they are attaching (`docType`, constrained to the group's allowed list) and adds one
 * or more PDF/JPG/PNG files. Count/size/type limits mirror the server's.
 *
 * @param {{ group: {key:string, anyOf:string[], required:boolean},
 *           entries: Array<{file: File, group: string, docType: string}>,
 *           totalCount: number, onAdd: Function, onRemove: Function }} props
 */
export function DocUploader({ group, entries, totalCount, onAdd, onRemove }) {
  const { t } = useTranslation();
  const [docType, setDocType] = useState(group.anyOf[0]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = entries.map((e) =>
      e.file.type.startsWith('image/') ? URL.createObjectURL(e.file) : null,
    );
    setPreviews(urls);
    return () => urls.forEach((u) => u && URL.revokeObjectURL(u));
  }, [entries]);

  const handleAdd = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const accepted = [];
    let room = MAX_CERT_DOCUMENTS - totalCount;

    for (const file of picked) {
      if (room <= 0) {
        toast.error(t('dakhala.form.maxDocs', { count: MAX_CERT_DOCUMENTS }));
        break;
      }
      if (!ACCEPTED.includes(file.type)) {
        toast.error(t('dakhala.form.docType'));
        continue;
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        toast.error(t('dakhala.form.docTooLarge'));
        continue;
      }
      accepted.push(file);
      room -= 1;
    }
    if (accepted.length) onAdd(accepted, docType);
  };

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-foreground">
          {t(`dakhala.docGroup.${group.key}`, group.key)}
          {group.required ? <span className="text-destructive"> *</span> : null}
        </label>
        <span className="text-xs text-muted-foreground">{entries.length}</span>
      </div>

      <select
        value={docType}
        onChange={(e) => setDocType(e.target.value)}
        aria-label={t('dakhala.form.chooseDocType')}
        className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
      >
        {group.anyOf.map((d) => (
          <option key={d} value={d}>
            {t(`dakhala.doc.${d}`, d)}
          </option>
        ))}
      </select>

      {entries.length ? (
        <ul className="space-y-2">
          {entries.map((entry, idx) => (
            <li
              key={`${entry.file.name}-${idx}`}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-sm"
            >
              {previews[idx] ? (
                <img src={previews[idx]} alt="" className="h-9 w-9 rounded object-cover" />
              ) : (
                <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{entry.file.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {t(`dakhala.doc.${entry.docType}`, entry.docType)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(entry)}
                aria-label={t('dakhala.form.removeDoc')}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {totalCount < MAX_CERT_DOCUMENTS ? (
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground">
          <FilePlus className="h-4 w-4" />
          {t('dakhala.form.addDoc')}
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={handleAdd}
          />
        </label>
      ) : null}
    </div>
  );
}
