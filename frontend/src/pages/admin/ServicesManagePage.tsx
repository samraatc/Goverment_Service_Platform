import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useServices, useDeleteService, useApproveService } from '../../hooks/useServices';
import { StatusBadge, VerificationBadge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { Service } from '../../types';
import { format } from 'date-fns';

export const ServicesManagePage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, refetch } = useServices({ page, limit: 15, search: debouncedSearch || undefined, status: statusFilter || undefined });
  const deleteMutation = useDeleteService();
  const approveMutation = useApproveService();

  const services: Service[] = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this service? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(id);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Services</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {pagination?.total || 0} total services
          </p>
        </div>
        <Link to="/admin/services/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Service
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search services..." className="input pl-9" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input sm:w-44">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={() => refetch()} className="btn-secondary" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th className="hidden md:table-cell">Country</th>
                <th>Status</th>
                <th className="hidden lg:table-cell">Verification</th>
                <th className="hidden xl:table-cell">Clicks</th>
                <th className="hidden xl:table-cell">Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                : services.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">No services found.</td>
                  </tr>
                )
                : services.map((svc) => (
                  <motion.tr key={svc._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group">
                    <td className="max-w-[200px]">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{svc.title}</div>
                      <a href={svc.officialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 truncate mt-0.5">
                        {svc.officialUrl.replace(/^https?:\/\//, '').slice(0, 35)}…
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="hidden md:table-cell text-slate-500 dark:text-slate-400 text-sm">{svc.country}</td>
                    <td><StatusBadge status={svc.status} /></td>
                    <td className="hidden lg:table-cell"><VerificationBadge status={svc.verificationStatus} /></td>
                    <td className="hidden xl:table-cell text-slate-500 dark:text-slate-400 text-sm">{svc.clickCount.toLocaleString()}</td>
                    <td className="hidden xl:table-cell text-slate-500 dark:text-slate-400 text-sm">{format(new Date(svc.updatedAt), 'MMM d, yyyy')}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {svc.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate({ id: svc._id, action: 'approve' })}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => approveMutation.mutate({ id: svc._id, action: 'reject' })}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <Link to={`/admin/services/${svc._id}/edit`} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(svc._id)}
                          disabled={deleteMutation.isPending && deleteId === svc._id}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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
