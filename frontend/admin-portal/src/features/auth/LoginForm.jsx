import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { VALIDATION } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export function LoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success(t('auth.loginSuccess'));
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('auth.loginFailed'));
    }
  };

  const inputClass = (hasError) =>
    cn(
      'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
      hasError && 'border-destructive focus-visible:ring-destructive',
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-foreground">{t('auth.email')}</label>
        <input
          type="email"
          className={inputClass(errors.email)}
          {...register('email', {
            required: t('auth.required'),
            pattern: { value: VALIDATION.EMAIL_REGEX, message: t('auth.emailInvalid') },
          })}
        />
        {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-foreground">{t('auth.password')}</label>
        <input
          type="password"
          className={inputClass(errors.password)}
          {...register('password', { required: t('auth.required') })}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t('auth.signingIn') : t('auth.login')}
      </Button>
    </form>
  );
}
