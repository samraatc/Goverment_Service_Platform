import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api/services.api';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

interface Setting {
  _id: string;
  key: string;
  value: unknown;
  type: string;
  group: string;
  label: string;
  description?: string;
}

export const SettingsPage = () => {
  const [localValues, setLocalValues] = useState<Record<string, unknown>>({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getSettings().then((r) => r.data.data as Setting[]),
  });

  // Initialise local form values whenever the query resolves
  useEffect(() => {
    if (data) {
      const vals: Record<string, unknown> = {};
      (data as Setting[]).forEach((s) => { vals[s.key] = s.value; });
      setLocalValues(vals);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (updates: Array<{ key: string; value: unknown }>) => adminApi.updateSettings(updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'settings'] }); toast.success('Settings saved!'); },
  });

  const settings = (data || []) as Setting[];

  // Group settings
  const grouped = settings.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {} as Record<string, Setting[]>);

  const handleSave = () => {
    const updates = Object.entries(localValues).map(([key, value]) => ({ key, value }));
    saveMutation.mutate(updates);
  };

  const renderField = (setting: Setting) => {
    const val = localValues[setting.key];
    switch (setting.type) {
      case 'boolean':
        return (
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={!!val}
              onChange={(e) => setLocalValues((prev) => ({ ...prev, [setting.key]: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{setting.description || 'Enable'}</span>
          </label>
        );
      case 'number':
        return (
          <input
            type="number"
            value={val as number}
            onChange={(e) => setLocalValues((prev) => ({ ...prev, [setting.key]: Number(e.target.value) }))}
            className="input sm:max-w-xs"
          />
        );
      default:
        return (
          <input
            type="text"
            value={val as string || ''}
            onChange={(e) => setLocalValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
            className="input sm:max-w-md"
          />
        );
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage platform-wide configuration</p>
        </div>
        <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary">
          <Save className="w-4 h-4" /> {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        Object.entries(grouped).map(([group, groupSettings]) => (
          <motion.div key={group} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
            <h2 className="font-semibold text-slate-800 dark:text-white capitalize mb-5 pb-3 border-b border-slate-100 dark:border-dark-border">
              {group.replace(/_/g, ' ')} Settings
            </h2>
            <div className="space-y-5">
              {groupSettings.map((setting) => (
                <div key={setting.key}>
                  <label className="label">{setting.label}</label>
                  {renderField(setting)}
                  {setting.description && setting.type !== 'boolean' && (
                    <p className="text-xs text-slate-400 mt-1">{setting.description}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))
      )}

      {Object.keys(grouped).length === 0 && !isLoading && (
        <div className="card p-12 text-center">
          <RefreshCw className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No settings found. Run the seeder to initialize.</p>
        </div>
      )}
    </div>
  );
};
