import { useState, useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useLogin, useForgotPassword, useGoogleLogin } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

// Google Sign-In types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              width?: number
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
            }
          ) => void
        }
      }
    }
  }
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type LoginFormData = z.infer<typeof loginSchema>
type ForgotFormData = z.infer<typeof forgotSchema>

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { mutate: login, isPending: loginPending, error: loginError } = useLogin()
  const { mutate: forgotPassword, isPending: forgotPending, isSuccess: forgotSuccess } = useForgotPassword()
  const { mutate: googleLogin, isPending: googlePending, error: googleError } = useGoogleLogin()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const forgotForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  // Initialize Google Sign-In
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
      console.warn('Google Client ID not configured')
      return
    }

    const initializeGoogle = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              googleLogin(response.credential)
            }
          },
        })

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 360,
          text: 'signin_with',
        })
      }
    }

    // Wait for Google script to load
    if (window.google) {
      initializeGoogle()
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle)
          initializeGoogle()
        }
      }, 100)

      // Clean up after 5 seconds if Google doesn't load
      setTimeout(() => clearInterval(checkGoogle), 5000)
    }
  }, [googleLogin])

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const onLogin = (data: LoginFormData) => {
    login(data)
  }

  const onForgot = (data: ForgotFormData) => {
    forgotPassword(data.email)
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const isGoogleConfigured = clientId && clientId !== 'your-google-client-id.apps.googleusercontent.com'

  return (
    <div className="min-h-screen bg-nadart-bg-primary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none">
            {/* Easel legs */}
            <line x1="25" y1="90" x2="40" y2="45" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
            <line x1="75" y1="90" x2="60" y2="45" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="90" x2="50" y2="55" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
            {/* Canvas frame */}
            <rect x="20" y="10" width="60" height="45" rx="2" fill="#F5F0E6" stroke="#D4AF37" strokeWidth="2" />
            {/* Abstract art on canvas */}
            <circle cx="35" cy="28" r="8" fill="#E8B4B8" opacity="0.9" />
            <circle cx="55" cy="35" r="10" fill="#87CEEB" opacity="0.7" />
            <circle cx="65" cy="22" r="6" fill="#98D8AA" opacity="0.8" />
            {/* Canvas support bar */}
            <line x1="25" y1="55" x2="75" y2="55" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="font-dancing text-4xl text-nadart-text-primary">NadArt</span>
        </Link>

        <div className="card p-8">
          {mode === 'login' ? (
            <>
              <h1 className="text-2xl font-semibold text-nadart-text-primary text-center mb-6">
                Admin Login
              </h1>

              {/* Google Sign-In Button */}
              {isGoogleConfigured && (
                <>
                  <div
                    ref={googleButtonRef}
                    className="flex justify-center mb-4"
                  />

                  {googlePending && (
                    <p className="text-sm text-nadart-text-secondary text-center mb-4">
                      Signing in with Google...
                    </p>
                  )}

                  {googleError && (
                    <p className="text-sm text-nadart-accent-error text-center mb-4">
                      {(googleError as Error).message || 'Google sign-in failed'}
                    </p>
                  )}

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-nadart-accent/30" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-nadart-bg-secondary text-nadart-text-muted">
                        or sign in with email
                      </span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="admin@example.com"
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register('password')}
                />

                {loginError && (
                  <p className="text-sm text-nadart-accent-error">
                    {(loginError as Error).message || 'Invalid email or password'}
                  </p>
                )}

                <Button type="submit" className="w-full" isLoading={loginPending}>
                  Login
                </Button>
              </form>

              <button
                onClick={() => setMode('forgot')}
                className="w-full mt-4 text-sm text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
              >
                Forgot password?
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-nadart-text-primary text-center mb-6">
                Reset Password
              </h1>

              {forgotSuccess ? (
                <div className="text-center">
                  <i className="fas fa-check-circle text-4xl text-nadart-accent-success mb-4" />
                  <p className="text-nadart-text-secondary mb-4">
                    If an account exists with that email, you will receive a password reset link.
                  </p>
                  <Button onClick={() => setMode('login')} variant="secondary">
                    Back to Login
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-nadart-text-secondary text-sm mb-6 text-center">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="admin@example.com"
                      error={forgotForm.formState.errors.email?.message}
                      {...forgotForm.register('email')}
                    />

                    <Button type="submit" className="w-full" isLoading={forgotPending}>
                      Send Reset Link
                    </Button>
                  </form>

                  <button
                    onClick={() => setMode('login')}
                    className="w-full mt-4 text-sm text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
                  >
                    Back to Login
                  </button>
                </>
              )}
            </>
          )}
        </div>

        <p className="text-center mt-6 text-nadart-text-secondary text-sm">
          <Link to="/" className="hover:text-nadart-text-primary transition-colors">
            ← Back to Gallery
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
