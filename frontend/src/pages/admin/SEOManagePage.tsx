import { motion } from 'framer-motion';
import { Search, Globe, FileText, Code, CheckCircle, AlertCircle } from 'lucide-react';

const SEO_CHECKLIST = [
  { label: 'Dynamic meta tags on all pages', status: true },
  { label: 'Open Graph tags configured', status: true },
  { label: 'Twitter Card tags added', status: true },
  { label: 'Structured data (schema.org)', status: true },
  { label: 'SEO-friendly URL slugs', status: true },
  { label: 'Canonical URLs set', status: true },
  { label: 'Breadcrumb schema', status: true },
  { label: 'Sitemap.xml generation', status: false },
  { label: 'Robots.txt configured', status: true },
  { label: 'Image alt attributes', status: true },
  { label: 'Page load < 3s', status: true },
  { label: 'Mobile-friendly design', status: true },
];

export const SEOManagePage = () => (
  <div className="space-y-5 max-w-4xl">
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">SEO Management</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Monitor and manage SEO settings across the platform</p>
    </div>

    {/* Checklist */}
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
      <h2 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-500" /> SEO Checklist
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SEO_CHECKLIST.map((item) => (
          <div key={item.label} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${item.status ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-amber-50 dark:bg-amber-900/10'}`}>
            {item.status
              ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
            <span className={`text-sm ${item.status ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>

    {/* Implementation Details */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        { icon: Search, title: 'Meta Tags', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30', items: ['Title tags (60-70 chars)', 'Meta descriptions (150-160 chars)', 'Keyword meta tags', 'Robots directives'] },
        { icon: Globe, title: 'Open Graph / Social', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30', items: ['og:title, og:description', 'og:image (1200×630)', 'og:type (website/article)', 'Twitter card tags'] },
        { icon: Code, title: 'Structured Data', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30', items: ['WebSite schema', 'GovernmentService schema', 'BreadcrumbList schema', 'SearchAction schema'] },
        { icon: FileText, title: 'Technical SEO', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30', items: ['Canonical URLs', 'robots.txt', 'SEO-friendly slugs', 'Lazy loading images'] },
      ].map(({ icon: Icon, title, color, items }, i) => (
        <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
          </div>
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>

    {/* Sitemap */}
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5 sm:p-6">
      <h2 className="font-semibold text-slate-800 dark:text-white mb-3">Sitemap & Robots</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">robots.txt</p>
          <pre className="text-xs text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap">
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://govservices.com/sitemap.xml`}
          </pre>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Sitemap Structure</p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono">
            <li>/ (homepage)</li>
            <li>/services (all published)</li>
            <li>/services/[slug] (each service)</li>
            <li>/categories (all active)</li>
            <li>/blog (published posts)</li>
            <li>/blog/[slug] (each post)</li>
          </ul>
        </div>
      </div>
    </motion.div>
  </div>
);
