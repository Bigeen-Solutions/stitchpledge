import { useMaterials } from '../hooks/useMaterialMutation';
import { Timeline, TimelineItem } from '../../../components/timeline/Timeline.tsx';
import { PhotoGallery } from './PhotoGallery';

interface MaterialEntry {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  quantityDelta?: number;
  reason?: string;
  imgUrl?: string;
}

export function MaterialHistory({ orderId }: { orderId: string }) {
  const { data: ledger, isLoading } = useMaterials(orderId);

  if (isLoading) return <div>Fetching Material Ledger...</div>;

  return (
    <div className="material-history">
      <h3 className="text-h3 mb-lg">Material Intake & Adjustment Ledger</h3>
      <Timeline>
        {ledger?.map((entry: MaterialEntry) => (
          <TimelineItem 
            key={entry.id}
            actor={entry.actor}
            action={
              <div className="ledger-action">
                <span className="font-bold">{entry.action}</span>
                {entry.quantityDelta !== undefined && (
                  <span className={`badge ml-sm ${entry.quantityDelta >= 0 ? 'badge-ontrack' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                    {entry.quantityDelta > 0 ? '+' : ''}{entry.quantityDelta} units
                  </span>
                )}
                {entry.reason && <p className="text-xs text-muted mt-xs italic">"{entry.reason}"</p>}
                {entry.imgUrl && <PhotoGallery photos={[entry.imgUrl]} />}
              </div>
            }
            timestamp={entry.timestamp}
          />
        ))}
        {(!ledger || ledger.length === 0) && <p className="text-muted text-sm">No material transactions recorded.</p>}
      </Timeline>
    </div>
  );
}
