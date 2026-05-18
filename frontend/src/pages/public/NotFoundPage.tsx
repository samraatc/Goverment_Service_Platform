import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';

export const NotFoundPage = () => (
  <>
    <SEOHead title="404 - Page Not Found" noIndex />
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="container-custom text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-8xl sm:text-9xl font-black text-slate-200 dark:text-slate-700 mb-4">
            404
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Page Not Found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-primary">
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <Link to="/services" className="btn-secondary">
              <Search className="w-4 h-4" /> Browse Services
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  </>
);
