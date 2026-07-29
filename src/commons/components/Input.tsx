import { forwardRef, type InputHTMLAttributes } from 'react';
import './Field.css';

type AppInputProps = InputHTMLAttributes<HTMLInputElement>;

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(function AppInput(
  { className, ...rest },
  ref,
) {
  const classes = ['app-ui-field', className].filter(Boolean).join(' ');

  return <input ref={ref} className={classes} {...rest} />;
});
