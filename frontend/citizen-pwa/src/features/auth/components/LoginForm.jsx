import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { VALIDATION } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from './FormField';

export function LoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success(t('auth.loginSuccess'));
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('auth.loginFailed'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label={t('auth.mobile')}
        type="tel"
        inputMode="numeric"
        error={errors.mobile}
        register={register('mobile', {
          required: t('auth.required'),
          pattern: { value: VALIDATION.MOBILE_REGEX, message: VALIDATION.MOBILE_MESSAGE },
        })}
      />
      <FormField
        label={t('auth.password')}
        type="password"
        error={errors.password}
        register={register('password', { required: t('auth.required') })}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        {t('auth.login')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary">
          {t('auth.register')}
        </Link>
      </p>
    </form>
  );
}
