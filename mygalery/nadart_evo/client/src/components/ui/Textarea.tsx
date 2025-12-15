import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-nadart-text-primary text-sm font-medium mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full p-3 bg-nadart-accent text-nadart-text-primary border-none rounded text-base transition-colors duration-300 focus:outline-none focus:bg-nadart-accent-hover placeholder:text-nadart-text-secondary resize-y min-h-[100px] ${error ? 'ring-2 ring-nadart-accent-error' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-nadart-accent-error">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
