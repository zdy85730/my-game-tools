import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonTone = 'primary' | 'secondary';

interface ButtonBaseProps {
  children: ReactNode;
  tone: ButtonTone;
  fullWidth?: boolean;
}

type ButtonProps = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href?: string;
  };

function getButtonClassName(tone: ButtonTone, fullWidth?: boolean, className?: string) {
  return [
    'mgt-button',
    tone === 'primary' ? 'mgt-button--primary' : 'mgt-button--secondary',
    fullWidth ? 'mgt-button--full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

function BaseButton({ children, tone, fullWidth, href, className, ...rest }: ButtonProps) {
  const buttonClassName = getButtonClassName(tone, fullWidth, className);

  if (href) {
    return (
      <a {...rest} className={buttonClassName} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button {...rest} className={buttonClassName} type={rest.type ?? 'button'}>
      {children}
    </button>
  );
}

export function PrimaryButton(props: Omit<ButtonProps, 'tone'>) {
  return <BaseButton {...props} tone="primary" />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'tone'>) {
  return <BaseButton {...props} tone="secondary" />;
}
