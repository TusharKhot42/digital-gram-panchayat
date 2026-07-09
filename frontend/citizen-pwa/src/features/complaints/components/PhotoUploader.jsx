import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, X } from 'lucide-react';
import { MAX_COMPLAINT_PHOTOS, MAX_UPLOAD_SIZE_BYTES } from '@dgp/shared';
import toast from 'react-hot-toast';

/**
 * Camera/gallery image picker. Enforces max count + size client-side (server re-checks).
 * `capture="environment"` lets phones open the camera directly.
 */
export function PhotoUploader({ files, onChange }) {
  const { t } = useTranslation();
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handleAdd = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const next = [...files];
    for (const file of picked) {
      if (next.length >= MAX_COMPLAINT_PHOTOS) {
        toast.error(t('complaint.form.maxPhotos', { count: MAX_COMPLAINT_PHOTOS }));
        break;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(t('complaint.form.imageOnly'));
        continue;
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        toast.error(t('complaint.form.imageTooLarge'));
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
        {t('complaint.form.photos')} ({files.length}/{MAX_COMPLAINT_PHOTOS})
      </label>

      <div className="flex flex-wrap gap-2">
        {previews.map((src, idx) => (
          <div
            key={src}
            className="relative h-20 w-20 overflow-hidden rounded-md border border-border"
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
              aria-label={t('complaint.form.removePhoto')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {files.length < MAX_COMPLAINT_PHOTOS ? (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px]">{t('complaint.form.addPhoto')}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleAdd}
            />
          </label>
        ) : null}
      </div>
    </div>
  );
}
