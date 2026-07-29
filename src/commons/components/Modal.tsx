import type { PropsWithChildren, ReactNode } from 'react';
import './Modal.css';

/**
 * Props del modal base usado por formularios y confirmaciones.
 */
type AppModalProps = PropsWithChildren<{
  open: boolean;
  title?: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  headerAction?: ReactNode;
  className?: string;
}>;

/**
 * Modal accesible con cierre al hacer clic en el overlay.
 */
export function AppModal({
  open,
  title,
  subtitle,
  onClose,
  headerAction,
  className,
  children,
}: AppModalProps) {
  if (!open) {
    return null;
  }

  const modalClasses = ['app-ui-modal', className].filter(Boolean).join(' ');

  return (
    <div className="app-ui-modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={modalClasses} role="dialog" aria-modal="true">
        {(title || subtitle || headerAction) && (
          <div className="app-ui-modal__header">
            <div>
              {title && <h2>{title}</h2>}
              {subtitle && <p>{subtitle}</p>}
            </div>
            {headerAction}
          </div>
        )}
        <div className="app-ui-modal__body">{children}</div>
      </div>
    </div>
  );
}
