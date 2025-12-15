import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-nadart-text-primary text-sm font-medium mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full p-3 bg-nadart-accent text-nadart-text-primary border-none rounded text-base transition-colors duration-300 focus:outline-none focus:bg-nadart-accent-hover placeholder:text-nadart-text-secondary ${error ? 'ring-2 ring-nadart-accent-error' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-nadart-accent-error">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
