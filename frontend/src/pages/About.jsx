import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Sparkles,
  Video,
  ShoppingBag,
  Users,
  Award,
  Heart,
  Globe,
  ShieldCheck,
  Zap,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

export default function About() {
  const stats = [
    { label: 'Active Learners', value: '10,000+', icon: Users },
    { label: 'Verified Creators', value: '500+', icon: Award },
    { label: 'Live Workshops Hosted', value: '1,200+', icon: Video },
    { label: 'Handcrafted Products', value: '3,500+', icon: ShoppingBag }
  ];

  const pillars = [
    {
      icon: Video,
      title: 'Interactive Live Workshops',
      desc: 'Learn directly from master artisans in real-time. Ask questions, get immediate feedback, and download class materials.',
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    },
    {
      icon: ShoppingBag,
      title: 'Artisan Marketplace',
      desc: 'Discover authentic, handcrafted goods crafted by independent creators—from ceramics and jewelry to paintings and home decor.',
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      icon: Users,
      title: 'Creator Empowerment',
      desc: 'We provide creators with live streaming tools, store setups, analytics, and instant payouts to turn their craft into a career.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      icon: ShieldCheck,
      title: 'Buyer & Learner Trust',
      desc: 'Enjoy secure payments, verified instructor credentials, order tracking, and 24/7 dedicated support.',
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passion for Craftsmanship',
      desc: 'We celebrate handmade quality, originality, and the human story behind every workshop and creation.'
    },
    {
      icon: Globe,
      title: 'Global Community',
      desc: 'Connecting creative minds across continents to share traditions, modern techniques, and artistic inspiration.'
    },
    {
      icon: Zap,
      title: 'Seamless Live Technology',
      desc: 'Harnessing ultra-low latency live video streaming so students feel right inside the creator’s studio.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" /> About CastNCart
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto"
            >
              Where Live Skill Workshops Meet Handcrafted Artistry
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light"
            >
              CastNCart is the premier platform empowering creators to host live interactive workshops and sell unique physical crafts to a global community of learners.
            </motion.p>
          </div>
        </section>

        {/* IMPACT STATS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 text-center flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-3">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* OUR STORY & MISSION */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-6 space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                  <GraduationCap className="w-3.5 h-3.5" /> Our Story & Mission
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  Bridging the Gap Between Learning & Creator Commerce
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  CastNCart was born out of a simple vision: skilled artisans deserve a platform where they can teach their craft live, while simultaneously offering their finished products to students and art lovers.
                </p>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Whether it's master pottery, acrylic painting, baking, embroidery, or handmade jewelry, CastNCart provides the live stream infrastructure, payment security, and community tools needed for creators to thrive.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-6 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3 text-purple-200">Why CastNCart?</h3>
                  <ul className="space-y-4 text-sm text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</span>
                      <span><strong>Real-time Live Interaction:</strong> Ask questions, get immediate feedback, and follow along step-by-step.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</span>
                      <span><strong>Direct Marketplace Buying:</strong> Support creators directly by ordering handmade physical goods.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</span>
                      <span><strong>Verified Instructors:</strong> Quality instruction from passionate experts with real craft experience.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* FOUR PILLARS OF PLATFORM */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Our Core Platform Pillars</h2>
            <p className="text-slate-500 text-sm">Built from the ground up to support both passionate learners and independent creators.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${pillar.color}`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{pillar.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* OUR VALUES */}
        <section className="py-16 bg-slate-100/60 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">What We Stand For</h2>
              <p className="text-slate-500 text-sm">Core values guiding our platform design, community standards, and creator support.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((val, idx) => {
                const IconComp = val.icon;
                return (
                  <motion.div
                    key={val.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm flex flex-col items-center text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-4">
                      <IconComp className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{val.title}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{val.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to Start Your Creative Journey?</h2>
              <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
                Join thousands of students learning live crafts or set up your creator store to share your talent with the world.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
              <Link
                to="/workshops"
                className="bg-white text-purple-700 font-bold px-6 py-3.5 rounded-xl shadow hover:bg-purple-50 transition text-center text-sm"
              >
                Explore Workshops
              </Link>
              <Link
                to="/sell"
                className="bg-purple-950/60 text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 hover:bg-purple-950 transition text-center text-sm flex items-center justify-center gap-1.5"
              >
                Become a Creator <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
