import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { VALIDATION } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

/** Label + control + error, wired so the error is announced rather than only shown in red. */
function Row({ id, label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-label text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-caption text-destructive-strong">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Row id="login-email" label={t('auth.email')} error={errors.email}>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          {...register('email', {
            required: t('auth.required'),
            pattern: { value: VALIDATION.EMAIL_REGEX, message: t('auth.emailInvalid') },
          })}
        />
      </Row>

      <Row id="login-password" label={t('auth.password')} error={errors.password}>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'login-password-error' : undefined}
          {...register('password', { required: t('auth.required') })}
        />
      </Row>

      <Button type="submit" className="w-full" loading={isSubmitting}>
        {t('auth.login')}
      </Button>
    </form>
  );
}
