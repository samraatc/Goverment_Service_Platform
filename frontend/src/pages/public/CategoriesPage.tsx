import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Folder } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { CategoryCardSkeleton } from '../../components/ui/Skeleton';
import { useCategories } from '../../hooks/useServices';
import { Category } from '../../types';

export const CategoriesPage = () => {
  const { data, isLoading } = useCategories(true);
  const categories = (data?.data || []) as Category[];

  return (
    <>
      <SEOHead
        title="Government Service Categories"
        description="Browse government services by category including healthcare, education, taxation, immigration, employment and more."
        canonical="/categories"
      />

      <div className="section">
        <div className="container-custom">
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Service Categories
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Browse government services organized by {categories.length} categories
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {categories.map((category, i) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/categories/${category.slug}`}
                    className="card-hover flex items-center gap-4 p-5"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Folder
                        className="w-7 h-7"
                        style={{ color: category.color }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-slate-800 dark:text-white mb-0.5 truncate">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                          {category.description}
                        </p>
                      )}
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                        {category.serviceCount} services
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
