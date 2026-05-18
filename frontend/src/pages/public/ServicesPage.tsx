import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, X, Search } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { ServiceCard } from '../../components/services/ServiceCard';
import { ServiceCardSkeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';
import { useServices, useCategories } from '../../hooks/useServices';
import { useDebounce } from '../../hooks/useDebounce';
import { ServiceFilters, Category } from '../../types';
import { clsx } from 'clsx';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
  'Germany', 'France', 'Japan', 'Brazil', 'South Africa',
];

export const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const filters: ServiceFilters = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
    search: debouncedSearch || undefined,
    category: searchParams.get('category') || undefined,
    country: searchParams.get('country') || undefined,
    verificationStatus: searchParams.get('verification') || undefined,
    isFeatured: searchParams.get('isFeatured') === 'true' || undefined,
  };

  const { data, isLoading } = useServices(filters);
  const { data: categoriesData } = useCategories(true);

  const services = data?.data || [];
  const pagination = data?.pagination;
  const categories = (categoriesData?.data || []) as Category[];

  const setFilter = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      if (value === null || value === '') {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchParams.get('category') ||
    searchParams.get('country') ||
    searchParams.get('verification') ||
    search;

  return (
    <>
      <SEOHead
        title="Browse Government Services"
        description="Browse thousands of verified government services across categories and countries."
        canonical="/services"
      />

      <div className="section">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Government Services
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {pagination?.total
                ? `${pagination.total.toLocaleString()} verified services available`
                : 'Discover verified government services worldwide'}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <aside
              className={clsx(
                'lg:w-64 lg:shrink-0',
                showFilters ? 'block' : 'hidden lg:block'
              )}
            >
              <div className="card p-5 sticky top-20">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="mb-5">
                  <label className="label">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search services..."
                      className="input pl-9"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-5">
                  <label className="label">Category</label>
                  <select
                    value={searchParams.get('category') || ''}
                    onChange={(e) => setFilter('category', e.target.value)}
                    className="input"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country Filter */}
                <div className="mb-5">
                  <label className="label">Country</label>
                  <select
                    value={searchParams.get('country') || ''}
                    onChange={(e) => setFilter('country', e.target.value)}
                    className="input"
                  >
                    <option value="">All Countries</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Verification */}
                <div className="mb-5">
                  <label className="label">Verification</label>
                  <div className="space-y-2">
                    {['verified', 'unverified', 'broken'].map((v) => (
                      <label key={v} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="verification"
                          value={v}
                          checked={searchParams.get('verification') === v}
                          onChange={() => setFilter('verification', v)}
                          className="text-primary-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                          {v}
                        </span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="verification"
                        checked={!searchParams.get('verification')}
                        onChange={() => setFilter('verification', null)}
                        className="text-primary-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">All</span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Toggle */}
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary text-sm"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {pagination?.total || 0} results
                </span>
              </div>

              {/* Results */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="card p-12 text-center">
                  <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No services found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Try adjusting your filters or search terms
                  </p>
                  <button onClick={clearFilters} className="btn-primary mt-4">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {services.map((service, i) => (
                      <ServiceCard key={service._id} service={service} index={i} />
                    ))}
                  </div>

                  {pagination && pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={(page) => setFilter('page', page.toString())}
                      className="mt-8"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
