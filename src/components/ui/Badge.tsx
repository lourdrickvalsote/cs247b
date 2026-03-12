import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'forest' | 'powder' | 'lilac' | 'alice' | 'jet';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  active?: boolean;
  onClick?: () => void;
}

const variantClasses: Record<BadgeVariant, { base: string; active: string }> = {
  default: {
    base: 'bg-jet-50 dark:bg-jet-800 text-jet-600 dark:text-jet-300 border-jet-100 dark:border-jet-700',
    active: 'bg-jet text-white border-jet',
  },
  forest: {
    base: 'bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-forest-300 border-forest-100 dark:border-forest-800',
    active: 'bg-forest text-white border-forest',
  },
  powder: {
    base: 'bg-powder-50 dark:bg-powder-950 text-powder-700 dark:text-powder-300 border-powder-200 dark:border-powder-800',
    active: 'bg-powder text-white border-powder',
  },
  lilac: {
    base: 'bg-lilac-50 dark:bg-lilac-950 text-lilac-700 dark:text-lilac-300 border-lilac-200 dark:border-lilac-800',
    active: 'bg-lilac text-white border-lilac',
  },
  jet: {
    base: 'bg-jet-50 dark:bg-jet-800 text-jet-600 dark:text-jet-300 border-jet-100 dark:border-jet-700',
    active: 'bg-jet text-white border-jet',
  },
  alice: {
    base: 'bg-alice-100 dark:bg-alice-950 text-alice-700 dark:text-alice-300 border-alice-200 dark:border-alice-800',
    active: 'bg-alice-600 text-white border-alice-600',
  },
};

export default function Badge({
  children,
  variant = 'default',
  active = false,
  onClick,
}: BadgeProps) {
  const classes = variantClasses[variant];

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5
        text-xs font-semibold rounded-full border
        transition-all duration-200
        ${active ? classes.active : classes.base}
        ${onClick ? 'cursor-pointer hover:shadow-sm active:scale-95' : ''}
      `.trim()}
    >
      {children}
    </span>
  );
}
