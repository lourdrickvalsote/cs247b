import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonVariant = 'default' | 'primary' | 'ghost';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  label: string;
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-9 h-9 [&>svg]:w-4 [&>svg]:h-4',
  md: 'w-12 h-12 [&>svg]:w-5 [&>svg]:h-5',
  lg: 'w-14 h-14 [&>svg]:w-6 [&>svg]:h-6',
};

const variantClasses: Record<IconButtonVariant, string> = {
  default:
    'bg-white dark:bg-jet-800 border border-powder-200 dark:border-jet-600 text-jet dark:text-jet-200 hover:bg-powder-50 dark:hover:bg-jet-700 hover:border-powder-300 hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0',
  primary:
    'bg-forest text-white hover:bg-forest-700 hover:shadow-md shadow-sm hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm',
  ghost:
    'bg-transparent text-jet-600 dark:text-jet-300 hover:bg-jet-50 dark:hover:bg-jet-800',
};

export default function IconButton({
  children,
  size = 'md',
  variant = 'default',
  label,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`
        inline-flex items-center justify-center rounded-full
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-forest/30 focus:ring-offset-2 dark:focus:ring-offset-jet-900
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        [&>svg]:transition-transform [&>svg]:duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
