import { motion } from 'framer-motion';
import { Shield, Globe, Users, CheckCircle, Target, Heart } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';

const TEAM = [
  { name: 'Sarah Mitchell', role: 'CEO & Founder', avatar: 'SM' },
  { name: 'David Chen', role: 'CTO', avatar: 'DC' },
  { name: 'Aisha Patel', role: 'Head of Content', avatar: 'AP' },
  { name: 'Marcus Johnson', role: 'Lead Developer', avatar: 'MJ' },
];

const VALUES = [
  { icon: Shield, title: 'Trust & Accuracy', description: 'Every service is manually verified before listing.', color: 'bg-blue-500' },
  { icon: Globe, title: 'Global Reach', description: 'Serving citizens across 150+ countries worldwide.', color: 'bg-emerald-500' },
  { icon: Heart, title: 'Public Service', description: 'Built to serve citizens, not profit from them.', color: 'bg-rose-500' },
  { icon: Target, title: 'Simplicity', description: 'Making government services easy to find and access.', color: 'bg-amber-500' },
];

export const AboutPage = () => (
  <>
    <SEOHead
      title="About GovServices"
      description="Learn about GovServices Platform — our mission to make government services accessible to everyone worldwide."
      canonical="/about"
    />

    {/* Hero */}
    <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 text-white py-20 sm:py-28">
      <div className="container-custom text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Making Government Services <span className="text-primary-300">Accessible</span>
          </h1>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto leading-relaxed">
            GovServices is a centralized platform dedicated to helping citizens around the world
            find and access official government services quickly and securely.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Mission */}
    <section className="section">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              We believe that accessing government services should not be complicated. Whether you need
              to renew your passport, file taxes, or find healthcare resources, our platform provides
              direct, verified links to official government portals.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Founded in 2024, GovServices has grown to serve over 500,000 monthly users across
              150+ countries, with a dedicated team constantly verifying and updating service information.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '10,000+', label: 'Services Listed' },
                { value: '150+', label: 'Countries' },
                { value: '500K+', label: 'Monthly Users' },
                { value: '99%', label: 'Uptime' },
              ].map((stat) => (
                <div key={stat.label} className="card p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stat.value}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VALUES.map((value, i) => {
                const Icon = value.icon;
                return (
                  <motion.div key={value.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-5">
                    <div className={`w-10 h-10 ${value.color} rounded-lg flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1.5">{value.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="section bg-slate-50 dark:bg-dark-bg/50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">Meet the Team</h2>
          <p className="text-slate-500 dark:text-slate-400">The people behind GovServices</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map((member, i) => (
            <motion.div key={member.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-5 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                {member.avatar}
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{member.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
);
