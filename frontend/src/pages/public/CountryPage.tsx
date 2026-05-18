import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, ArrowLeft } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { ServiceCard } from '../../components/services/ServiceCard';
import { ServiceCardSkeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';
import { useServices } from '../../hooks/useServices';
import { useState } from 'react';

// Map of country codes/slugs to names
const COUNTRY_NAMES: Record<string, string> = {
  us: 'United States', uk: 'United Kingdom', ca: 'Canada', au: 'Australia',
  in: 'India', de: 'Germany', fr: 'France', jp: 'Japan', br: 'Brazil', za: 'South Africa',
};

export const CountryPage = () => {
  const { country } = useParams<{ country: string }>();
  const [page, setPage] = useState(1);

  const countryName = COUNTRY_NAMES[country?.toLowerCase() || ''] || country || '';

  const { data, isLoading } = useServices({ country: countryName, page, limit: 12 });
  const services = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <SEOHead
        title={`Government Services in ${countryName}`}
        description={`Browse verified government services available in ${countryName}.`}
        canonical={`/countries/${country}`}
      />

      <div className="section">
        <div className="container-custom">
          <Link to="/countries" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Countries
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {countryName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {pagination?.total || 0} services available
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
            </div>
          ) : services.length === 0 ? (
            <div className="card p-12 text-center">
              <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">No services found for {countryName}</h3>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service, i) => (
                  <ServiceCard key={service._id} service={service} index={i} />
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} className="mt-8" />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
