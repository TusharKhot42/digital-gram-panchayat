import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { TAX_TYPES } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { taxService } from './taxService';
import { useTaxMutations } from './hooks';

export function TaxForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState(null);
  const [mobile, setMobile] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [bills, setBills] = useState([]);
  const m = useTaxMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { taxType: 'Property', financialYear: '2025-2026' } });

  const lookup = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error(t('tax.form.badMobile'));
      return;
    }
    setLookingUp(true);
    try {
      const found = await taxService.lookupCitizen(mobile);
      setCitizen(found);
    } catch (err) {
      setCitizen(null);
      toast.error(err.response?.data?.error?.message || t('tax.form.citizenNotFound'));
    } finally {
      setLookingUp(false);
    }
  };

  const onSubmit = async (values) => {
    if (!citizen) {
      toast.error(t('tax.form.lookupFirst'));
      return;
    }
    try {
      await m.create.mutateAsync({
        values: { ...values, citizenId: citizen.id, amount: Number(values.amount) },
        files: bills,
      });
      toast.success(t('tax.form.created'));
      navigate('/tax', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('tax.form.failed'));
    }
  };

  const input =
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="max-w-xl">
      <Link to="/tax" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        {t('tax.form.back')}
      </Link>
      <h1 className="mb-4 text-lg font-semibold text-foreground">{t('tax.form.createTitle')}</h1>

      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <label className="mb-1 block text-sm font-medium text-foreground">
          {t('tax.form.citizenMobile')}
        </label>
        <div className="flex gap-2">
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputMode="numeric"
            className={input}
            placeholder="9876543210"
          />
          <Button type="button" variant="outline" onClick={lookup} disabled={lookingUp}>
            {lookingUp ? t('common.loading') : t('tax.form.lookup')}
          </Button>
        </div>
        {citizen ? (
          <p className="mt-2 flex items-center gap-1 text-sm text-green-700 dark:text-green-300">
            <UserCheck className="h-4 w-4" />
            {citizen.fullName} · {citizen.mobile}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t('tax.form.taxType')}
            </label>
            <select className={input} {...register('taxType')}>
              {TAX_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {t(`tax.type.${tp}`, tp)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t('tax.form.financialYear')}
            </label>
            <input
              className={input}
              placeholder="2025-2026"
              {...register('financialYear', {
                required: t('tax.form.required'),
                pattern: { value: /^\d{4}-\d{4}$/, message: t('tax.form.badYear') },
              })}
            />
            {errors.financialYear ? (
              <p className="text-xs text-destructive">{errors.financialYear.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('tax.form.propertyNumber')}
          </label>
          <input
            className={input}
            {...register('propertyNumber', { required: t('tax.form.required') })}
          />
          {errors.propertyNumber ? (
            <p className="text-xs text-destructive">{errors.propertyNumber.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t('tax.form.amount')}
            </label>
            <input
              type="number"
              min="0"
              className={input}
              {...register('amount', {
                required: t('tax.form.required'),
                min: { value: 0, message: t('tax.form.badAmount') },
              })}
            />
            {errors.amount ? (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t('tax.form.dueDate')}
            </label>
            <input type="date" className={input} {...register('dueDate')} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">{t('tax.form.bills')}</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:text-foreground"
            onChange={(e) => setBills(Array.from(e.target.files || []))}
          />
          {bills.length ? (
            <p className="text-xs text-muted-foreground">
              {t('tax.form.billsSelected', { count: bills.length })}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{t('tax.form.billsHint')}</p>
          )}
        </div>

        <Button type="submit" disabled={m.create.isPending}>
          {m.create.isPending ? t('common.loading') : t('tax.form.save')}
        </Button>
      </form>
    </div>
  );
}
