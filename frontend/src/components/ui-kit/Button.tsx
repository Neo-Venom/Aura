import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'accent' | 'soft' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'bg-accent-strong text-white hover:brightness-110 shadow-lift',
  accent: 'bg-accent text-on-accent hover:brightness-105 shadow-soft',
  soft: 'bg-soft text-ink hover:bg-line',
  ghost: 'bg-transparent text-ink hover:bg-soft',
  outline: 'bg-surface text-ink border border-line hover:border-lavender',
  danger: 'bg-danger text-white hover:brightness-110',
};
const sizes: Record<Size, string> = {
  sm: 'min-h-[44px] px-4 text-sm',
  md: 'min-h-[48px] px-6 text-base',
  lg: 'min-h-[56px] px-8 text-lg',
  icon: 'h-11 w-11 p-0',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props }, ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold select-none',
        'transition-[background-color,filter,transform,box-shadow,border-color] duration-200 ease-out active:scale-[0.98]',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant], sizes[size], className,
      )}
      {...props}
    />
  );
});
