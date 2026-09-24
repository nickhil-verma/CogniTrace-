import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#164E48] tracking-micro uppercase',
  {
    variants: {
      variant: {
        default: 'bg-[#E8F4F1] text-[#164E48] border border-[#164E48]/10',
        teal: 'bg-[#164E48] text-white shadow-xs',
        accent: 'bg-[#10B981]/15 text-[#0D6E63] border border-[#10B981]/30',
        pink: 'bg-[#E8F4F1] text-[#164E48] border border-[#164E48]/10',
        warning: 'bg-amber-500/15 text-amber-800 border border-amber-500/30',
        outline: 'border border-[#164E48]/15 text-[#123B35]',
        lavender: 'bg-[#F5F3FF] text-[#4338CA] border border-[#C7D2FE]',
        periwinkle: 'bg-[#4F46E5] text-white shadow-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
