import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Tag, Star, Eye, MousePointerClick, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Service, Category } from '../../types';
import { servicesApi } from '../../api/services.api';
import { clsx } from 'clsx';

interface ServiceCardProps {
  service: Service;
  index?: number;
}

export const ServiceCard = ({ service, index = 0 }: ServiceCardProps) => {
  const category = service.category as Category;

  const handleExternalClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await servicesApi.trackClick(service._id);
    } catch {
      // Fire-and-forget
    }
    window.open(service.officialUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="card-hover group p-5 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {service.isFeatured && (
            <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
          {service.isSponsored && (
            <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              Sponsored
            </span>
          )}
          {category && (
            <span
              className="badge text-white text-xs"
              style={{ backgroundColor: category.color || '#3b82f6' }}
            >
              {category.name}
            </span>
          )}
        </div>

        {/* Verification */}
        {service.verificationStatus === 'verified' ? (
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" title="Verified" />
        ) : service.verificationStatus === 'broken' ? (
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" title="Broken link" />
        ) : null}
      </div>

      {/* Title */}
      <Link
        to={`/services/${service.slug}`}
        className="block font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2"
      >
        {service.title}
      </Link>

      {/* Description */}
      {service.shortDescription && (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {service.shortDescription}
        </p>
      )}

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>{[service.state, service.country].filter(Boolean).join(', ')}</span>
      </div>

      {/* Tags */}
      {service.tags && service.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag className="w-3 h-3 text-slate-400 shrink-0" />
          {service.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 mt-auto border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
          <span className={clsx('flex items-center gap-1')}>
            <Eye className="w-3.5 h-3.5" /> {service.viewCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <MousePointerClick className="w-3.5 h-3.5" /> {service.clickCount.toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleExternalClick}
          className="btn-primary text-xs px-3 py-1.5"
          aria-label={`Visit ${service.title}`}
        >
          Visit <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};
