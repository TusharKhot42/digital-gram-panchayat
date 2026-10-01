import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ShieldCheck, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegisterAdmin } from './hooks';

export function RegisterAdminDialog({ open, onClose }) {
  const { t } = useTranslation();
  const registerMutation = useRegisterAdmin();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    village: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) {
      setError(t('admins.errors.nameRequired', 'Full name is required'));
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError(t('admins.errors.validEmail', 'Valid email address is required'));
      return;
    }
    if (!form.password || form.password.length < 8) {
      setError(t('admins.errors.passwordLength', 'Password must be at least 8 characters'));
      return;
    }
    if (form.mobile && !/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      setError(t('admins.errors.validMobile', 'Enter a valid 10-digit mobile number'));
      return;
    }

    try {
      await registerMutation.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        mobile: form.mobile.trim() || undefined,
        village: form.village.trim() || undefined,
        address: form.address.trim() || undefined,
      });

      toast.success(t('admins.registeredSuccess', 'Administrator registered successfully!'));
      setForm({
        fullName: '',
        email: '',
        password: '',
        mobile: '',
        village: '',
        address: '',
      });
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        t('admins.registerFailed', 'Failed to register administrator');
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          {t('admins.registerTitle', 'Register New Administrator')}
        </span>
      }
      description={t(
        'admins.registerDesc',
        'Create a verified administrator account. The new administrator will be active immediately and can log in with their email and password.',
      )}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive-strong">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-caption font-semibold text-foreground">
            {t('admins.form.fullName', 'Full Name')} <span className="text-destructive">*</span>
          </label>
          <Input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder={t('admins.form.fullNamePlaceholder', 'e.g. Ramesh S. Patil')}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-caption font-semibold text-foreground">
            {t('admins.form.email', 'Email Address (Login ID)')}{' '}
            <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="officer@dgp.local"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {t('admins.form.emailHint', 'Used by the officer to log in to this admin portal.')}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-caption font-semibold text-foreground">
            {t('admins.form.password', 'Initial Password')}{' '}
            <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={8}
              className="pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('admins.form.passwordHint', 'Minimum 8 characters.')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-caption font-semibold text-foreground">
              {t('admins.form.mobile', 'Mobile Number')}
            </label>
            <Input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="98XXXXXXXX"
              maxLength={10}
            />
          </div>

          <div>
            <label className="mb-1 block text-caption font-semibold text-foreground">
              {t('admins.form.village', 'Designation / Village')}
            </label>
            <Input
              name="village"
              value={form.village}
              onChange={handleChange}
              placeholder={t('admins.form.villagePlaceholder', 'e.g. Gram Sevak / Sakharale')}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-caption font-semibold text-foreground">
            {t('admins.form.address', 'Office / Address (Optional)')}
          </label>
          <Input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder={t('admins.form.addressPlaceholder', 'e.g. Gram Panchayat Office')}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" loading={registerMutation.isPending}>
            <UserPlus className="h-4 w-4" />
            {t('admins.registerBtn', 'Register Administrator')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
