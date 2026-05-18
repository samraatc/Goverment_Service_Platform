import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserCheck, UserX, UserPlus, X, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi } from '../../api/services.api';
import { RoleBadge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuthStore } from '../../store/useAuthStore';
import { User } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const ALL_ROLES = ['user', 'editor', 'admin', 'super_admin'];

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  role: z.enum(['user', 'editor', 'admin', 'super_admin']),
});
type CreateUserForm = z.infer<typeof createUserSchema>;

const formatRole = (r: string) =>
  r.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Create User Modal ────────────────────────────────────────────────────────
const CreateUserModal = ({
  onClose,
  currentUserRole,
}: {
  onClose: () => void;
  currentUserRole: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'user' },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserForm) => adminApi.createUser(data as Record<string, unknown>),
    onSuccess: (res: any) => {
      toast.success(`User ${res.data?.data?.email ?? ''} created successfully`);
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    },
  });

  const availableRoles =
    currentUserRole === 'super_admin' ? ALL_ROLES : ALL_ROLES.filter((r) => r !== 'super_admin');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-2xl z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Add New User</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">User will be pre-verified</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-border rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="John Doe"
              className={errors.name ? 'input-error' : 'input'}
              autoFocus
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email Address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="user@example.com"
              className={errors.email ? 'input-error' : 'input'}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className={clsx(errors.password ? 'input-error' : 'input', 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Role</label>
            <select {...register('role')} className={errors.role ? 'input-error' : 'input'}>
              {availableRoles.map((r) => (
                <option key={r} value={r}>{formatRole(r)}</option>
              ))}
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {createMutation.isPending
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <UserPlus className="w-4 h-4" />}
              {createMutation.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const UsersManagePage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const debouncedSearch = useDebounce(search, 400);
  const qc = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, debouncedSearch, roleFilter],
    queryFn: () =>
      adminApi
        .getUsers({ page, limit: 15, search: debouncedSearch || undefined, role: roleFilter || undefined })
        .then((r) => r.data),
  });

  const users: User[] = data?.data || [];
  const pagination = data?.pagination;

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUserRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('Role updated'); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update role'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleUserStatus(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User status updated'); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update status'),
  });

  const canManageRoles = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
  const canToggleStatus = currentUser?.role === 'super_admin';
  const availableRoleOptions =
    currentUser?.role === 'super_admin' ? ALL_ROLES : ALL_ROLES.filter((r) => r !== 'super_admin');

  return (
    <>
      <AnimatePresence>
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            currentUserRole={currentUser?.role || 'admin'}
          />
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Users</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {pagination?.total ?? 0} total users
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or email…"
                className="input pl-9"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="input sm:w-44"
            >
              <option value="">All Roles</option>
              {ALL_ROLES.map((r) => <option key={r} value={r}>{formatRole(r)}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th className="hidden md:table-cell">Status</th>
                  <th className="hidden lg:table-cell">Joined</th>
                  <th className="hidden xl:table-cell">Last Login</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                  : users.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <UserPlus className="w-8 h-8 opacity-40" />
                          <p className="text-sm">No users found</p>
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
                          >
                            Add the first user
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                  : users.map((user) => (
                    <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {/* User info */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {user.name}
                              {user._id === currentUser?._id && (
                                <span className="ml-1.5 text-[10px] text-primary-500 font-semibold">(you)</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        {canManageRoles && user._id !== currentUser?._id ? (
                          <select
                            value={user.role}
                            onChange={(e) => roleMutation.mutate({ id: user._id, role: e.target.value })}
                            disabled={roleMutation.isPending}
                            className="text-xs border border-slate-200 dark:border-dark-border rounded-lg px-2 py-1 bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                          >
                            {availableRoleOptions.map((r) => (
                              <option key={r} value={r}>{formatRole(r)}</option>
                            ))}
                          </select>
                        ) : (
                          <RoleBadge role={user.role as any} />
                        )}
                      </td>

                      {/* Status */}
                      <td className="hidden md:table-cell">
                        <span className={clsx('badge', user.isActive ? 'badge-success' : 'badge-error')}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="hidden lg:table-cell text-slate-500 dark:text-slate-400 text-sm">
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </td>

                      {/* Last login */}
                      <td className="hidden xl:table-cell text-slate-500 dark:text-slate-400 text-sm">
                        {user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy') : '—'}
                      </td>

                      {/* Toggle */}
                      <td className="text-right">
                        {canToggleStatus && user._id !== currentUser?._id ? (
                          <button
                            onClick={() => toggleMutation.mutate(user._id)}
                            disabled={toggleMutation.isPending}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                            className={clsx(
                              'p-1.5 rounded-lg transition-colors',
                              user.isActive
                                ? 'text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                                : 'text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                            )}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs px-2">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-dark-border">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
