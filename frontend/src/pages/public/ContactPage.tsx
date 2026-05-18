import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Clock } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { contactApi } from '../../api/services.api';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

export const ContactPage = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const mutation = useMutation({
    mutationFn: contactApi.submit,
    onSuccess: () => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    },
  });

  const onSubmit = (data: ContactForm) => mutation.mutate(data);

  return (
    <>
      <SEOHead title="Contact Us" description="Contact the GovServices team" canonical="/contact" />

      <div className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Get in Touch
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Have a question, suggestion, or want to submit a government service? We'd love to hear from you.
              </p>

              <div className="space-y-5">
                {[
                  { icon: Mail, title: 'Email Us', value: 'contact@govservices.com' },
                  { icon: MapPin, title: 'Location', value: 'Available globally, 24/7' },
                  { icon: Clock, title: 'Response Time', value: 'Within 24-48 hours' },
                ].map(({ icon: Icon, title, value }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Name</label>
                    <input {...register('name')} className={errors.name ? 'input-error' : 'input'} placeholder="Your name" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input {...register('email')} type="email" className={errors.email ? 'input-error' : 'input'} placeholder="your@email.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label">Subject</label>
                  <input {...register('subject')} className={errors.subject ? 'input-error' : 'input'} placeholder="How can we help?" />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="label">Message</label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    className={errors.message ? 'input-error' : 'input'}
                    placeholder="Tell us more..."
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="btn-primary w-full py-3"
                >
                  {mutation.isPending ? 'Sending...' : 'Send Message'}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};
