import { useState } from 'react';
import { useOrders } from '../hooks/useOrders.ts';
import { WorkshopTableSkeleton } from '../../../components/ui/WorkshopTableSkeleton.tsx';
import { ErrorState } from '../../../components/feedback/ErrorState.tsx';
import { EditOrderModal } from './EditOrderModal.tsx';
import { OrderEntryItem } from './OrderEntryItem.tsx';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';

export function OrdersList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  const { data: orders, isLoading, isError, error, refetch } = useOrders(page, 10);

  if (isLoading) {
    return (
      <div className="orders-ledger">
        <div className="flex justify-between items-center mb-md px-md">
          <h2 className="text-h2">Active Order Overview</h2>
          <div className="text-sm text-black">Synchronizing Order Ledger...</div>
        </div>
        <WorkshopTableSkeleton headers={['Order #', 'Customer', 'Garment', 'Deadline', 'Risk State']} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState 
        error={error} 
        onRetry={() => refetch()} 
        title="Ledger Synchronization Failed"
      />
    );
  }

  return (
    <div className="orders-ledger">
      <div className="flex justify-between items-center mb-md px-md">
        <h2 className="text-h2">Production Ledger</h2>
        <div className="text-sm text-black">High-fidelity projection of workshop workload</div>
      </div>
      
      <Box sx={{ px: 2, mb: 4 }}>
        <Stack spacing={0}>
          {orders?.items?.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', p: 4, textAlign: 'center' }}>
              No orders found in the ledger.
            </Typography>
          ) : (
            orders?.items?.map(order => (
              <OrderEntryItem 
                key={order.id} 
                order={order} 
                onClick={() => navigate(`/orders/${order.id}`)}
              />
            ))
          )}
        </Stack>
      </Box>

      <div className="flex justify-between items-center" style={{ marginTop: 'var(--space-md)', padding: '0 var(--space-md)' }}>
        <button 
          className="btn btn-secondary text-sm" 
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          &larr; Previous
        </button>
        <span className="text-sm font-medium text-muted">
          Page {page} of {orders?.totalPages || 1}
        </span>
        <button 
          className="btn btn-secondary text-sm"
          disabled={!orders?.totalPages || page === orders.totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next &rarr;
        </button>
      </div>

      {editingOrder && (
        <EditOrderModal 
          open={!!editingOrder} 
          onClose={() => setEditingOrder(null)} 
          order={editingOrder} 
        />
      )}

      <style>{`
        .ledger-row {
          transition: background-color 0.2s ease;
        }
        .ledger-row.risk-overdue {
          background-color: rgba(220, 38, 38, 0.02);
        }
        .ledger-row.risk-atrisk {
          background-color: rgba(245, 158, 11, 0.02);
        }
        .ledger-row:hover {
          background-color: var(--color-bg) !important;
        }
        .deadline-dominant {
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
