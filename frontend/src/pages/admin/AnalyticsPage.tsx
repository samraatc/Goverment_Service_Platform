import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart2, Globe, Search, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminApi } from '../../api/services.api';
import { Skeleton } from '../../components/ui/Skeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
const PERIODS = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export const AnalyticsPage = () => {
  const [period, setPeriod] = useState('7d');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', period],
    queryFn: () => adminApi.getAnalytics({ period }).then((r) => r.data.data),
  });

  // Process daily data for chart
  const chartData = (() => {
    if (!data?.dailyStats) return [];
    const grouped: Record<string, { date: string; clicks: number; searches: number; views: number }> = {};
    data.dailyStats.forEach((d: { _id: { date: string; type: string }; count: number }) => {
      const { date, type } = d._id;
      if (!grouped[date]) grouped[date] = { date, clicks: 0, searches: 0, views: 0 };
      if (type === 'click') grouped[date].clicks = d.count;
      else if (type === 'search') grouped[date].searches = d.count;
      else if (type === 'view') grouped[date].views = d.count;
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  })();

  const countryData = (data?.countryStats || []).slice(0, 8).map((c: { _id: string; count: number }) => ({
    name: c._id || 'Unknown', value: c.count,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Platform traffic and engagement metrics</p>
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${period === p.value ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-500" /> Traffic Overview
        </h2>
        {isLoading ? <Skeleton className="h-64" /> : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} labelFormatter={(v) => `Date: ${v}`} />
              <Legend />
              <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} name="Clicks" />
              <Line type="monotone" dataKey="searches" stroke="#10b981" strokeWidth={2} dot={false} name="Searches" />
              <Line type="monotone" dataKey="views" stroke="#f59e0b" strokeWidth={2} dot={false} name="Views" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Top Searches */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-500" /> Top Search Terms
          </h2>
          {isLoading ? <Skeleton className="h-48" /> : (
            <div className="space-y-2.5">
              {(data?.topSearches || []).slice(0, 8).map((s: { _id: string; count: number }, i: number) => (
                <div key={s._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{s._id}</span>
                      <span className="text-xs text-slate-400 ml-2 shrink-0">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.count / (data.topSearches[0]?.count || 1)) * 100}%` }}
                        transition={{ delay: i * 0.05 }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!data?.topSearches || data.topSearches.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-6">No search data for this period</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Country Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" /> Traffic by Country
          </h2>
          {isLoading ? <Skeleton className="h-48" /> : countryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={countryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {countryData.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No country data for this period</p>
          )}
        </motion.div>

        {/* Top Services by Clicks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5 xl:col-span-2">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-500" /> Top Services by Clicks
          </h2>
          {isLoading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={(data?.topServiceClicks || []).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="service.title" type="category" tick={{ fontSize: 10 }} width={130} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
};
