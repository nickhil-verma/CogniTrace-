import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17665B] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-[#17665B] text-white hover:bg-[#123B35] shadow-sm',
        teal: 'bg-[#17665B] text-white hover:bg-[#123B35] shadow-sm',
        mint: 'bg-[#BFDCD6] text-[#123B35] hover:bg-[#a9d1c9]',
        pink: 'bg-[#F7DDE5] text-[#C85C82] hover:bg-[#f2cbda]',
        accent: 'bg-[#3E9C87] text-white hover:bg-[#348674]',
        outline: 'border border-[#DDE7E3] bg-white text-[#123B35] hover:bg-[#F5F8F6]',
        ghost: 'text-[#123B35] hover:bg-[#BFDCD6]/30',
        danger: 'bg-red-500 text-white hover:bg-red-600',
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
