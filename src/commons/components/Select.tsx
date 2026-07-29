import { forwardRef, type SelectHTMLAttributes } from 'react';
import './Field.css';

type AppSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(function AppSelect(
  { className, children, ...rest },
  ref,
) {
  const classes = ['app-ui-field', className].filter(Boolean).join(' ');

  return (
    <select ref={ref} className={classes} {...rest}>
      {children}
    </select>
  );
});
