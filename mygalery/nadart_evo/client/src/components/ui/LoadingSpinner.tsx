interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export default function LoadingSpinner({ size = 'md', fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-nadart-accent border-t-nadart-text-primary rounded-full animate-spin`}
    />
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-nadart-bg-primary flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
