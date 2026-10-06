import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  User,
  Tag,
  MessageSquare,
  Send,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  GraduationCap,
  ShoppingBag,
  Handshake,
  Wrench,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z"/>
  </svg>
);

const YoutubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const WhatsappIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.127-1.338a9.98 9.98 0 0 0 4.885 1.28h.004c5.507 0 9.99-4.478 9.99-9.985 0-2.667-1.037-5.176-2.924-7.062A9.92 9.92 0 0 0 12.012 2zm0 18.232h-.003a8.28 8.28 0 0 1-4.224-1.157l-.303-.18-3.14.82.838-3.056-.197-.313a8.27 8.27 0 0 1-1.267-4.364c0-4.568 3.718-8.285 8.293-8.285 2.213 0 4.294.862 5.859 2.428a8.24 8.24 0 0 1 2.426 5.86c0 4.568-3.717 8.287-8.282 8.287z"/>
  </svg>
);

const TwitterXIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function ContactPage({ isComponent = false }) {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Accordion FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/contact`, formData);
      if (res.data && res.data.success) {
        setSuccessMsg('Thank you! Your message has been sent successfully. Our team will get back to you shortly.');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }
    } catch (err) {
      console.error('Contact Form Submit Error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // FAQ Data
  const faqs = [
    {
      q: 'How do I enroll in a live workshop?',
      a: 'Browse our Live Workshops page, pick your preferred category or class, and click "Join Class". You will receive instant link details and a calendar reminder.'
    },
    {
      q: 'How does product shipping and delivery work?',
      a: 'Creators ship their handcrafted physical products directly from their artisan studios. You can track real-time shipping updates directly inside your student dashboard.'
    },
    {
      q: 'Can I sell my own handmade items or host classes on CastNCart?',
      a: 'Absolutely! Click "Become a Creator" in the top menu to register your creator profile. Once verified, you can immediately list physical items or schedule live video workshops.'
    },
    {
      q: 'What payment methods are supported on CastNCart?',
      a: 'We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and Apple Pay through our secure, encrypted checkout pipeline.'
    },
    {
      q: 'How can I request a refund or reschedule a workshop?',
      a: 'You can request a full refund or transfer your enrollment up to 24 hours prior to the live workshop start time directly via your dashboard or by messaging support.'
    }
  ];

  // Why Contact Us Features Data
  const features = [
    {
      icon: GraduationCap,
      title: 'Workshop Support',
      desc: 'Guidance on live streaming setup, class schedules, objective downloads, and instructor materials.',
      color: 'bg-orange-50 text-orange-600 border-orange-100'
    },
    {
      icon: ShoppingBag,
      title: 'Product Assistance',
      desc: 'Help with custom artisan orders, order tracking, returns, and buyer protection policies.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      icon: Handshake,
      title: 'Creator Partnerships',
      desc: 'Information on verified creator applications, seller toolkits, payouts, and hosting workshops.',
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    },
    {
      icon: Wrench,
      title: 'Technical Support',
      desc: 'Assistance with account authentication, password recovery, streaming issues, and platform bug reports.',
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    }
  ];

  // Social Links
  const socialLinks = [
    { name: 'Instagram', icon: InstagramIcon, href: 'https://instagram.com', color: 'hover:bg-gradient-to-tr hover:from-amber-500 hover:to-purple-600 hover:text-white' },
    { name: 'Facebook', icon: FacebookIcon, href: 'https://facebook.com', color: 'hover:bg-blue-600 hover:text-white' },
    { name: 'LinkedIn', icon: LinkedinIcon, href: 'https://linkedin.com', color: 'hover:bg-blue-700 hover:text-white' },
    { name: 'YouTube', icon: YoutubeIcon, href: 'https://youtube.com', color: 'hover:bg-red-600 hover:text-white' },
    { name: 'WhatsApp', icon: WhatsappIcon, href: 'https://whatsapp.com', color: 'hover:bg-emerald-600 hover:text-white' },
    { name: 'Twitter (X)', icon: TwitterXIcon, href: 'https://twitter.com', color: 'hover:bg-gray-900 hover:text-white' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-orange-100 selection:text-orange-900">
      {!isComponent && <Navbar />}

      <main className="flex-1">

        {/* 2. TWO-COLUMN CONTACT & INFO SECTION */}
        <section id="contact-form" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Contact Form (7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-100"
            >
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
                <p className="text-slate-500 text-sm">Fill out the form below and our team will get back to you within 24 hours.</p>
              </div>

              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Full Name <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Subject <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Workshop Query / Order Help"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Message <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <textarea
                      name="message"
                      rows="5"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Describe how we can help you in detail..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md hover:shadow-xl hover:from-orange-600 hover:to-amber-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* RIGHT COLUMN: Information Cards (5 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 space-y-4"
            >
              {/* Office Address */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">Office Address</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    124 Artisan Way, Creative Quarter<br />
                    New York, NY 10001, United States
                  </p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">Phone Number</h3>
                  <p className="text-slate-600 text-sm font-medium">Toll-Free: +1 (800) 555-CAST</p>
                  <p className="text-slate-600 text-sm font-medium">Direct: +1 (555) 234-5678</p>
                </div>
              </div>

              {/* Email Address */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">Email Address</h3>
                  <a href="mailto:support@castncart.com" className="text-orange-600 font-semibold text-sm hover:underline">
                    support@castncart.com
                  </a>
                  <p className="text-slate-500 text-xs mt-0.5">Creators: creators@castncart.com</p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">Working Hours</h3>
                  <p className="text-slate-600 text-sm">Monday – Friday: 9:00 AM – 6:00 PM EST</p>
                  <p className="text-slate-500 text-xs mt-0.5">Saturday – Sunday: Emergency Live Stream Support</p>
                </div>
              </div>
            </motion.div>

          </div>
        </section>


        {!isComponent && (
          <>
            {/* 6. FAQ ACCORDION SECTION */}
            <section className="py-16 bg-slate-100/70 border-t border-slate-200">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
                    <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Got Questions? We Have Answers</h2>
                  <p className="text-slate-500 text-sm">Find quick answers to common queries about workshops, products, and creator tools.</p>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full px-6 py-4 text-left flex justify-between items-center gap-4 font-semibold text-slate-900 text-base focus:outline-none hover:text-orange-600 transition-colors"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                              isOpen ? 'rotate-180 text-orange-500' : ''
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-50">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 7. PREMIUM CTA SECTION */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl relative z-10">
                  <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">Need Immediate Assistance?</h2>
                  <p className="text-orange-100 text-sm sm:text-base leading-relaxed">
                    Our support team is always ready to help you with your learning journey, purchases, or creator account.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto shrink-0">
                  <a
                    href="#contact-form"
                    className="bg-white text-orange-600 font-bold px-6 py-3.5 rounded-xl shadow hover:bg-orange-50 transition text-center text-sm"
                  >
                    Contact Support
                  </a>
                  <a
                    href="/sell"
                    className="bg-orange-950/60 backdrop-blur-md text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 hover:bg-orange-950 transition text-center text-sm flex items-center justify-center gap-1.5"
                  >
                    Become a Creator <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {!isComponent && <Footer />}
    </div>
  );
}
