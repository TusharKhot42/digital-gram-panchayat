import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { VALIDATION, WARD_DETAILS } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { controlClass } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from './FormField';

export function RegisterForm() {
  const { t, i18n } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      toast.success(t('auth.registerSuccess'));
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('auth.registerFailed'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label={t('auth.fullName')}
        error={errors.fullName}
        register={register('fullName', {
          required: t('auth.required'),
          minLength: { value: VALIDATION.FULLNAME_MIN_LENGTH, message: t('auth.nameShort') },
        })}
      />
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
        register={register('password', {
          required: t('auth.required'),
          minLength: { value: VALIDATION.PASSWORD_MIN_LENGTH, message: t('auth.passwordShort') },
        })}
      />
      <FormField
        label={t('auth.village')}
        error={errors.village}
        register={register('village', { required: t('auth.required') })}
      />
      <div className="space-y-1.5">
        <label htmlFor="register-ward" className="block text-label text-foreground">
          {t('auth.ward', 'Ward (Prabhag)')} *
        </label>
        <select
          id="register-ward"
          className={cn(
            controlClass,
            errors.ward && 'border-destructive focus-visible:ring-destructive',
          )}
          {...register('ward', { required: t('auth.wardRequired', 'Please select your ward') })}
        >
          <option value="">{t('auth.selectWard', 'Select Ward (1 to 6)')}</option>
          {WARD_DETAILS.map((w) => (
            <option key={w.id} value={w.id}>
              {i18n.language === 'mr' ? w.name_mr : w.name_en}
            </option>
          ))}
        </select>
        {errors.ward && (
          <p role="alert" className="text-caption text-destructive-strong">
            {errors.ward.message}
          </p>
        )}
      </div>
      <FormField
        label={t('auth.address')}
        error={errors.address}
        register={register('address', { required: t('auth.required') })}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        {t('auth.register')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-medium text-primary">
          {t('auth.login')}
        </Link>
      </p>
    </form>
  );
}
