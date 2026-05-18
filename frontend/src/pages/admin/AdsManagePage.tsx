import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Eye, MousePointerClick } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi } from '../../api/services.api';
import { Skeleton } from '../../components/ui/Skeleton';
import { Advertisement } from '../../types';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const adSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['banner', 'sidebar', 'inline', 'featured', 'sponsored']),
  targetUrl: z.string().url(),
  placement: z.string().min(1),
  htmlCode: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean(),
  priority: z.number().min(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type AdForm = z.infer<typeof adSchema>;

export const AdsManagePage = () => {
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'ads'],
    queryFn: () => adminApi.getAds().then((r) => r.data),
  });

  const ads: Advertisement[] = data?.data || [];

  const createMutation = useMutation({
    mutationFn: adminApi.createAd,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'ads'] }); toast.success('Ad created!'); cancel(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => adminApi.updateAd(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'ads'] }); toast.success('Ad updated!'); cancel(); },
  });
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteAd,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'ads'] }); toast.success('Ad deleted!'); },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdForm>({
    resolver: zodResolver(adSchema),
    defaultValues: { isActive: true, priority: 0, type: 'banner' },
  });

  const startEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setIsAdding(false);
    reset({ name: ad.name, type: ad.type, targetUrl: ad.targetUrl, placement: ad.placement, htmlCode: ad.htmlCode || '', imageUrl: ad.imageUrl || '', isActive: ad.isActive, priority: ad.priority });
  };

  const cancel = () => { setEditingAd(null); setIsAdding(false); reset(); };
  const onSubmit = (data: AdForm) => {
    if (editingAd) updateMutation.mutate({ id: editingAd._id, data });
    else createMutation.mutate(data);
  };

  const FormPanel = () => (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)} className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">{editingAd ? 'Edit Advertisement' : 'New Advertisement'}</h3>
          <button type="button" onClick={cancel} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div><label className="label">Name *</label><input {...register('name')} className={errors.name ? 'input-error' : 'input'} /></div>
          <div>
            <label className="label">Type *</label>
            <select {...register('type')} className="input">
              {['banner', 'sidebar', 'inline', 'featured', 'sponsored'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Target URL *</label><input {...register('targetUrl')} className={errors.targetUrl ? 'input-error' : 'input'} placeholder="https://…" /></div>
          <div><label className="label">Placement *</label><input {...register('placement')} className={errors.placement ? 'input-error' : 'input'} placeholder="homepage-top" /></div>
          <div><label className="label">Image URL</label><input {...register('imageUrl')} className="input" placeholder="https://…/banner.jpg" /></div>
          <div><label className="label">Priority</label><input type="number" min={0} {...register('priority', { valueAsNumber: true })} className="input" /></div>
          <div className="sm:col-span-2"><label className="label">HTML Code (optional)</label><textarea {...register('htmlCode')} rows={3} className="input font-mono text-xs" placeholder="<div>…</div>" /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('isActive')} id="adActive" className="w-4 h-4 text-primary-600 rounded" />
            <label htmlFor="adActive" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Active</label>
          </div>
        </div>
        <div className="flex items-center gap-3 justify-end">
          <button type="button" onClick={cancel} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary">
            <Save className="w-4 h-4" /> {editingAd ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Advertisements</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{ads.length} placements</p>
        </div>
        {!isAdding && !editingAd && (
          <button onClick={() => setIsAdding(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Ad</button>
        )}
      </div>

      <AnimatePresence>
        {(isAdding || editingAd) && <FormPanel key="form" />}
      </AnimatePresence>

      {isLoading ? <Skeleton className="h-48" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <motion.div key={ad._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm truncate">{ad.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="badge badge-info text-xs">{ad.type}</span>
                    <span className={clsx('badge text-xs', ad.isActive ? 'badge-success' : 'badge-neutral')}>{ad.isActive ? 'Active' : 'Paused'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(ad)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteMutation.mutate(ad._id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-2 truncate">Placement: <span className="text-slate-600 dark:text-slate-300">{ad.placement}</span></p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {ad.impressionCount}</span>
                <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" /> {ad.clickCount}</span>
                {ad.impressionCount > 0 && <span>CTR: {((ad.clickCount / ad.impressionCount) * 100).toFixed(1)}%</span>}
              </div>
            </motion.div>
          ))}
          {ads.length === 0 && !isLoading && (
            <div className="card p-8 text-center col-span-full">
              <p className="text-slate-400">No advertisements yet. Create your first placement.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
