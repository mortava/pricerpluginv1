import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm transition-all duration-150',
            'placeholder:text-[#9CA3AF]',
            'focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2 focus:border-[#171717]',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F4F4F5]',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
