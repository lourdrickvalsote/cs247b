import type { ButtonHTMLAttributes, ReactNode, MouseEvent } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-forest text-white hover:bg-forest-700 hover:-translate-y-[1px] hover:shadow-md active:bg-forest-800 active:translate-y-0 active:shadow-sm shadow-sm btn-ripple',
  secondary:
    'bg-jet text-white hover:bg-jet-800 hover:-translate-y-[1px] hover:shadow-md active:bg-jet-700 active:translate-y-0 active:shadow-sm shadow-sm btn-ripple',
  outline:
    'border-2 border-powder bg-transparent text-jet dark:text-jet-200 hover:bg-powder-50 hover:border-powder-300 active:bg-powder-100',
  ghost:
    'bg-transparent text-jet dark:text-jet-200 hover:bg-jet-50 active:bg-jet-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

function setRippleOrigin(e: MouseEvent<HTMLButtonElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty('--ripple-x', `${x}%`);
  e.currentTarget.style.setProperty('--ripple-y', `${y}%`);
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  onMouseDown,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-forest/30 focus:ring-offset-2 dark:focus:ring-offset-jet-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        active:scale-[0.97]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
      disabled={disabled}
      onMouseDown={(e) => {
        setRippleOrigin(e);
        onMouseDown?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
