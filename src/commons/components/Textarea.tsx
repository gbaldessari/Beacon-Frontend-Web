import { forwardRef, type TextareaHTMLAttributes } from 'react';
import './Field.css';

type AppTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(function AppTextarea(
  { className, ...rest },
  ref,
) {
  const classes = ['app-ui-field', className].filter(Boolean).join(' ');

  return <textarea ref={ref} className={classes} {...rest} />;
});
