import { RiskBadge } from './RiskBadge';

interface DeadlineCardProps {
  orderId: string;
  deadline: string;
  riskLevel: 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';
  customer: string;
}

export function DeadlineCard({ orderId, deadline, riskLevel, customer }: DeadlineCardProps) {
  const riskClass = riskLevel.toLowerCase().replace('_', '');
  
  return (
    <div className={`sf-card deadline-card ${riskClass}`}>
      <div className="flex justify-between items-center mb-lg">
        <span className="text-xs text-muted font-bold">ORDER #{orderId}</span>
        <RiskBadge level={riskLevel} />
      </div>
      <div className="deadline-dominant mb-lg">
        {deadline}
      </div>
      <div className="text-sm text-muted">
        Customer: <span className="text-primary font-bold">{customer}</span>
      </div>
    </div>
  );
}
