import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowRight, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { blogsApi } from '../../api/services.api';
import { SEOHead } from '../../components/seo/SEOHead';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { Blog } from '../../types';
import { format } from 'date-fns';

const BlogCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <Skeleton className="h-40 w-full rounded-lg" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

export const BlogPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', page],
    queryFn: () => blogsApi.getAll({ page, limit: 9 }).then((r) => r.data),
  });

  const blogs: Blog[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <SEOHead
        title="Blog — Government Services Insights"
        description="Read the latest articles, guides and updates about government services, civic tech, and public administration worldwide."
        canonical="/blog"
      />

      {/* Header */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16 sm:py-20">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <BookOpen className="w-10 h-10 text-primary-400 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">GovServices Blog</h1>
            <p className="text-slate-300 max-w-xl mx-auto">
              Guides, updates, and insights about government services and civic technology
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => <BlogCardSkeleton key={i} />)}
            </div>
          ) : blogs.length === 0 ? (
            <div className="card p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">No blog posts yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Check back soon for articles and guides.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {blogs.map((blog, i) => (
                  <motion.article
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-hover overflow-hidden group"
                  >
                    {/* Cover */}
                    <div className="h-44 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 flex items-center justify-center overflow-hidden">
                      {blog.coverImage ? (
                        <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <BookOpen className="w-12 h-12 text-primary-300 dark:text-primary-700" />
                      )}
                    </div>

                    <div className="p-5">
                      {blog.category && (
                        <span className="badge badge-info mb-2">{blog.category}</span>
                      )}
                      <h2 className="font-semibold text-slate-800 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                      </h2>
                      {blog.excerpt && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{blog.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {(blog.author as { name?: string })?.name || 'Team'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {blog.publishedAt ? format(new Date(blog.publishedAt), 'MMM d, yyyy') : '—'}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {blog.viewCount}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} className="mt-10" />
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};
