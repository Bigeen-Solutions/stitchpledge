

type RiskLevel = 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const label = level.replace('_', ' ').toUpperCase();
  const className = `badge badge-${level.toLowerCase().replace('_', '')}`;
  
  return (
    <span className={className} style={{ transition: 'all 0.2s ease' }}>
      {label}
    </span>
  );
}
