import styles from './styles/MetricCard.module.css';

type MetricCardProps = {
  title: string;
  value: string;
};

export const MetricCard = ({ title, value }: MetricCardProps) => {
  return (
    // group is a marker class, not a utility with CSS declarations, so it can’t be used with @apply.
    <div className={`${styles.card} group`}>
      <span className="text-sm text-dashboard-muted group-hover:text-blue-700 dashboard-dark:underline">
        {title}
      </span>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
};
