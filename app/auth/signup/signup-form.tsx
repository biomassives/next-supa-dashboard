'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createClient } from '@/supabase/client'
import { useAuth } from '@/hooks/use-auth'

// Enhanced password validation
const passwordSchema = z
  .string()
  .nonempty('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must not exceed 72 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

const FormSchema = z
  .object({
    email: z
      .string()
      .nonempty('Email is required')
      .email('Invalid email format')
      .max(255, 'Email must not exceed 255 characters')
      .transform(val => val.toLowerCase().trim()),
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema,
  })
  .refine((val) => val.newPassword === val.confirmNewPassword, {
    path: ['confirmNewPassword'],
    params: { i18n: 'invalid_confirm_password' },
  })

type FormValues = z.infer<typeof FormSchema>

const defaultValues: Partial<FormValues> = {
  email: '',
  newPassword: '',
  confirmNewPassword: '',
}






// Password strength indicator
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const strength = React.useMemo(() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }, [password])

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 w-full rounded ${
              i < strength ? 'bg-green-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {strength === 0 && 'Very weak'}
        {strength === 1 && 'Weak'}
        {strength === 2 && 'Fair'}
        {strength === 3 && 'Good'}
        {strength === 4 && 'Strong'}
        {strength === 5 && 'Very strong'}
      </p>
    </div>
  )
}

const SignUpForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues,
  })

  const password = form.watch('newPassword')

  return (
    <Form {...form}>
      <form method="POST" noValidate className="space-y-4">
        <EmailField />
        <NewPasswordField />
        <PasswordStrengthIndicator password={password} />
        <ConfirmNewPasswordField />
        <SubmitButton />
      </form>
    </Form>
  )
}

const EmailField = () => {
  const { t } = useTranslation()
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name="email"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{t('email')}</FormLabel>
          <FormControl>
            <Input
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              placeholder="name@example.com"
              className={fieldState.error ? 'border-red-500' : ''}
              {...field}
            />
          </FormControl>
          <FormDescription>
            You'll need to verify this email
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

const NewPasswordField = () => {
  const { t } = useTranslation()
  const { control } = useFormContext()
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <FormField
      control={control}
      name="newPassword"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{t('password')}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete="new-password"
                autoCorrect="off"
                placeholder={t('password')}
                className={fieldState.error ? 'border-red-500' : ''}
                {...field}
              />
            </FormControl>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <FormDescription>
            Must include uppercase, lowercase, number and special character
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

const ConfirmNewPasswordField = () => {
  const { t } = useTranslation()
  const { control } = useFormContext()
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <FormField
      control={control}
      name="confirmNewPassword"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{t('confirm_password')}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete="new-password"
                autoCorrect="off"
                placeholder={t('confirm_password')}
                className={fieldState.error ? 'border-red-500' : ''}
                {...field}
              />
            </FormControl>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

const SubmitButton = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { handleSubmit, setError, getValues } = useFormContext()
  const { setSession, setUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const { handleSubmit, setError, getValues, formState } = useFormContext() // Added formState here

  const onSubmit = async () => {
    try {
      setIsSubmitting(true)
      const formValues = getValues()

      // Log signup attempt (excluding password)
      console.log('Attempting signup:', { 
        email: formValues?.email,
        timestamp: new Date().toISOString()
      })

      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formValues?.email,
        password: formValues?.newPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirmed: false,
            signup_date: new Date().toISOString()
          }
        }
      })

      if (error) {
        console.error('Signup error:', {
          code: error.status,
          message: error.message,
          timestamp: new Date().toISOString()
        })
        throw error
      }

      if (data?.user) {
        console.log('Signup successful:', {
          userId: data.user.id,
          timestamp: new Date().toISOString()
        })

        // Sign out after successful registration
        const unsigned = await supabase.auth.signOut()
        if (unsigned?.error) throw new Error(unsigned?.error?.message)

        setSession(null)
        setUser(null)

        toast.success(t('you_have_successfully_registered_as_a_member'))
        router.refresh()
        router.replace('/auth/signin')
      }
    } catch (e: unknown) {
      const err = (e as Error)?.message
      console.error('Signup error details:', {
        error: err,
        timestamp: new Date().toISOString()
      })

      if (err.includes('already registered')) {
        setError('email', {
          message: t('user_already_registered'),
        })
      } else if (err.includes('password')) {
        setError('newPassword', {
          message: err
        })
      } else {
        toast.error(typeof err === 'string' ? err : 'Signup failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button
      type="submit"
      onClick={handleSubmit(onSubmit)}
      disabled={isSubmitting || !formState.isValid}
      className="w-full"
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⌛</span>
          {t('creating_account')}
        </span>
      ) : (
        t('signup')
      )}
    </Button>
  )
}

export { SignUpForm }