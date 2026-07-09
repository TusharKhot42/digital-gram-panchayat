import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { VALIDATION } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from './FormField';

export function ProfileForm() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: user?.fullName ?? '',
      village: user?.village ?? '',
      address: user?.address ?? '',
      email: user?.email ?? '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await updateProfile(values);
      toast.success(t('auth.profileUpdated'));
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('auth.profileFailed'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-foreground">{t('auth.mobile')}</label>
        <input
          value={user?.mobile ?? ''}
          disabled
          className="h-11 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
        />
      </div>

      <FormField
        label={t('auth.fullName')}
        error={errors.fullName}
        register={register('fullName', {
          required: t('auth.required'),
          minLength: { value: VALIDATION.FULLNAME_MIN_LENGTH, message: t('auth.nameShort') },
        })}
      />
      <FormField
        label={t('auth.village')}
        error={errors.village}
        register={register('village', { required: t('auth.required') })}
      />
      <FormField
        label={t('auth.address')}
        error={errors.address}
        register={register('address', { required: t('auth.required') })}
      />
      <FormField
        label={t('auth.email')}
        type="email"
        error={errors.email}
        register={register('email', {
          pattern: { value: VALIDATION.EMAIL_REGEX, message: t('auth.emailInvalid') },
        })}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('common.loading') : t('auth.saveProfile')}
      </Button>
    </form>
  );
}
