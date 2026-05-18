import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ServerCog, FolderOpen, Users, BarChart3,
  ScrollText, Settings, Search, Megaphone, Shield, ChevronLeft,
  ChevronRight, LogOut, X, Menu
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/services.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Services', href: '/admin/services', icon: ServerCog },
  { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { label: 'Users', href: '/admin/users', icon: Users, superAdminOnly: true },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Activity Logs', href: '/admin/logs', icon: ScrollText },
  { label: 'SEO', href: '/admin/seo', icon: Search },
  { label: 'Advertisements', href: '/admin/ads', icon: Megaphone },
  { label: 'Role Management', href: '/admin/roles', icon: Shield, superAdminOnly: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, superAdminOnly: true },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCollapse: () => void;
  onMobileClose: () => void;
}

export const AdminSidebar = ({ isCollapsed, isMobileOpen, onCollapse, onMobileClose }: AdminSidebarProps) => {
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    toast.success('Logged out');
    navigate('/');
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={clsx('flex items-center h-16 px-4 border-b border-slate-200 dark:border-dark-border shrink-0', isCollapsed ? 'justify-center' : 'justify-between')}>
        {!isCollapsed && (
          <span className="font-bold text-slate-900 dark:text-white text-base truncate">
            Gov<span className="text-primary-600">Admin</span>
          </span>
        )}
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors hidden lg:flex"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 no-scrollbar">
        <ul className="space-y-0.5">
          {NAV_ITEMS.filter(item => !item.superAdminOnly || user?.role === 'super_admin').map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onMobileClose}
                  title={isCollapsed ? item.label : undefined}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium group',
                    active
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={clsx('shrink-0 transition-transform', active ? 'w-[18px] h-[18px]' : 'w-[18px] h-[18px] group-hover:scale-110')} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  {active && !isCollapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className={clsx('border-t border-slate-200 dark:border-dark-border p-3 shrink-0', isCollapsed && 'flex flex-col items-center')}>
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 p-2 rounded-lg mb-2 bg-slate-50 dark:bg-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user.role?.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Sign out' : undefined}
          className={clsx(
            'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border h-screen sticky top-0 transition-all duration-300 shrink-0',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border z-50 flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
