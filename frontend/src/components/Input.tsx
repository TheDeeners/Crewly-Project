import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  id,
  className = '',
  ...rest
}: InputProps) {
  const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-txt">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-txt-muted pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-surface text-txt border rounded-xl px-3.5 py-2 text-sm transition-all duration-150 placeholder:text-txt-light focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            leftIcon ? 'pl-10' : ''
          } ${
            error
              ? 'border-status-rejected focus:border-status-rejected focus:ring-status-rejected/20'
              : 'border-border hover:border-border-dark focus:border-primary'
          } ${className}`}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-status-rejected font-medium mt-0.5">{error}</p>}
      {!error && helperText && <p className="text-xs text-txt-muted mt-0.5">{helperText}</p>}
    </div>
  )
}
