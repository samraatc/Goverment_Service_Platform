import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { useAuthStore } from './store/useAuthStore';

// ─── Lazy-load pages for code splitting ───────────────────────────────────────
// Public
const HomePage = lazy(() => import('./pages/public/HomePage').then((m) => ({ default: m.HomePage })));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() => import('./pages/public/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })));
const CategoriesPage = lazy(() => import('./pages/public/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const SearchPage = lazy(() => import('./pages/public/SearchPage').then((m) => ({ default: m.SearchPage })));
const CountryPage = lazy(() => import('./pages/public/CountryPage').then((m) => ({ default: m.CountryPage })));
const AboutPage = lazy(() => import('./pages/public/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/public/ContactPage').then((m) => ({ default: m.ContactPage })));
const BlogPage = lazy(() => import('./pages/public/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() => import('./pages/public/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })));
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/public/TermsPage').then((m) => ({ default: m.TermsPage })));
const LoginPage = lazy(() => import('./pages/public/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Admin
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ServicesManagePage = lazy(() => import('./pages/admin/ServicesManagePage').then((m) => ({ default: m.ServicesManagePage })));
const ServiceFormPage = lazy(() => import('./pages/admin/ServiceFormPage').then((m) => ({ default: m.ServiceFormPage })));
const CategoriesManagePage = lazy(() => import('./pages/admin/CategoriesManagePage').then((m) => ({ default: m.CategoriesManagePage })));
const UsersManagePage = lazy(() => import('./pages/admin/UsersManagePage').then((m) => ({ default: m.UsersManagePage })));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const LogsPage = lazy(() => import('./pages/admin/LogsPage').then((m) => ({ default: m.LogsPage })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const SEOManagePage = lazy(() => import('./pages/admin/SEOManagePage').then((m) => ({ default: m.SEOManagePage })));
const AdsManagePage = lazy(() => import('./pages/admin/AdsManagePage').then((m) => ({ default: m.AdsManagePage })));
const RoleManagePage = lazy(() => import('./pages/admin/RoleManagePage').then((m) => ({ default: m.RoleManagePage })));

// ─── Page Loader ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
    </div>
  </div>
);

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ─── Public ─────────────────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:slug" element={<ServiceDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/:slug" element={<ServicesPage />} />
          <Route path="countries/:country" element={<CountryPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* ─── Admin ──────────────────────────────────────────────────────── */}
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['super_admin', 'admin', 'editor']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="services" element={<ServicesManagePage />} />
          <Route path="services/new" element={<ServiceFormPage />} />
          <Route path="services/:id/edit" element={<ServiceFormPage />} />
          <Route path="categories" element={<CategoriesManagePage />} />
          <Route
            path="users"
            element={
              <ProtectedRoute roles={['super_admin', 'admin']}>
                <UsersManagePage />
              </ProtectedRoute>
            }
          />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="seo" element={<SEOManagePage />} />
          <Route path="ads" element={<AdsManagePage />} />
          <Route
            path="roles"
            element={
              <ProtectedRoute roles={['super_admin']}>
                <RoleManagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute roles={['super_admin']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ─── 404 ────────────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
