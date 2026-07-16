import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { VALIDATION, ROLES } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/features/auth/authService';
import { FormField } from './FormField';

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

/**
 * The one login page for the whole system. Accepts a mobile number or an email address
 * plus password; the backend answers with the JWT and the account's role, and the browser
 * is routed by role — citizens stay in this PWA, officers are handed to the admin portal
 * with the token in the URL fragment (never sent to any server, stripped on arrival).
 */
export function LoginForm() {
  const { t } = useTranslation();
  const { adoptSession } = useAuth();
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
      const { user, token } = await authService.loginSession(values);

      if (user.role === ROLES.OFFICER) {
        // Officer: this app never stores the session — hand it to the admin portal.
        window.location.replace(`${ADMIN_URL}/auth/callback#token=${encodeURIComponent(token)}`);
        return;
      }

      adoptSession(user, token);
      toast.success(t('auth.loginSuccess'));
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('auth.loginFailed'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label={t('auth.identifier')}
        type="text"
        autoComplete="username"
        error={errors.identifier}
        register={register('identifier', {
          required: t('auth.required'),
          validate: (value) =>
            VALIDATION.MOBILE_REGEX.test(value.trim()) ||
            VALIDATION.EMAIL_REGEX.test(value.trim()) ||
            t('auth.identifierInvalid'),
        })}
      />
      <FormField
        label={t('auth.password')}
        type="password"
        autoComplete="current-password"
        error={errors.password}
        register={register('password', { required: t('auth.required') })}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        {t('auth.login')}
      </Button>

      <p className="text-center text-body text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary">
          {t('auth.register')}
        </Link>
      </p>
    </form>
  );
}
