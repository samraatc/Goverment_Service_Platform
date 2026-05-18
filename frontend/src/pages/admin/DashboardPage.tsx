import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ServerCog, Users, FolderOpen, BookOpen, TrendingUp,
  AlertTriangle, MousePointerClick, Search, Clock, CheckCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { adminApi } from '../../api/services.api';
import { StatCardSkeleton, TableRowSkeleton } from '../../components/ui/Skeleton';
import { StatusBadge, VerificationBadge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  delta?: string;
  deltaPositive?: boolean;
  index?: number;
}

const StatCard = ({ title, value, icon: Icon, color, bgColor, delta, deltaPositive, index = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07 }}
    className="card p-5"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      {delta && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${deltaPositive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
          {delta}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
  </motion.div>
);

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard().then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['admin', 'analytics', '7d'],
    queryFn: () => adminApi.getAnalytics({ period: '7d' }).then((r) => r.data.data),
  });

  const stats = data?.stats;
  const recentServices = data?.recentServices || [];
  const topServices = data?.topServices || [];

  // Process chart data
  const clicksByDay = analyticsData?.dailyStats
    ?.filter((d: { _id: { type: string } }) => d._id.type === 'click')
    ?.map((d: { _id: { date: string }; count: number }) => ({ date: d._id.date, clicks: d.count })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Platform overview · Last updated {format(new Date(), 'MMM d, h:mm a')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Services" value={stats?.totalServices || 0} icon={ServerCog} color="text-blue-600 dark:text-blue-400" bgColor="bg-blue-100 dark:bg-blue-900/30" delta="+12%" deltaPositive index={0} />
            <StatCard title="Published" value={stats?.publishedServices || 0} icon={CheckCircle} color="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-100 dark:bg-emerald-900/30" index={1} />
            <StatCard title="Pending Review" value={stats?.pendingServices || 0} icon={Clock} color="text-amber-600 dark:text-amber-400" bgColor="bg-amber-100 dark:bg-amber-900/30" index={2} />
            <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="text-purple-600 dark:text-purple-400" bgColor="bg-purple-100 dark:bg-purple-900/30" delta="+5%" deltaPositive index={3} />
            <StatCard title="Categories" value={stats?.totalCategories || 0} icon={FolderOpen} color="text-indigo-600 dark:text-indigo-400" bgColor="bg-indigo-100 dark:bg-indigo-900/30" index={4} />
            <StatCard title="Blog Posts" value={stats?.totalBlogs || 0} icon={BookOpen} color="text-pink-600 dark:text-pink-400" bgColor="bg-pink-100 dark:bg-pink-900/30" index={5} />
            <StatCard title="Clicks (7d)" value={stats?.clicksLast7Days || 0} icon={MousePointerClick} color="text-cyan-600 dark:text-cyan-400" bgColor="bg-cyan-100 dark:bg-cyan-900/30" delta="+8%" deltaPositive index={6} />
            <StatCard title="Broken Links" value={stats?.brokenLinks || 0} icon={AlertTriangle} color="text-red-600 dark:text-red-400" bgColor="bg-red-100 dark:bg-red-900/30" index={7} />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Click Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Click Trend (7 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={clicksByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--tw-bg-dark-card, #1e293b)', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                labelFormatter={(v) => `Date: ${v}`}
              />
              <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Services */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Top Services by Clicks</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topServices.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="title" type="category" tick={{ fontSize: 10 }} width={100} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="clickCount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Services */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dark-border">
            <h3 className="font-semibold text-slate-800 dark:text-white">Recent Services</h3>
            <Link to="/admin/services" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={3} />)
                  : recentServices.map((svc) => (
                      <tr key={svc._id}>
                        <td className="font-medium text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                          <Link to={`/admin/services/${svc._id}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            {svc.title}
                          </Link>
                        </td>
                        <td><StatusBadge status={svc.status} /></td>
                        <td><VerificationBadge status={svc.verificationStatus} /></td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Searches */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dark-border">
            <h3 className="font-semibold text-slate-800 dark:text-white">Top Searches</h3>
            <Link to="/admin/analytics" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Full analytics</Link>
          </div>
          <div className="p-5 space-y-3">
            {(analyticsData?.topSearches || []).slice(0, 8).map((s: { _id: string; count: number }, i: number) => (
              <div key={s._id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm text-slate-700 dark:text-slate-200 truncate flex items-center gap-1">
                      <Search className="w-3 h-3 text-slate-400" /> {s._id}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (s.count / (analyticsData?.topSearches?.[0]?.count || 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {(!analyticsData?.topSearches || analyticsData.topSearches.length === 0) && (
              <p className="text-sm text-slate-400 text-center py-4">No search data yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
