import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ScrollText, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api/services.api';
import { Pagination } from '../../components/ui/Pagination';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { RoleBadge } from '../../components/ui/Badge';
import { format } from 'date-fns';

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  LOGOUT: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  CREATE_SERVICE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  UPDATE_SERVICE: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  DELETE_SERVICE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  APPROVE_SERVICE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  REJECT_SERVICE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  UPDATE_USER_ROLE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
};

export const LogsPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'logs', page],
    queryFn: () => adminApi.getLogs({ page, limit: 20 }).then((r) => r.data),
    refetchInterval: 30000,
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Activity Logs</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {pagination?.total?.toLocaleString() || 0} total log entries · Auto-refreshes every 30s
          </p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th className="hidden md:table-cell">Resource</th>
                <th className="hidden lg:table-cell">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                : logs.length === 0
                ? <tr><td colSpan={5} className="text-center py-10 text-slate-400 flex items-center justify-center gap-2"><ScrollText className="w-4 h-4" /> No logs found</td></tr>
                : logs.map((log: { _id: string; user?: { name: string; role: string }; action: string; resource: string; resourceId?: string; ipAddress?: string; createdAt: string }) => (
                  <motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                    </td>
                    <td>
                      {log.user ? (
                        <div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{log.user.name}</div>
                          <RoleBadge role={log.user.role} />
                        </div>
                      ) : <span className="text-slate-400 text-sm">System</span>}
                    </td>
                    <td>
                      <span className={`badge text-xs ${ACTION_COLORS[log.action] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="text-sm text-slate-600 dark:text-slate-300 capitalize">{log.resource}</div>
                      {log.resourceId && <div className="text-xs text-slate-400 font-mono truncate max-w-[100px]">{log.resourceId}</div>}
                    </td>
                    <td className="hidden lg:table-cell text-sm text-slate-400 font-mono">{log.ipAddress || '—'}</td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-dark-border">
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};
