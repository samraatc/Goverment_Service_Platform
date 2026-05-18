import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Save, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi, categoriesApi } from '../../api/services.api';
import { useCategories } from '../../hooks/useServices';
import { serviceKeys } from '../../hooks/useServices';
import { Category } from '../../types';
import toast from 'react-hot-toast';

const serviceSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  shortDescription: z.string().max(300).optional(),
  officialUrl: z.string().url('Must be a valid URL'),
  category: z.string().min(1, 'Select a category'),
  country: z.string().min(1, 'Country is required'),
  countryCode: z.string().min(2).max(3),
  state: z.string().optional(),
  status: z.enum(['draft', 'pending', 'published', 'rejected', 'archived']),
  verificationStatus: z.enum(['unverified', 'verified', 'broken']),
  isFeatured: z.boolean(),
  isSponsored: z.boolean(),
  tags: z.string(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  sponsorPriority: z.number().min(0),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export const ServiceFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: categoriesData } = useCategories(true);
  const categories = (categoriesData?.data || []) as Category[];

  const { data: existingService } = useQuery({
    queryKey: ['service-edit', id],
    queryFn: () => servicesApi.getById(id!).then((r) => r.data.data),
    enabled: isEditing,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      status: 'draft',
      verificationStatus: 'unverified',
      isFeatured: false,
      isSponsored: false,
      tags: '',
      sponsorPriority: 0,
    },
  });

  useEffect(() => {
    if (existingService) {
      reset({
        ...existingService,
        category: typeof existingService.category === 'object' ? (existingService.category as Category)._id : existingService.category,
        tags: (existingService.tags || []).join(', '),
      });
    }
  }, [existingService, reset]);

  const mutation = useMutation({
    mutationFn: (data: Partial<typeof serviceSchema._type>) => {
      const payload = { ...data, tags: typeof data.tags === 'string' ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : data.tags };
      return isEditing ? servicesApi.update(id!, payload) : servicesApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceKeys.all });
      toast.success(isEditing ? 'Service updated!' : 'Service created!');
      navigate('/admin/services');
    },
  });

  const onSubmit = (data: ServiceFormData) => mutation.mutate(data);

  const FieldError = ({ name }: { name: keyof ServiceFormData }) =>
    errors[name] ? <p className="text-red-500 text-xs mt-1">{errors[name]?.message as string}</p> : null;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/services')} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Service' : 'Add New Service'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {isEditing ? `Editing: ${existingService?.title || '…'}` : 'Fill in the details below'}
          </p>
        </div>
      </div>

      <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-dark-border pb-3">Basic Information</h2>

          <div>
            <label className="label">Title *</label>
            <input {...register('title')} className={errors.title ? 'input-error' : 'input'} placeholder="e.g. Passport Renewal Service" />
            <FieldError name="title" />
          </div>

          <div>
            <label className="label">Official URL *</label>
            <input {...register('officialUrl')} className={errors.officialUrl ? 'input-error' : 'input'} placeholder="https://government.example.gov/passport" />
            <FieldError name="officialUrl" />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea {...register('description')} rows={4} className={errors.description ? 'input-error' : 'input'} placeholder="Detailed description of the service..." />
            <FieldError name="description" />
          </div>

          <div>
            <label className="label">Short Description</label>
            <input {...register('shortDescription')} className="input" placeholder="Brief summary (max 300 chars)" />
          </div>
        </div>

        {/* Classification */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-dark-border pb-3">Classification</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select {...register('category')} className={errors.category ? 'input-error' : 'input'}>
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <FieldError name="category" />
            </div>

            <div>
              <label className="label">Country *</label>
              <input {...register('country')} className={errors.country ? 'input-error' : 'input'} placeholder="United States" />
              <FieldError name="country" />
            </div>

            <div>
              <label className="label">Country Code *</label>
              <input {...register('countryCode')} className={errors.countryCode ? 'input-error' : 'input'} placeholder="US" maxLength={3} />
              <FieldError name="countryCode" />
            </div>

            <div>
              <label className="label">State / Region</label>
              <input {...register('state')} className="input" placeholder="California (optional)" />
            </div>
          </div>

          <div>
            <label className="label">Tags (comma-separated)</label>
            <input {...register('tags')} className="input" placeholder="passport, renewal, travel document" />
          </div>
        </div>

        {/* Status & Settings */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-dark-border pb-3">Status & Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Service Status</label>
              <select {...register('status')} className="input">
                <option value="draft">Draft</option>
                <option value="pending">Pending Review</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="label">Verification Status</label>
              <select {...register('verificationStatus')} className="input">
                <option value="unverified">Unverified</option>
                <option value="verified">Verified</option>
                <option value="broken">Broken</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured Service</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" {...register('isSponsored')} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sponsored</span>
            </label>
          </div>

          <div className="sm:w-48">
            <label className="label">Sponsor Priority (0 = lowest)</label>
            <input type="number" min={0} {...register('sponsorPriority', { valueAsNumber: true })} className="input" />
          </div>
        </div>

        {/* SEO */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-dark-border pb-3">SEO Metadata</h2>

          <div>
            <label className="label">SEO Title <span className="text-slate-400 font-normal">(max 70 chars)</span></label>
            <input {...register('seoTitle')} className="input" placeholder="Override page title for search engines" maxLength={70} />
          </div>

          <div>
            <label className="label">SEO Description <span className="text-slate-400 font-normal">(max 160 chars)</span></label>
            <textarea {...register('seoDescription')} rows={2} className="input" placeholder="Override meta description" maxLength={160} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end pb-4">
          <button type="button" onClick={() => navigate('/admin/services')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Saving…' : isEditing ? 'Update Service' : 'Create Service'}
          </button>
        </div>
      </motion.form>
    </div>
  );
};
