import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ExternalLink, MapPin, Tag, CheckCircle, AlertTriangle, Clock,
  Eye, MousePointerClick, ArrowLeft, Share2, Calendar
} from 'lucide-react';
import { SEOHead, breadcrumbSchema } from '../../components/seo/SEOHead';
import { StatusBadge, VerificationBadge } from '../../components/ui/Badge';
import { ServiceCardSkeleton } from '../../components/ui/Skeleton';
import { useService } from '../../hooks/useServices';
import { servicesApi } from '../../api/services.api';
import { Category } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const ServiceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: service, isLoading, error } = useService(slug!);

  const handleExternalClick = async () => {
    if (!service) return;
    try {
      await servicesApi.trackClick(service._id);
    } catch {
      // ignore
    }
    window.open(service.officialUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: service?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="section">
        <div className="container-custom max-w-4xl">
          <div className="space-y-4">
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="section">
        <div className="container-custom text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Service Not Found
          </h1>
          <Link to="/services" className="btn-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const category = service.category as Category;

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: service.title,
    description: service.description,
    url: service.officialUrl,
    areaServed: service.country,
    provider: {
      '@type': 'GovernmentOrganization',
      name: `${service.country} Government`,
    },
  };

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.title, url: `/services/${service.slug}` },
  ]);

  return (
    <>
      <SEOHead
        title={service.seoTitle || service.title}
        description={service.seoDescription || service.shortDescription || service.description.slice(0, 160)}
        keywords={service.seoKeywords || service.tags}
        ogImage={service.ogImage}
        ogType="article"
        canonical={`/services/${service.slug}`}
        structuredData={serviceSchema}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>

      <div className="section">
        <div className="container-custom max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-primary-600 dark:hover:text-primary-400">Services</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 truncate">{service.title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 sm:p-8 mb-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {category && (
                  <span
                    className="badge text-white"
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                  >
                    {category.name}
                  </span>
                )}
                <StatusBadge status={service.status} />
                <VerificationBadge status={service.verificationStatus} />
                {service.isFeatured && (
                  <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    Featured
                  </span>
                )}
              </div>

              <button
                onClick={handleShare}
                className="btn-ghost self-start"
                aria-label="Share service"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {service.title}
            </h1>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-6">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{[service.state, service.country].filter(Boolean).join(', ')}</span>
            </div>

            {/* Description */}
            <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <Tag className="w-4 h-4 text-slate-400" />
                {service.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-slate-100 dark:border-slate-700 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Views</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {service.viewCount.toLocaleString()}
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                  <MousePointerClick className="w-4 h-4" />
                  <span className="text-xs">Visits</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {service.clickCount.toLocaleString()}
                </span>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Updated</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {format(new Date(service.updatedAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            {/* Official URL */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-slate-400 mb-1">Official URL</p>
                <a
                  href={service.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline break-all"
                >
                  {service.officialUrl}
                </a>
              </div>

              <button
                onClick={handleExternalClick}
                className="btn-primary shrink-0"
                aria-label={`Visit ${service.title} official website`}
              >
                Visit Official Site <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Verification Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl p-4 flex items-start gap-3 ${
              service.verificationStatus === 'verified'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                : service.verificationStatus === 'broken'
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {service.verificationStatus === 'verified' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : service.verificationStatus === 'broken' ? (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-sm text-slate-800 dark:text-slate-200">
                {service.verificationStatus === 'verified'
                  ? 'Verified Official Link'
                  : service.verificationStatus === 'broken'
                  ? 'Link May Be Broken'
                  : 'Pending Verification'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {service.verificationStatus === 'verified'
                  ? `Last verified: ${service.lastVerifiedAt ? format(new Date(service.lastVerifiedAt), 'MMM d, yyyy') : 'Recently'}`
                  : 'Please verify the link before providing sensitive information.'}
              </p>
            </div>
          </motion.div>

          <div className="mt-6">
            <Link to="/services" className="btn-ghost">
              <ArrowLeft className="w-4 h-4" /> Back to Services
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper: Helmet import
import { Helmet } from 'react-helmet-async';
