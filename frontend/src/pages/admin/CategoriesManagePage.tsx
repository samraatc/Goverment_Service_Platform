import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useServices';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { Category } from '../../types';

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
  isActive: z.boolean(),
  order: z.number().min(0),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export const CategoriesManagePage = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { data, isLoading } = useCategories(true);
  const categories = (data?.data || []) as Category[];
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { isActive: true, order: 0 },
  });

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setIsAdding(false);
    reset({ name: cat.name, description: cat.description || '', icon: cat.icon || '', color: cat.color || '#3B82F6', isActive: cat.isActive, order: cat.order, seoTitle: cat.seoTitle || '', seoDescription: cat.seoDescription || '' });
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    reset({ isActive: true, order: 0, color: '#3B82F6' });
  };

  const cancel = () => { setEditingId(null); setIsAdding(false); reset(); };

  const onSubmit = async (data: CategoryForm) => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    cancel();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}"? This cannot be undone.`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const FormPanel = () => (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)} className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">{editingId ? 'Edit Category' : 'Add Category'}</h3>
          <button type="button" onClick={cancel} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Name *</label>
            <input {...register('name')} className={errors.name ? 'input-error' : 'input'} placeholder="Healthcare" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex items-center gap-2">
              <input type="color" {...register('color')} className="w-10 h-10 rounded-lg border border-slate-200 dark:border-dark-border cursor-pointer p-1 bg-white dark:bg-dark-card" />
              <input {...register('color')} className="input flex-1" placeholder="#3B82F6" />
            </div>
          </div>
          <div>
            <label className="label">Order</label>
            <input type="number" min={0} {...register('order', { valueAsNumber: true })} className="input" />
          </div>
          <div>
            <label className="label">Icon Name (Lucide)</label>
            <input {...register('icon')} className="input" placeholder="heart-pulse" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <input {...register('description')} className="input" placeholder="Short category description" />
          </div>
          <div>
            <label className="label">SEO Title</label>
            <input {...register('seoTitle')} className="input" placeholder="SEO override title" maxLength={70} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">SEO Description</label>
            <input {...register('seoDescription')} className="input" placeholder="Meta description" maxLength={160} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('isActive')} id="isActive" className="w-4 h-4 text-primary-600 rounded" />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Active</label>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button type="button" onClick={cancel} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary">
            <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Create'} Category
          </button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        {!isAdding && !editingId && (
          <button onClick={startAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Category</button>
        )}
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && <FormPanel key="form" />}
      </AnimatePresence>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th className="hidden md:table-cell">Services</th>
                <th className="hidden lg:table-cell">Order</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                : categories.map((cat) => (
                  <tr key={cat._id} className={editingId === cat._id ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}25` }}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">{cat.name}</div>
                          {cat.description && <div className="text-xs text-slate-400 truncate max-w-[150px]">{cat.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-slate-500 dark:text-slate-400">{cat.serviceCount}</td>
                    <td className="hidden lg:table-cell text-slate-500 dark:text-slate-400">{cat.order}</td>
                    <td>
                      <span className={cat.isActive ? 'badge-success badge' : 'badge-neutral badge'}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat._id, cat.name)} disabled={deleteMutation.isPending} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
