import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export default function Card({
  children,
  padding = 'md',
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-jet-900 rounded-2xl border border-powder-200 dark:border-jet-700 shadow-sm
        ${
          hoverable
            ? 'hover:shadow-md hover:border-powder-300 hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm transition-all duration-200 ease-out cursor-pointer'
            : 'transition-colors duration-200'
        }
        ${paddingClasses[padding]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
