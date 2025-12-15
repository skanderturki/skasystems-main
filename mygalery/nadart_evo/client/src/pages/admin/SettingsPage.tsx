import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useChangePassword } from '../../hooks/useAuth'
import { useAuthStore } from '../../stores/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const changePassword = useChangePassword()
  const [successMessage, setSuccessMessage] = useState('')

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = (data: PasswordFormData) => {
    setSuccessMessage('')
    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          setSuccessMessage('Password changed successfully!')
          form.reset()
        },
      }
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-nadart-text-primary mb-8">Settings</h1>

      <div className="max-w-xl space-y-8">
        {/* Account Info */}
        <div className="card p-6">
          <h2 className="text-xl font-medium text-nadart-text-primary mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-nadart-text-muted">Email</label>
              <p className="text-nadart-text-primary">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card p-6">
          <h2 className="text-xl font-medium text-nadart-text-primary mb-4">Change Password</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              error={form.formState.errors.currentPassword?.message}
              {...form.register('currentPassword')}
            />
            <Input
              label="New Password"
              type="password"
              error={form.formState.errors.newPassword?.message}
              {...form.register('newPassword')}
            />
            <Input
              label="Confirm New Password"
              type="password"
              error={form.formState.errors.confirmPassword?.message}
              {...form.register('confirmPassword')}
            />

            {changePassword.error && (
              <p className="text-sm text-nadart-accent-error">
                {(changePassword.error as Error).message || 'Failed to change password'}
              </p>
            )}

            {successMessage && (
              <p className="text-sm text-nadart-accent-success">{successMessage}</p>
            )}

            <Button type="submit" isLoading={changePassword.isPending}>
              Change Password
            </Button>
          </form>
        </div>

        {/* About */}
        <div className="card p-6">
          <h2 className="text-xl font-medium text-nadart-text-primary mb-4">About</h2>
          <p className="text-nadart-text-secondary text-sm">
            NadArt Gallery Management System v1.0.0
          </p>
          <p className="text-nadart-text-muted text-xs mt-2">
            Built with React, Express, and SQLite
          </p>
        </div>
      </div>
    </div>
  )
}
