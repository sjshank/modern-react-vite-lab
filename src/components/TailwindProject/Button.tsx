import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
};

const defaultClassName =
  'rounded-dashboard-card px-4 py-2 font-semibold focus-visible:dashboard-focus hover:brightness-90 aria-pressed:ring-2 aria-pressed:ring-offset-2 m-1';

const defaultVariant = 'primary';

export const Button = ({
  variant = defaultVariant,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={`${defaultClassName}  ${variant === 'primary' ? 'bg-blue-500 text-white' : variant === 'secondary' ? 'bg-gray-500 text-white' : ''}`}
    >
      {children}
    </button>
  );
};
