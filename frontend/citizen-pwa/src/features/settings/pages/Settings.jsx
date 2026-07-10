import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Moon, Sun, Bell, HelpCircle, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, useLanguage } from '@/store';
import { NotificationPrefs } from '@/features/settings/NotificationPrefs';
import { replayOnboarding } from '@/features/onboarding/useOnboarding';

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

const FAQ_KEYS = ['offline', 'complaint', 'language', 'install'];

export function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-4 py-6">
      <h1 className="text-lg font-semibold text-foreground">{t('settings.title')}</h1>

      {/* Language */}
      <Section icon={Languages} title={t('settings.language')}>
        <div className="grid grid-cols-2 gap-2">
          {[
            { code: 'mr', label: 'मराठी' },
            { code: 'en', label: 'English' },
          ].map((l) => (
            <Button
              key={l.code}
              variant={language === l.code ? 'default' : 'outline'}
              onClick={() => setLanguage(l.code)}
            >
              {l.label}
            </Button>
          ))}
        </div>
      </Section>

      {/* Theme */}
      <Section icon={theme === 'dark' ? Moon : Sun} title={t('settings.theme')}>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'light', label: t('settings.light'), Icon: Sun },
            { value: 'dark', label: t('settings.dark'), Icon: Moon },
          ].map((opt) => (
            <Button
              key={opt.value}
              variant={theme === opt.value ? 'default' : 'outline'}
              onClick={() => setTheme(opt.value)}
            >
              <opt.Icon className="h-4 w-4" />
              {opt.label}
            </Button>
          ))}
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title={t('settings.notifications')}>
        <NotificationPrefs />
      </Section>

      {/* Help & FAQ */}
      <Section icon={HelpCircle} title={t('settings.help')}>
        <p className="mb-3 text-sm text-muted-foreground">{t('settings.helpBody')}</p>
        <div className="divide-y divide-border border-t border-border">
          {FAQ_KEYS.map((key) => {
            const isOpen = openFaq === key;
            return (
              <div key={key}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-foreground"
                  onClick={() => setOpenFaq(isOpen ? null : key)}
                >
                  {t(`settings.faq.${key}.q`)}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="pb-3 text-sm text-muted-foreground">{t(`settings.faq.${key}.a`)}</p>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Replay onboarding */}
      <Section icon={RotateCcw} title={t('settings.onboarding')}>
        <p className="mb-3 text-sm text-muted-foreground">{t('settings.onboardingBody')}</p>
        <Button variant="outline" onClick={replayOnboarding}>
          <RotateCcw className="h-4 w-4" />
          {t('settings.replay')}
        </Button>
      </Section>
    </div>
  );
}
