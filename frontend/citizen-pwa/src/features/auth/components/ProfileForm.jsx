import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { VALIDATION, WARD_DETAILS } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { controlClass } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from './FormField';

export function ProfileForm() {
  const { t, i18n } = useTranslation();
  const { user, updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: user?.fullName ?? '',
      village: user?.village ?? '',
      ward: user?.ward ?? '',
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
      {/* Mobile is the account identity and can't be edited here — shown for confirmation only. */}
      <div className="space-y-1.5">
        <label htmlFor="profile-mobile" className="block text-label text-foreground">
          {t('auth.mobile')}
        </label>
        <input
          id="profile-mobile"
          value={user?.mobile ?? ''}
          disabled
          className={cn(controlClass, 'bg-muted text-muted-foreground')}
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
      <div className="space-y-1.5">
        <label htmlFor="profile-ward" className="block text-label text-foreground">
          {t('auth.ward', 'Ward (Prabhag)')}
        </label>
        <select id="profile-ward" className={cn(controlClass)} {...register('ward')}>
          <option value="">{t('auth.selectWard', 'Select Ward (1 to 6)')}</option>
          {WARD_DETAILS.map((w) => (
            <option key={w.id} value={w.id}>
              {i18n.language === 'mr' ? w.name_mr : w.name_en}
            </option>
          ))}
        </select>
      </div>
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

      <Button type="submit" loading={isSubmitting}>
        {t('auth.saveProfile')}
      </Button>
    </form>
  );
}
