import { motion } from 'framer-motion';
import { SEOHead } from '../../components/seo/SEOHead';

export const PrivacyPage = () => (
  <>
    <SEOHead title="Privacy Policy" description="Read GovServices Platform privacy policy." canonical="/privacy" />
    <div className="section">
      <div className="container-custom max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            {[
              { title: '1. Information We Collect', content: 'We collect information you provide directly to us, such as when you create an account, contact us, or submit a service. This includes name, email address, and usage data to improve our services.' },
              { title: '2. How We Use Your Information', content: 'We use the information collected to provide, maintain, and improve our services, process transactions, send technical notices and support messages, and respond to comments and questions.' },
              { title: '3. Information Sharing', content: 'We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist in our operations, subject to confidentiality agreements.' },
              { title: '4. Data Security', content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.' },
              { title: '5. Cookies', content: 'We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.' },
              { title: '6. Your Rights', content: 'You have the right to access, update, or delete your personal information. You may also object to processing, request restriction, or request data portability. Contact us to exercise these rights.' },
              { title: '7. Contact Us', content: 'If you have questions about this Privacy Policy, please contact us at privacy@govservices.com.' },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mt-6 mb-2">{section.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{section.content}</p>
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </>
);
