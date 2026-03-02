import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000000] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[#000000] text-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:opacity-85',
        destructive:
          'bg-[#EF4444] text-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:opacity-85',
        outline:
          'border border-[rgba(39,39,42,0.25)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:bg-[#FAFAFA] hover:border-[rgba(39,39,42,0.3)]',
        secondary:
          'bg-[#FAFAFA] text-[#000000] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:bg-[#F4F4F5]',
        ghost: 'hover:bg-[#FAFAFA] hover:text-[#000000]',
        link: 'text-[#000000] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
