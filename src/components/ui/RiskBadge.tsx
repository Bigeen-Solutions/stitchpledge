

type RiskLevel = 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const label = level.replace('_', ' ');
  const className = `badge badge-${level.toLowerCase().replace('_', '')}`;
  
  return (
    <span className={className}>
      {label}
    </span>
  );
}
