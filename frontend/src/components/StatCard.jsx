import "./StatCard.css";

export default function StatCard({ label, value, tone = "brand" }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
