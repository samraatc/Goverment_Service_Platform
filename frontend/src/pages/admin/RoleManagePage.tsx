import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

const ROLES_CONFIG = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    description: 'Full platform access. Can manage all content, users, settings, and configurations.',
    permissions: [
      { label: 'View Dashboard', granted: true },
      { label: 'Manage Services', granted: true },
      { label: 'Publish Services', granted: true },
      { label: 'Manage Categories', granted: true },
      { label: 'Manage Users', granted: true },
      { label: 'Change User Roles', granted: true },
      { label: 'View Analytics', granted: true },
      { label: 'Manage Settings', granted: true },
      { label: 'Manage Advertisements', granted: true },
      { label: 'View Logs', granted: true },
      { label: 'Delete Content', granted: true },
    ],
  },
  {
    role: 'admin',
    label: 'Admin',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    description: 'Can create, edit, verify, and manage services and categories.',
    permissions: [
      { label: 'View Dashboard', granted: true },
      { label: 'Manage Services', granted: true },
      { label: 'Publish Services', granted: true },
      { label: 'Manage Categories', granted: true },
      { label: 'Manage Users', granted: false },
      { label: 'Change User Roles', granted: false },
      { label: 'View Analytics', granted: true },
      { label: 'Manage Settings', granted: false },
      { label: 'Manage Advertisements', granted: true },
      { label: 'View Logs', granted: true },
      { label: 'Delete Content', granted: true },
    ],
  },
  {
    role: 'editor',
    label: 'Editor',
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    description: 'Can create and edit service drafts. Cannot publish directly.',
    permissions: [
      { label: 'View Dashboard', granted: true },
      { label: 'Manage Services', granted: true },
      { label: 'Publish Services', granted: false },
      { label: 'Manage Categories', granted: false },
      { label: 'Manage Users', granted: false },
      { label: 'Change User Roles', granted: false },
      { label: 'View Analytics', granted: false },
      { label: 'Manage Settings', granted: false },
      { label: 'Manage Advertisements', granted: false },
      { label: 'View Logs', granted: false },
      { label: 'Delete Content', granted: false },
    ],
  },
  {
    role: 'user',
    label: 'Public User',
    color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    description: 'Can browse, search, and access government service links.',
    permissions: [
      { label: 'Browse Services', granted: true },
      { label: 'Search Services', granted: true },
      { label: 'Filter Services', granted: true },
      { label: 'Access External Links', granted: true },
      { label: 'Admin Panel Access', granted: false },
      { label: 'Create Content', granted: false },
    ],
  },
];

export const RoleManagePage = () => (
  <div className="space-y-5">
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Role Management</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">View and understand permissions for each role</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {ROLES_CONFIG.map((roleConfig, i) => (
        <motion.div
          key={roleConfig.role}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="card p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-800 dark:text-white">{roleConfig.label}</h3>
                <span className={`badge ${roleConfig.color}`}>{roleConfig.role}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{roleConfig.description}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {roleConfig.permissions.map((perm) => (
              <div key={perm.label} className="flex items-center gap-2">
                {perm.granted
                  ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  : <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />}
                <span className={`text-sm ${perm.granted ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  {perm.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>

    <div className="card p-5 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
      <p className="text-sm text-blue-700 dark:text-blue-300">
        <strong>Note:</strong> Role assignments are managed in the Users section. To change a user's role, navigate to Users and update their role from the role dropdown.
      </p>
    </div>
  </div>
);
