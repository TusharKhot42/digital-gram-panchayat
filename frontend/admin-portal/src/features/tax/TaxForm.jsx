import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { TAX_TYPES } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { taxService } from './taxService';
import { useTaxMutations } from './hooks';

/** Label + control + error, in the order every form on the portal uses. */
function Row({ id, label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-label text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-caption text-destructive-strong">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}

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

  return (
    <div className="max-w-xl">
      <PageHeader backTo="/tax" backLabel={t('tax.form.back')} title={t('tax.form.createTitle')} />

      {/* A bill can't be raised against nobody — the citizen is resolved before the form matters. */}
      <Card className="mb-4">
        <CardContent className="space-y-1.5">
          <label htmlFor="tax-mobile" className="block text-label text-foreground">
            {t('tax.form.citizenMobile')}
          </label>
          <div className="flex gap-2">
            <Input
              id="tax-mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              inputMode="numeric"
              placeholder="9876543210"
            />
            <Button
              type="button"
              variant="outline"
              onClick={lookup}
              loading={lookingUp}
              className="shrink-0"
            >
              {t('tax.form.lookup')}
            </Button>
          </div>
          {citizen ? (
            <p className="flex items-center gap-1.5 pt-1 text-body text-success-strong">
              <UserCheck className="h-4 w-4" aria-hidden="true" />
              {citizen.fullName} · {citizen.mobile}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Row id="tax-type" label={t('tax.form.taxType')}>
                <Select id="tax-type" {...register('taxType')}>
                  {TAX_TYPES.map((tp) => (
                    <option key={tp} value={tp}>
                      {t(`tax.type.${tp}`, tp)}
                    </option>
                  ))}
                </Select>
              </Row>

              <Row id="tax-year" label={t('tax.form.financialYear')} error={errors.financialYear}>
                <Input
                  id="tax-year"
                  placeholder="2025-2026"
                  invalid={Boolean(errors.financialYear)}
                  {...register('financialYear', {
                    required: t('tax.form.required'),
                    pattern: { value: /^\d{4}-\d{4}$/, message: t('tax.form.badYear') },
                  })}
                />
              </Row>
            </div>

            <Row
              id="tax-property"
              label={t('tax.form.propertyNumber')}
              error={errors.propertyNumber}
            >
              <Input
                id="tax-property"
                invalid={Boolean(errors.propertyNumber)}
                {...register('propertyNumber', { required: t('tax.form.required') })}
              />
            </Row>

            <div className="grid grid-cols-2 gap-4">
              <Row id="tax-amount" label={t('tax.form.amount')} error={errors.amount}>
                <Input
                  id="tax-amount"
                  type="number"
                  min="0"
                  invalid={Boolean(errors.amount)}
                  {...register('amount', {
                    required: t('tax.form.required'),
                    min: { value: 0, message: t('tax.form.badAmount') },
                  })}
                />
              </Row>

              <Row id="tax-due" label={t('tax.form.dueDate')}>
                <Input id="tax-due" type="date" {...register('dueDate')} />
              </Row>
            </div>

            <Row id="tax-bills" label={t('tax.form.bills')}>
              <input
                id="tax-bills"
                type="file"
                accept="image/*,application/pdf"
                multiple
                className="block w-full text-body text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-body file:font-medium file:text-foreground hover:file:bg-accent"
                onChange={(e) => setBills(Array.from(e.target.files || []))}
              />
              <p className="text-caption text-muted-foreground">
                {bills.length
                  ? t('tax.form.billsSelected', { count: bills.length })
                  : t('tax.form.billsHint')}
              </p>
            </Row>
          </CardContent>

          <div className="border-t border-border p-4">
            <Button type="submit" loading={m.create.isPending}>
              {t('tax.form.save')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
