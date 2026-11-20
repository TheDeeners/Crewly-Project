import React from 'react'

export type StatusVariant = 'success' | 'pending' | 'rejected' | 'info' | 'neutral'

interface BadgeProps {
  variant?: StatusVariant
  children: React.ReactNode
  dot?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function Badge({
  variant = 'neutral',
  children,
  dot = true,
  className = '',
  size = 'md',
}: BadgeProps) {
  const variantStyles: Record<StatusVariant, { badge: string; dot: string }> = {
    // Success: #16A34A
    success: {
      badge: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
      dot: 'bg-[#16A34A]',
    },
    // Pending: #D97706
    pending: {
      badge: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
      dot: 'bg-[#D97706]',
    },
    // Rejected: #DC2626
    rejected: {
      badge: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
      dot: 'bg-[#DC2626]',
    },
    // Information: #2563EB
    info: {
      badge: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
      dot: 'bg-[#2563EB]',
    },
    // Neutral: #64748B
    neutral: {
      badge: 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
      dot: 'bg-[#64748B]',
    },
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
  }

  const { badge, dot: dotBg } = variantStyles[variant] || variantStyles.neutral

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${badge} ${sizeStyles[size]} transition-colors ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotBg} shrink-0`} />}
      <span>{children}</span>
    </span>
  )
}
