import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi, categoriesApi } from '../api/services.api';
import { ServiceFilters } from '../types';
import toast from 'react-hot-toast';

// Query keys
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters: ServiceFilters) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  trending: () => [...serviceKeys.all, 'trending'] as const,
  suggestions: (q: string) => [...serviceKeys.all, 'suggestions', q] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
  flat: () => [...categoryKeys.all, 'flat'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const useServices = (filters?: ServiceFilters) =>
  useQuery({
    queryKey: serviceKeys.list(filters || {}),
    queryFn: () => servicesApi.getAll(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 2, // 2 min
  });

export const useService = (id: string) =>
  useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => servicesApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useTrendingServices = () =>
  useQuery({
    queryKey: serviceKeys.trending(),
    queryFn: () => servicesApi.getTrending().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5, // 5 min
  });

export const useSearchSuggestions = (q: string) =>
  useQuery({
    queryKey: serviceKeys.suggestions(q),
    queryFn: () => servicesApi.getSuggestions(q).then((r) => r.data.data),
    enabled: q.length >= 2,
    staleTime: 1000 * 30,
  });

export const useCreateService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceKeys.all });
      toast.success('Service created successfully!');
    },
  });
};

export const useUpdateService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      servicesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceKeys.all });
      toast.success('Service updated successfully!');
    },
  });
};

export const useDeleteService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceKeys.all });
      toast.success('Service deleted successfully!');
    },
  });
};

export const useApproveService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      servicesApi.approve(id, action),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: serviceKeys.all });
      toast.success(`Service ${variables.action}d successfully!`);
    },
  });
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const useCategories = (flat = false) =>
  useQuery({
    queryKey: flat ? categoryKeys.flat() : categoryKeys.list(),
    queryFn: () => categoriesApi.getAll({ flat, active: true }).then((r) => r.data),
    staleTime: 1000 * 60 * 10, // 10 min
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category created successfully!');
    },
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category updated successfully!');
    },
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category deleted successfully!');
    },
  });
};
