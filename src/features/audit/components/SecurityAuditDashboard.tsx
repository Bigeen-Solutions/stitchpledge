import React from 'react';
import { usePermissions, Capability } from '../../auth/use-permissions';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import AlarmOnOutlined from '@mui/icons-material/AlarmOnOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../infrastructure/http/axios.client';

export const SecurityAuditDashboard: React.FC = () => {
  const { hasCapability } = usePermissions();

  // Gate: Owner-only capability required.
  if (!hasCapability(Capability.VIEW_AUDIT_LOGS)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ShieldOutlined sx={{ fontSize: 64, color: '#d1d5db', marginBottom: 2 }} />
        <h2 className="text-h2 text-gray-900">Access Restricted</h2>
        <p className="text-body text-gray-600 max-w-md">
          You do not have the required authorization to view security audit logs.
          This attempt has been logged for the Master Tailor.
        </p>
      </div>
    );
  }

  const { data: logs, isLoading } = useQuery({
    queryKey: ['security-audit'],
    queryFn: async () => {
      const res = await apiClient.get('/audit/security-violations');
      return res.data;
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
          <ShieldOutlined sx={{ fontSize: 24 }} />
        </div>
        <div>
          <h1 className="text-h1">Security Perimeter Audit</h1>
          <p className="text-sm text-gray-500">Read-only projection of unauthorized system interactions</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Attempted Capability</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Resource</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  Synchronizing Security Logs...
                </td>
              </tr>
            ) : logs?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No security violations recorded.
                </td>
              </tr>
            ) : (
              logs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <PersonOutlined sx={{ fontSize: 14, color: '#9ca3af' }} />
                      <span className="text-sm font-medium font-mono">{log.userId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-rose-50 text-rose-700 rounded text-xs font-bold border border-rose-100">
                      {log.capability}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {log.resourceId ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
                      <AlarmOnOutlined sx={{ fontSize: 14 }} />
                      DENIED
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
