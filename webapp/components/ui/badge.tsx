import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[#BFDCD6] text-[#123B35]',
        teal: 'bg-[#17665B] text-white',
        accent: 'bg-[#3E9C87]/15 text-[#17665B]',
        pink: 'bg-[#F7DDE5] text-[#C85C82]',
        warning: 'bg-[#E7A23B]/15 text-[#B87514]',
        outline: 'border border-[#DDE7E3] text-[#66736F]',
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
