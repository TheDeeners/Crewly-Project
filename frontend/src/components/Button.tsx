import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5',
  }

  const variantClasses = {
    // Primary #7F1D3A
    primary:
      'bg-primary text-white hover:bg-primary-hover active:bg-primary-dark shadow-sm hover:shadow focus:ring-primary/40',
    // Secondary #A83255
    secondary:
      'bg-secondary text-white hover:bg-secondary-hover active:bg-primary shadow-sm hover:shadow focus:ring-secondary/40',
    // Outline: border #E8DDD9 or #7F1D3A
    outline:
      'bg-white text-txt border border-border hover:bg-bg hover:border-primary/40 text-txt active:bg-bg-subtle focus:ring-primary/20',
    // Danger: Status Red #DC2626
    danger:
      'bg-status-rejected text-white hover:bg-red-700 active:bg-red-800 shadow-sm focus:ring-status-rejected/40',
    // Success: Status Green #16A34A
    success:
      'bg-status-success text-white hover:bg-green-700 active:bg-green-800 shadow-sm focus:ring-status-success/40',
    // Ghost
    ghost:
      'bg-transparent text-txt-muted hover:text-txt hover:bg-bg active:bg-bg-subtle focus:ring-primary/20',
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-0.5 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>กำลังโหลด...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}
