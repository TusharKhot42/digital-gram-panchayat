import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.svg';

/** Boot gate shown by App.tsx for a beat before the router mounts. Not a routed page. */
export function Splash() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <motion.img
        src={logo}
        alt={t('appName')}
        width={96}
        height={96}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold text-foreground">{t('appName')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('splash.tagline')}</p>
      </motion.div>
    </div>
  );
}
