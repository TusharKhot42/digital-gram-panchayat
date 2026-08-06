import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldX, Search, ArrowLeft } from 'lucide-react';
import { formatDate } from '@dgp/shared';
import logo from '@dgp/shared/assets/logo.svg';
import { SafeImage } from '@/components/SafeImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { controlClass } from '@/components/ui/input';
import { verifyService } from '@/features/verify/verifyService';

/**
 * Public certificate verification page. Reached two ways:
 *  - `/verify/:id`  — the opaque verificationId encoded in a certificate's QR code (auto-checks)
 *  - `/verify`      — a manual "enter certificate number" search
 * No authentication: anyone can confirm a certificate is genuine.
 */
export function VerifyCertificate() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [number, setNumber] = useState('');
  const [submitted, setSubmitted] = useState('');

  // QR path: auto-verify by id. Manual path: verify by the submitted certificate number.
  const byId = useQuery({
    queryKey: ['verify', 'id', id],
    queryFn: () => verifyService.byId(id),
    enabled: Boolean(id),
  });
  const byNumber = useQuery({
    queryKey: ['verify', 'number', submitted],
    queryFn: () => verifyService.byNumber(submitted),
    enabled: Boolean(submitted),
  });

  useEffect(() => {
    document.title = t('verify.title');
  }, [t]);

  const query = id ? byId : byNumber;
  const result = query.data;
  const searching = query.isFetching;

  const submit = (e) => {
    e.preventDefault();
    if (number.trim()) setSubmitted(number.trim());
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center gap-2.5 px-4 py-3">
          <SafeImage src={logo} alt="" className="h-8 w-8 rounded" />
          <p className="text-section text-foreground">{t('verify.title')}</p>
          <Link
            to="/welcome"
            className="ml-auto inline-flex items-center gap-1 text-caption font-medium text-primary hover:text-primary-hover"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t('verify.home')}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-title text-foreground">{t('verify.heading')}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t('verify.intro')}</p>

        {/* Manual search — only when not arriving via a QR link. */}
        {!id ? (
          <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="cert-number" className="sr-only">
              {t('verify.numberLabel')}
            </label>
            <input
              id="cert-number"
              className={controlClass}
              placeholder={t('verify.numberPlaceholder')}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
            <Button type="submit" loading={searching} className="shrink-0">
              <Search className="h-4 w-4" aria-hidden="true" />
              {t('verify.check')}
            </Button>
          </form>
        ) : null}

        {searching ? (
          <p className="mt-6 text-body text-muted-foreground" role="status">
            {t('verify.checking')}
          </p>
        ) : null}

        {result && !searching ? (
          <Card className="mt-6">
            <CardContent className="p-6">
              {result.valid ? (
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-subtle text-success-strong">
                    <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-section text-foreground">{t('verify.valid')}</h2>
                      <Chip color="green">{t('verify.genuine')}</Chip>
                    </div>
                    <dl className="mt-3 space-y-1.5">
                      <Row label={t('verify.field.type')}>
                        {t(`dakhala.type.${result.certificateType}`, result.certificateType)}
                      </Row>
                      {result.applicantName ? (
                        <Row label={t('verify.field.applicant')}>{result.applicantName}</Row>
                      ) : null}
                      <Row label={t('verify.field.number')}>{result.certificateNumber}</Row>
                      {result.issuedAt ? (
                        <Row label={t('verify.field.issued')}>
                          {formatDate(result.issuedAt, locale)}
                        </Row>
                      ) : null}
                    </dl>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive-subtle text-destructive-strong">
                    <ShieldX className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-section text-foreground">{t('verify.invalid')}</h2>
                    <p className="mt-1 text-body text-muted-foreground">
                      {t('verify.invalidHint')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="text-right text-caption font-medium text-foreground">{children}</dd>
    </div>
  );
}
