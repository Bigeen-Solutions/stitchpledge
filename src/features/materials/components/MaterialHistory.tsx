import { useMaterials } from '../../orders/hooks/useOrderDetail.ts';
import { Timeline, TimelineItem } from '../../../components/timeline/Timeline.tsx';

interface MaterialEntry {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

export function MaterialHistory({ orderId }: { orderId: string }) {
  const { data: ledger, isLoading } = useMaterials(orderId);

  if (isLoading) return <div>Fetching Material Ledger...</div>;

  return (
    <div className="material-history">
      <h3 className="text-h3 mb-lg">Material Intake Ledger</h3>
      <Timeline>
        {ledger?.map((entry: MaterialEntry) => (
          <TimelineItem 
            key={entry.id}
            actor={entry.actor}
            action={entry.action}
            timestamp={entry.timestamp}
          />
        ))}
        {(!ledger || ledger.length === 0) && <p className="text-muted text-sm">No material logs found for this order.</p>}
      </Timeline>
    </div>
  );
}
