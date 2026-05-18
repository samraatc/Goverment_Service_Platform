import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowLeft, Tag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { blogsApi } from '../../api/services.api';
import { SEOHead } from '../../components/seo/SEOHead';
import { Skeleton } from '../../components/ui/Skeleton';
import { format } from 'date-fns';

export const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogsApi.getBySlug(slug!).then((r) => r.data.data),
    enabled: !!slug,
  });

  if (isLoading) return (
    <div className="section">
      <div className="container-custom max-w-3xl space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full rounded-xl" />
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
      </div>
    </div>
  );

  if (error || !blog) return (
    <div className="section">
      <div className="container-custom text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Blog Post Not Found</h1>
        <Link to="/blog" className="btn-primary"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
      </div>
    </div>
  );

  const author = blog.author as { name?: string; avatar?: string };

  return (
    <>
      <SEOHead
        title={blog.seoTitle || blog.title}
        description={blog.seoDescription || blog.excerpt}
        ogImage={blog.coverImage}
        ogType="article"
        canonical={`/blog/${blog.slug}`}
      />

      <div className="section">
        <div className="container-custom max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-primary-600 dark:hover:text-primary-400">Blog</Link>
            <span>/</span>
            <span className="truncate text-slate-700 dark:text-slate-300">{blog.title}</span>
          </nav>

          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Meta */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {blog.category && <span className="badge badge-info">{blog.category}</span>}
              {blog.isFeature && <span className="badge badge-warning">Featured</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              {blog.title}
            </h1>

            {/* Author row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 pb-6 border-b border-slate-200 dark:border-dark-border mb-6">
              <span className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {author?.name?.[0] || 'A'}
                </div>
                {author?.name || 'GovServices Team'}
              </span>
              {blog.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(blog.publishedAt), 'MMMM d, yyyy')}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {blog.viewCount} views
              </span>
            </div>

            {/* Cover Image */}
            {blog.coverImage && (
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full rounded-xl mb-8 aspect-video object-cover"
                loading="lazy"
              />
            )}

            {/* Content */}
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-8 pt-6 border-t border-slate-200 dark:border-dark-border">
                <Tag className="w-4 h-4 text-slate-400" />
                {blog.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8">
              <Link to="/blog" className="btn-ghost">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </Link>
            </div>
          </motion.article>
        </div>
      </div>
    </>
  );
};
