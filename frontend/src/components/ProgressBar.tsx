interface ProgressBarProps {
  label: string;
  completed: number;
  total: number;
}

export function ProgressBar({ label, completed, total }: ProgressBarProps) {
  // Guard against division by zero while keeping rendering simple.
  const ratio = total === 0 ? 0 : completed / total;
  const percent = Math.round(ratio * 100);

  return (
    <section className="progress-shell">
      <header className="progress-header">
        <span>{label}</span>
        <span>{completed}/{total}</span>
      </header>
      <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
