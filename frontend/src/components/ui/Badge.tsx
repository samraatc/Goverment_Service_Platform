import { clsx } from 'clsx';
import { CheckCircle, XCircle, Clock, AlertTriangle, Circle } from 'lucide-react';
import { ServiceStatus, VerificationStatus } from '../../types';

export const StatusBadge = ({ status }: { status: ServiceStatus }) => {
  const config = {
    published: { class: 'badge-success', icon: CheckCircle, label: 'Published' },
    pending: { class: 'badge-warning', icon: Clock, label: 'Pending' },
    draft: { class: 'badge-neutral', icon: Circle, label: 'Draft' },
    rejected: { class: 'badge-error', icon: XCircle, label: 'Rejected' },
    archived: { class: 'badge-neutral', icon: Circle, label: 'Archived' },
  }[status] || { class: 'badge-neutral', icon: Circle, label: status };

  const Icon = config.icon;
  return (
    <span className={clsx('badge', config.class)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export const VerificationBadge = ({ status }: { status: VerificationStatus }) => {
  const config = {
    verified: { class: 'badge-success', icon: CheckCircle, label: 'Verified' },
    unverified: { class: 'badge-warning', icon: AlertTriangle, label: 'Unverified' },
    broken: { class: 'badge-error', icon: XCircle, label: 'Broken Link' },
  }[status] || { class: 'badge-neutral', icon: Circle, label: status };

  const Icon = config.icon;
  return (
    <span className={clsx('badge', config.class)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

interface RoleBadgeProps {
  role: string;
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const config = {
    super_admin: { class: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', label: 'Super Admin' },
    admin: { class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', label: 'Admin' },
    editor: { class: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', label: 'Editor' },
    user: { class: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', label: 'User' },
  }[role] || { class: 'badge-neutral', label: role };

  return <span className={clsx('badge', config.class)}>{config.label}</span>;
};
