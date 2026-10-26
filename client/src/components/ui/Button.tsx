import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'light' | 'ghost' | 'danger';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  light: 'btn-light',
  ghost: 'btn-ghost',
  danger: 'btn-danger'
};

export function buttonStyles(
  variant: ButtonVariant = 'primary',
  options: { full?: boolean; small?: boolean; className?: string } = {}
): string {
  return cn(
    variantClasses[variant],
    options.small && 'btn-sm',
    options.full && 'w-full',
    options.className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  small?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading = false, fullWidth, small, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={buttonStyles(variant, { full: fullWidth, small, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});
