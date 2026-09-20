import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164E48] disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-[#164E48] text-white hover:bg-[#113e39] shadow-sm',
        teal: 'bg-[#164E48] text-white hover:bg-[#113e39] shadow-sm',
        mint: 'bg-[#E8F4F1] text-[#164E48] hover:bg-[#D2ECE6] border border-[#164E48]/15',
        pink: 'bg-[#E8F4F1] text-[#164E48] hover:bg-[#D2ECE6]',
        accent: 'bg-[#10B981] text-white hover:bg-[#0D6E63] shadow-sm',
        outline: 'border border-[#164E48]/15 bg-white text-[#123B35] hover:bg-[#E8F4F1]',
        ghost: 'text-[#164E48] hover:bg-[#E8F4F1]',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-3.5 py-1.5 text-xs',
        lg: 'h-13 px-7 py-3.5 text-base',
        icon: 'h-10 w-10 p-0 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
