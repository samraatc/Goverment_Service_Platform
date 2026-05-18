import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ArrowRight, Shield, Globe, TrendingUp, CheckCircle,
  Users, Building2, Zap, Star
} from 'lucide-react';
import { SEOHead, websiteSchema } from '../../components/seo/SEOHead';
import { ServiceCard } from '../../components/services/ServiceCard';
import { ServiceCardSkeleton, CategoryCardSkeleton } from '../../components/ui/Skeleton';
import { useServices, useTrendingServices, useCategories } from '../../hooks/useServices';
import { useDebounce } from '../../hooks/useDebounce';
import { Category } from '../../types';

const STATS = [
  { icon: Building2, value: '10,000+', label: 'Government Services', color: 'text-blue-500' },
  { icon: Globe, value: '150+', label: 'Countries Covered', color: 'text-emerald-500' },
  { icon: Users, value: '500K+', label: 'Monthly Users', color: 'text-purple-500' },
  { icon: CheckCircle, value: '99%', label: 'Verified Links', color: 'text-amber-500' },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Verified & Trusted',
    description: 'Every service link is manually verified by our team to ensure authenticity.',
    color: 'bg-blue-500',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Access government services from 150+ countries in one place.',
    color: 'bg-emerald-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast Search',
    description: 'Find any government service in seconds with our intelligent search.',
    color: 'bg-amber-500',
  },
  {
    icon: TrendingUp,
    title: 'Always Updated',
    description: 'Our team continuously updates service information to keep it current.',
    color: 'bg-purple-500',
  },
];

export const HomePage = () => {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const { data: trendingData, isLoading: trendingLoading } = useTrendingServices();
  const { data: featuredData, isLoading: featuredLoading } = useServices({ isFeatured: true, limit: 6 });
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories(true);

  const categories = (categoriesData?.data || []) as Category[];
  const trendingServices = trendingData || [];
  const featuredServices = featuredData?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <>
      <SEOHead
        title="Find Government Services Worldwide"
        description="Your centralized hub for verified government services. Find official links for healthcare, education, taxation, immigration, and more across 150+ countries."
        structuredData={websiteSchema}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl" />
        </div>

        <div className="container-custom relative py-20 sm:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-medium mb-6"
            >
              <Shield className="w-4 h-4" />
              Trusted by 500K+ citizens worldwide
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Find Government Services
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-300 mt-2">
                Instantly & Securely
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Access verified official government service links for healthcare, education,
              taxation, immigration, and more — all in one trusted platform.
            </p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for passport, tax filing, healthcare..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white/15 transition-all"
                  aria-label="Search government services"
                />
              </div>
              <button type="submit" className="btn-primary py-4 px-6 rounded-xl text-base">
                Search <ArrowRight className="w-5 h-5" />
              </button>
            </motion.form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-slate-400">Popular:</span>
              {['Passport Renewal', 'Tax Filing', 'Driver License', 'Business Registration'].map(
                (term) => (
                  <Link
                    key={term}
                    to={`/search?q=${encodeURIComponent(term)}`}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 transition-all duration-200"
                  >
                    {term}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border">
        <div className="container-custom py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section bg-slate-50 dark:bg-dark-bg">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Browse by Category
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Find services organized by category for quick access
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {categoriesLoading
              ? Array.from({ length: 12 }).map((_, i) => <CategoryCardSkeleton key={i} />)
              : categories.slice(0, 12).map((cat, i) => (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={`/categories/${cat.slug}`}
                      className="card-hover flex flex-col items-center text-center p-4 gap-2.5"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        🏛️
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">
                        {cat.name}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {cat.serviceCount} services
                      </span>
                    </Link>
                  </motion.div>
                ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/categories" className="btn-secondary">
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {(featuredServices.length > 0 || featuredLoading) && (
        <section className="section">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  Featured Services
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Hand-picked government services for quick access
                </p>
              </div>
              <Link to="/services?isFeatured=true" className="btn-ghost hidden sm:flex">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {featuredLoading
                ? Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
                : featuredServices.map((service, i) => (
                    <ServiceCard key={service._id} service={service} index={i} />
                  ))}
            </div>

            <div className="text-center mt-6 sm:hidden">
              <Link to="/services?isFeatured=true" className="btn-secondary">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trending Services */}
      {(trendingServices.length > 0 || trendingLoading) && (
        <section className="section bg-slate-50 dark:bg-dark-bg/50">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  <TrendingUp className="inline w-7 h-7 text-primary-600 mr-2" />
                  Trending Now
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Most accessed services this week
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {trendingLoading
                ? Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
                : trendingServices.slice(0, 6).map((service, i) => (
                    <ServiceCard key={service._id} service={service} index={i} />
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Why Choose GovServices?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              We make it easy to find and access the government services you need
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div
                    className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-primary-600 to-blue-600 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Submit a government service link and our team will verify and add it to the platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="bg-white text-primary-700 hover:bg-primary-50 font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Submit a Service
              </Link>
              <Link
                to="/services"
                className="border border-white/30 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Browse All Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
