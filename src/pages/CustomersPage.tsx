import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../features/customers/hooks/useCustomers';
import { WorkshopTable } from '../components/ui/WorkshopTable';
import { WorkshopTableSkeleton } from '../components/ui/WorkshopTableSkeleton';
import { ErrorState } from '../components/feedback/ErrorState';
import { CircularProgress, Typography, Box } from '@mui/material';
import { usePullToRefresh } from '../hooks/usePullToRefresh.ts';

export function CustomersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, error, refetch } = useCustomers(page, limit, debouncedSearch);

  const { refreshing, pullDelta } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    }
  });

  if (isError) {
    return (
      <div className="container mt-xl">
        <ErrorState 
          error={error} 
          onRetry={() => refetch()} 
          title="Failed to load customers"
        />
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="customers-page container" style={{ position: 'relative' }}>
      {/* Pull to Refresh Indicator */}
      <div 
        style={{ 
          position: 'absolute', 
          top: -40, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'center',
          transform: `translateY(${Math.min(pullDelta, 100)}px)`,
          opacity: pullDelta > 20 ? 1 : 0,
          transition: refreshing ? 'transform 0.2s' : 'none',
          zIndex: 10
        }}
      >
        <CircularProgress 
          size={24} 
          thickness={6} 
          value={refreshing ? undefined : Math.min((pullDelta / 80) * 100, 100)}
          variant={refreshing ? "indeterminate" : "determinate"}
          sx={{ color: '#1e5c3a' }}
        />
      </div>

      <header className="mb-lg flex justify-between items-end">
        <div>
          <Typography 
            variant="h3" 
            className="mobile-page-title md:text-h1"
            sx={{ 
              fontSize: { xs: '1.25rem', md: 'clamp(1.5rem, 4vw, 2.5rem)' },
              fontWeight: 800,
              lineHeight: 1.2 
            }}
          >
            Client CRM
          </Typography>
          <p className="text-black text-sm md:text-base">Manage your customer relationships and order history</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert('New Client feature coming soon!')}>
          + New Client
        </button>
      </header>

      <div className="sf-glass p-lg mb-lg flex justify-between items-center" style={{ borderRadius: 'var(--radius-card)' }}>
        <div className="search-container flex-1 mr-lg">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="sf-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>
        <div className="text-sm font-medium text-black">
          {data ? `Showing ${data.items.length} of ${data.total} clients` : 'Loading...'}
        </div>
      </div>

      <section className="sf-card" style={{ padding: 'var(--space-lg)' }}>
        {isLoading ? (
          <WorkshopTableSkeleton headers={['Name', 'Contact Info', 'Total Orders', 'Last Active', 'Actions']} />
        ) : data?.items.length === 0 ? (
          <div className="text-center p-xxl">
            <p className="text-lg text-black mb-md">No clients found matching "{debouncedSearch}"</p>
            <button className="btn btn-secondary" onClick={() => setSearchTerm('')}>Clear Search</button>
          </div>
        ) : (
          <>
            <WorkshopTable headers={['Name', 'Contact Info', 'Total Orders', 'Last Active', 'Actions']}>
              {data?.items.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="font-bold text-black">{customer.name}</div>
                    <div className="text-xs text-black opacity-60">ID: {customer.id.split('-')[0]}</div>
                  </td>
                  <td>
                    <div className="text-sm text-black">{customer.email || 'No Email'}</div>
                    <div className="text-xs text-black opacity-70">{customer.phone || 'No Phone'}</div>
                  </td>
                  <td>
                    <div className="badge badge-secondary">{customer.totalOrders} Orders</div>
                  </td>
                  <td className="text-black">
                    {customer.lastOrderDate 
                      ? new Date(customer.lastOrderDate).toLocaleDateString() 
                      : 'Never'}
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </WorkshopTable>

            {/* Pagination Implementation */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-md mt-lg">
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                
                <div className="flex gap-xs items-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setPage(p)}
                      style={{ minWidth: '32px', padding: '0' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <style>{`
        .sf-input {
          padding: var(--space-sm) var(--space-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-pill);
          font-family: inherit;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }
        .sf-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .badge-secondary {
          background: rgba(30, 92, 58, 0.1);
          color: var(--color-primary);
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
