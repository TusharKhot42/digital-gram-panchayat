import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareWarning, FileText, WifiOff, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SLIDES = [
  { key: 'complaints', Icon: MessageSquareWarning },
  { key: 'services', Icon: FileText },
  { key: 'offline', Icon: WifiOff },
];

/**
 * First-run intro carousel. Three slides covering complaints, services and offline use.
 * Shown once (persisted) and re-openable from Settings → Replay onboarding.
 */
export function Onboarding({ onFinish }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;
  const { key, Icon } = SLIDES[index];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background px-8 text-center">
      <button
        type="button"
        onClick={onFinish}
        className="absolute right-4 top-4 text-sm text-muted-foreground"
      >
        {t('onboarding.skip')}
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10">
            <Icon className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t(`onboarding.${key}.title`)}</h2>
          <p className="max-w-xs text-sm text-muted-foreground">{t(`onboarding.${key}.body`)}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <span
            key={s.key}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-6 bg-primary' : 'w-2 bg-muted'
            }`}
          />
        ))}
      </div>

      <Button
        className="w-full max-w-xs"
        onClick={() => (last ? onFinish() : setIndex((i) => i + 1))}
      >
        {last ? t('onboarding.start') : t('onboarding.next')}
        {!last && <ChevronRight className="h-4 w-4" />}
      </Button>
    </div>
  );
}
