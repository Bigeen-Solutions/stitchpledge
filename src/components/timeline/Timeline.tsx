

interface TimelineItemProps {
  actor: string;
  action: React.ReactNode;
  timestamp: string;
  imgUrl?: string;
  children?: React.ReactNode;
}

export function TimelineItem({ actor, action, timestamp, imgUrl, children }: TimelineItemProps) {
  return (
    <div className="timeline-item">
      <div className="timeline-marker"></div>
      <div className="timeline-content sf-card sf-glass">
        <div className="timeline-header">
          <span className="timeline-actor">{actor}</span>
          <span className="timeline-time">{timestamp}</span>
        </div>
        <div className="timeline-action">{action}</div>
        {imgUrl && (
          <div className="evidence-photo">
            <img src={imgUrl} alt="Audit Evidence" loading="lazy" />
          </div>
        )}
        {children && <div className="timeline-custom-content">{children}</div>}
      </div>
    </div>
  );
}

export function Timeline({ children }: { children: React.ReactNode }) {
  return <div className="timeline">{children}</div>;
}
