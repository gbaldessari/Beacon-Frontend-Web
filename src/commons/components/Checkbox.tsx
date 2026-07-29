import { forwardRef, type InputHTMLAttributes } from 'react';
import './Checkbox.css';

type AppCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const AppCheckbox = forwardRef<HTMLInputElement, AppCheckboxProps>(function AppCheckbox(
  { className, ...rest },
  ref,
) {
  const classes = ['app-ui-checkbox', className].filter(Boolean).join(' ');

  return <input ref={ref} type="checkbox" className={classes} {...rest} />;
});
