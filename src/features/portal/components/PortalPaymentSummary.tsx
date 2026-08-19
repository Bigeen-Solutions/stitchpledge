import { useQuery } from '@tanstack/react-query';
import { portalApi } from '../portal.api';
import { formatNaira } from '../../orders/payments.api';

interface Props {
  portalToken: string;
}

export function PortalPaymentSummary({ portalToken }: Props) {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['portal', portalToken, 'payments'],
    queryFn: () => portalApi.getPaymentSummary(portalToken),
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  if (isLoading || !summary) return null;

  const progressPct =
    summary.totalAgreed && summary.totalAgreed > 0
      ? Math.min(100, (summary.totalPaid / summary.totalAgreed) * 100)
      : null;

  return (
    <div className="sf-card">
      <h3 className="text-h3 mb-lg">Payment Summary</h3>

      <div className="grid grid-cols-2 gap-lg mb-lg">
        <div>
          <p className="text-xs text-muted uppercase mb-xs">Amount Paid</p>
          <p className="text-h2 font-bold" style={{ color: '#1e5c3a' }}>
            {formatNaira(summary.totalPaid)}
          </p>
        </div>
        {summary.totalAgreed !== null && (
          <div>
            <p className="text-xs text-muted uppercase mb-xs">Total Agreed</p>
            <p className="text-h2 font-bold">{formatNaira(summary.totalAgreed)}</p>
          </div>
        )}
      </div>

      {progressPct !== null && (
        <div className="mb-lg">
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: '#e5e0d8',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPct}%`,
                background: '#1e5c3a',
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <p className="text-xs text-muted mt-xs">{Math.round(progressPct)}% settled</p>
        </div>
      )}

      {summary.outstandingBalance > 0 && (
        <div
          style={{
            background: '#fff8e6',
            border: '1px solid #f5c842',
            borderRadius: 8,
            padding: '10px 14px',
          }}
        >
          <p className="text-xs uppercase font-bold mb-xs" style={{ color: '#92680a' }}>
            Remaining Balance
          </p>
          <p className="font-bold" style={{ color: '#92680a', fontSize: '1.1rem' }}>
            {formatNaira(summary.outstandingBalance)}
          </p>
        </div>
      )}

      {summary.outstandingBalance === 0 && summary.totalPaid > 0 && (
        <div
          style={{
            background: '#f0faf4',
            border: '1px solid #1e5c3a',
            borderRadius: 8,
            padding: '10px 14px',
          }}
        >
          <p className="text-xs font-bold" style={{ color: '#1e5c3a' }}>
            Payment complete — thank you!
          </p>
        </div>
      )}
    </div>
  );
}
