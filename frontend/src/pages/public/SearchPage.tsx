import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { ServiceCard } from '../../components/services/ServiceCard';
import { ServiceCardSkeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';
import { useServices } from '../../hooks/useServices';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading } = useServices({ search: query, page, limit: 12 });
  const services = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <SEOHead
        title={query ? `Search: ${query}` : 'Search Services'}
        description={`Search results for "${query}" in government services`}
        noIndex={!query}
      />

      <div className="section">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {query ? `Results for "${query}"` : 'Search Government Services'}
            </h1>
            {pagination && (
              <p className="text-slate-500 dark:text-slate-400">
                Found {pagination.total.toLocaleString()} services
              </p>
            )}
          </div>

          {!query ? (
            <div className="card p-12 text-center">
              <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                Enter a search term
              </h3>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
            </div>
          ) : services.length === 0 ? (
            <div className="card p-12 text-center">
              <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No results found for "{query}"
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try different keywords or browse by category
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service, i) => (
                  <ServiceCard key={service._id} service={service} index={i} />
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(p) => {
                    setSearchParams((prev) => { prev.set('page', p.toString()); return prev; });
                  }}
                  className="mt-8"
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
