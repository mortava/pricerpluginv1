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
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border border-[rgba(39,39,42,0.3)] bg-white px-3 py-2 text-sm transition-[border-color] duration-150',
            'placeholder:text-[#A1A1AA]',
            'focus:outline-none focus:ring-2 focus:ring-[#000000] focus:ring-offset-2 focus:border-[#000000]',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#FAFAFA]',
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
