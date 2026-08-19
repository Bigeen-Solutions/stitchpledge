import { useMutation, useQueryClient } from '@tanstack/react-query';
import { portalDesignBriefApi } from '../../orders/design-brief.api';
import type { CustomerOrderProjection } from '../../customer/customer.api';

interface Props {
  portalToken: string;
  brief: CustomerOrderProjection['designBriefs'][number];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const FIELDS: [string, keyof CustomerOrderProjection['designBriefs'][number]][] = [
  ['Silhouette', 'silhouette'],
  ['Neckline', 'neckline'],
  ['Waist Detail', 'waistDetail'],
  ['Back Finish', 'backFinish'],
];

export function PortalDesignBriefConfirm({ portalToken, brief }: Props) {
  const queryClient = useQueryClient();
  const queryKey = ['customer', 'order', portalToken];

  const confirmMutation = useMutation({
    mutationFn: () => portalDesignBriefApi.confirm(portalToken, brief.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  if (brief.confirmedByCustomerAt) {
    return (
      <div className="sf-card" style={{ borderTop: '2px solid #1e5c3a' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 0',
            color: '#1e5c3a',
          }}
        >
          <span style={{ fontSize: 22 }}>&#10003;</span>
          <p className="font-bold" style={{ color: '#1e5c3a', margin: 0 }}>
            You confirmed your design brief on {formatDate(brief.confirmedByCustomerAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sf-card" style={{ borderTop: '2px solid #c49a1a' }}>
      <h3 className="text-h3 mb-lg">Please review and confirm your design brief</h3>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
        {FIELDS.filter(([, key]) => brief[key]).map(([label, key]) => (
          <li key={key} style={{ marginBottom: 10, fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 700, color: '#6b7280' }}>{label}: </span>
            {String(brief[key])}
          </li>
        ))}
        {brief.additionalNotes && (
          <li style={{ marginBottom: 10, fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 700, color: '#6b7280' }}>Additional Notes: </span>
            {brief.additionalNotes}
          </li>
        )}
      </ul>

      <button
        onClick={() => confirmMutation.mutate()}
        disabled={confirmMutation.isPending}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 24px',
          borderRadius: 8,
          border: 'none',
          background: '#1e5c3a',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: confirmMutation.isPending ? 'not-allowed' : 'pointer',
          opacity: confirmMutation.isPending ? 0.6 : 1,
        }}
      >
        {confirmMutation.isPending ? 'Confirming…' : 'Confirm Design Brief'}
      </button>

      {confirmMutation.isError && (
        <p style={{ color: '#c0392b', fontSize: '0.85rem', marginTop: 8 }}>
          Failed to confirm. Please try again.
        </p>
      )}
    </div>
  );
}
