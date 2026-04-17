export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <article className="mgt-stat-card">
      <span className="mgt-stat-card__label">{label}</span>
      <strong className="mgt-stat-card__value">{value}</strong>
      {hint ? <p className="mgt-stat-card__hint">{hint}</p> : null}
    </article>
  );
}
