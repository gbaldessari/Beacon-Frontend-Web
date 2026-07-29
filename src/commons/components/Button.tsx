import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import './Button.css';
import { DotSpinner } from './DotSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'text';

/**
 * Props del botón visual común de la aplicación.
 */
type AppButtonProps = PropsWithChildren<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
    variant?: ButtonVariant;
    isLoading?: boolean;
    loadingText?: string;
    loadingIndicator?: ReactNode;
    type?: 'button' | 'submit' | 'reset';
  }
>;

/**
 * Botón reutilizable con variantes visuales y estado de carga accesible.
 */
export function AppButton({
  children,
  variant = 'primary',
  isLoading = false,
  loadingText,
  loadingIndicator,
  className,
  disabled,
  type = 'button',
  ...rest
}: AppButtonProps) {
  const classes = [
    'app-ui-button',
    `app-ui-button--${variant}`,
    isLoading ? 'is-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || isLoading} aria-busy={isLoading} type={type} {...rest}>
      <span className="app-ui-button__content" aria-hidden={isLoading}>
        {children}
      </span>
      {isLoading && (
        <span className="app-ui-button__loading" aria-live="polite">
          {loadingIndicator ?? (loadingText ? <span>{loadingText}</span> : <DotSpinner compact />)}
        </span>
      )}
    </button>
  );
}
