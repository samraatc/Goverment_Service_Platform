import { motion } from 'framer-motion';
import { SEOHead } from '../../components/seo/SEOHead';

export const TermsPage = () => (
  <>
    <SEOHead title="Terms & Conditions" description="Read GovServices Platform terms and conditions." canonical="/terms" />
    <div className="section">
      <div className="container-custom max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Terms & Conditions</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            {[
              { title: '1. Acceptance of Terms', content: 'By accessing and using GovServices Platform, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform.' },
              { title: '2. Use of Services', content: 'GovServices provides a directory of government service links for informational purposes only. We do not represent any government entity and are not responsible for the content of external government websites.' },
              { title: '3. Accuracy of Information', content: 'While we strive to maintain accurate and up-to-date information, we make no warranties about the completeness, reliability, or accuracy of the information provided. Always verify information directly with official government sources.' },
              { title: '4. User Accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.' },
              { title: '5. Prohibited Activities', content: 'You may not use our platform to violate any laws, infringe on intellectual property rights, transmit malicious code, attempt to gain unauthorized access, or engage in any activity that disrupts our services.' },
              { title: '6. Intellectual Property', content: 'All content, trademarks, and data on this platform are the property of GovServices or its licensors. You may not reproduce, distribute, or create derivative works without express written permission.' },
              { title: '7. Limitation of Liability', content: 'GovServices shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or inability to access government services through external links.' },
              { title: '8. Changes to Terms', content: 'We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.' },
              { title: '9. Contact', content: 'For questions regarding these Terms, contact us at legal@govservices.com.' },
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
