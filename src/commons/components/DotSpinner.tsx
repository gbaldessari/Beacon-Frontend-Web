import './DotSpinner.css';

type DotSpinnerProps = {
  label?: string;
  compact?: boolean;
};

export function DotSpinner({ label, compact = false }: DotSpinnerProps) {
  return (
    <span className={`app-ui-spinner${compact ? ' is-compact' : ''}`} role="status" aria-live="polite">
      <span className="app-ui-spinner__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}
