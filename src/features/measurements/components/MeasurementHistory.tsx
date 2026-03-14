import { useMeasurements } from '../hooks/useMeasurementMutation';
import { Timeline, TimelineItem } from '../../../components/timeline/Timeline.tsx';

interface MeasurementVersion {
  id: string;
  actor: string;
  version: number;
  timestamp: string;
  changes: string;
}

export function MeasurementHistory({ orderId }: { orderId: string }) {
  const { data: versions, isLoading } = useMeasurements(orderId);

  if (isLoading) return <div>Synchronizing Measurement Archive...</div>;

  return (
    <div className="measurement-history">
      <h3 className="text-h3 mb-lg">Measurement Version History</h3>
      <Timeline>
        {versions?.map((v: MeasurementVersion) => (
          <TimelineItem 
            key={v.id}
            actor={v.actor}
            action={`Recorded Version ${v.version}: ${v.changes}`}
            timestamp={v.timestamp}
          />
        ))}
        {(!versions || versions.length === 0) && <p className="text-muted text-sm">No measurements recorded yet.</p>}
      </Timeline>
    </div>
  );
}
