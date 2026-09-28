import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Droplets, Landmark, CloudRain, CreditCard, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { NOTIFICATION_TYPES } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { controlClass } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { useNotificationMutations } from './hooks';

const CHANNELS = ['inApp', 'sms', 'voice', 'email'];

const TEMPLATES = [
  {
    id: 'water',
    icon: Droplets,
    color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400',
    name: 'पाणी पुरवठा',
    title: 'पाणी पुरवठा तात्पुरता खंडित / Water Supply Notice',
    message: 'ग्रामस्थांना कळविण्यात येते की पाईपलाईन दुरुस्तीच्या कामामुळे उद्या सकाळी ८:०० ते दुपारी १२:०० वाजेपर्यंत पाणी पुरवठा बंद राहील. कृपया आवश्यक साठा करून ठेवावा.',
    type: 'warning',
  },
  {
    id: 'gramsabha',
    icon: Landmark,
    color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400',
    name: 'ग्रामसभा बैठक',
    title: 'महत्त्वाची ग्रामसभा बैठक सूचना / Gram Sabha Meeting Notice',
    message: 'ग्रामपंचायतीच्या वार्षिक ग्रामसभेचे आयोजन पुढील रविवारी सकाळी १०:०० वाजता समाज मंदिर सभागृहात करण्यात आले आहे. सर्व ग्रामस्थांनी आवर्जून उपस्थित राहावे.',
    type: 'info',
  },
  {
    id: 'weather',
    icon: CloudRain,
    color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400',
    name: 'आपत्कालीन इशारा',
    title: 'आपत्कालीन हवामान इशारा / Emergency Weather Alert',
    message: 'हवामान खात्याने परिसरात मुसळधार पावसाचा इशारा दिला आहे. नदीकाठच्या व सकल भागातील ग्रामस्थांनी दक्षता बाळगावी. आपत्कालीन मदतीसाठी ग्रामपंचायतीशी संपर्क साधावा.',
    type: 'urgent',
  },
  {
    id: 'tax',
    icon: CreditCard,
    color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400',
    name: 'कर भरणा मुदत',
    title: 'ग्रामपंचायत कर भरणा स्मरणपत्र / Property Tax Due Reminder',
    message: 'चालू आर्थिक वर्षाचा घरपट्टी व पाणीपट्टी कर भरण्याची मुदत ३१ मार्च रोजी संपत आहे. दंडात्मक कारवाई टाळण्यासाठी ग्रामपंचायत कार्यालयात किंवा ऑनलाईन कर जमा करावा.',
    type: 'info',
  },
];

export function BroadcastForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const m = useNotificationMutations();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetRole, setTargetRole] = useState('citizen');
  const [channels, setChannels] = useState(['inApp', 'sms']);

  const toggle = (ch) =>
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setType(tpl.type);
    toast.success(`'${tpl.name}' साचा निवडला!`);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (title.trim().length < 3 || message.trim().length < 3) {
      toast.error(t('ntf.form.required'));
      return;
    }
    if (channels.length === 0) {
      toast.error(t('ntf.form.pickChannel'));
      return;
    }
    try {
      const res = await m.broadcast.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        type,
        targetRole,
        channels,
      });
      toast.success(t('ntf.form.sent', { count: res.recipientCount }));
      navigate('/notifications', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('ntf.form.failed'));
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link
          to="/notifications"
          className="mb-3 -ml-1 inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('ntf.back')}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('ntf.form.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send urgent emergency alerts or village announcements directly to registered citizens.
        </p>
      </div>

      {/* Quick Emergency Templates Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>त्वरित मराठी साचे / Quick Marathi Templates</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={cn(
                  'flex items-center gap-2 rounded-lg p-2.5 text-left text-xs font-semibold transition-all duration-150 border border-border/60 hover:scale-[1.02]',
                  tpl.color,
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tpl.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="space-y-1.5">
          <label htmlFor="broadcast-subject" className="block text-sm font-semibold text-foreground">
            {t('ntf.form.subject')} <span className="text-destructive">*</span>
          </label>
          <input
            id="broadcast-subject"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={160}
            placeholder="उदा. पाणी पुरवठा तात्पुरता खंडित सूचना"
            className={controlClass}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="broadcast-message" className="block text-sm font-semibold text-foreground">
            {t('ntf.form.message')} <span className="text-destructive">*</span>
          </label>
          <textarea
            id="broadcast-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            placeholder="संदेश तपशील प्रविष्ट करा..."
            className={cn(controlClass, 'h-auto min-h-28 py-2.5')}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="broadcast-type" className="block text-sm font-semibold text-foreground">
              {t('ntf.form.type')}
            </label>
            <select
              id="broadcast-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={controlClass}
            >
              {NOTIFICATION_TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {t(`ntf.type.${ty}`, ty)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="broadcast-target" className="block text-sm font-semibold text-foreground">
              {t('ntf.form.target')}
            </label>
            <select
              id="broadcast-target"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className={controlClass}
            >
              <option value="citizen">{t('ntf.form.citizens')}</option>
              <option value="officer">{t('ntf.form.officers')}</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">{t('ntf.form.channels')}</label>
          <div className="flex flex-wrap gap-3">
            {CHANNELS.map((ch) => (
              <label
                key={ch}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-150',
                  channels.includes(ch)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary',
                )}
              >
                <input
                  type="checkbox"
                  checked={channels.includes(ch)}
                  onChange={() => toggle(ch)}
                  className="rounded border-border"
                />
                <span className="capitalize">{ch}</span>
              </label>
            ))}
          </div>
        </div>

        <p className="rounded-lg bg-warning-subtle p-3 text-xs font-medium text-warning-strong ring-1 ring-inset ring-warning/30">
          {t('ntf.form.costWarning')}
        </p>

        <div className="pt-2">
          <Button type="submit" disabled={m.broadcast.isPending} className="w-full sm:w-auto min-w-40 gap-2">
            <Send className="h-4 w-4" />
            {m.broadcast.isPending ? t('common.loading') : t('ntf.form.send')}
          </Button>
        </div>
      </form>
    </div>
  );
}

