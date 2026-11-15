import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn.ts';

type ButtonVariant = 'primary' | 'secondary' | 'danger-outline' | 'link' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 px-4 py-2',
  secondary: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 px-4 py-2',
  'danger-outline': 'border border-red-300 bg-white text-red-700 hover:bg-red-50 px-4 py-2',
  link: 'text-blue-600 hover:underline',
  ghost: 'text-gray-700 hover:bg-gray-100 px-4 py-2',
};

export function Button({ variant = 'secondary', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
