import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Palette, Music, Camera, Scissors, Sparkles, Shirt, Flame, Brush } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Pottery & Clay', count: '140+ Creators', icon: Coffee, bgGradient: 'from-amber-500 to-orange-600', lightBg: 'bg-amber-50', textCol: 'text-amber-700' },
  { name: 'Home Bakery', count: '210+ Creators', icon: Flame, bgGradient: 'from-rose-500 to-pink-600', lightBg: 'bg-rose-50', textCol: 'text-rose-700' },
  { name: 'Crochet & Knitting', count: '320+ Creators', icon: Scissors, bgGradient: 'from-purple-500 to-indigo-600', lightBg: 'bg-purple-50', textCol: 'text-purple-700' },
  { name: 'Resin Art & Fine Art', count: '180+ Creators', icon: Palette, bgGradient: 'from-cyan-500 to-blue-600', lightBg: 'bg-cyan-50', textCol: 'text-cyan-700' },
  { name: 'Candle Making', count: '115+ Creators', icon: Sparkles, bgGradient: 'from-amber-400 to-yellow-600', lightBg: 'bg-yellow-50', textCol: 'text-amber-800' },
  { name: 'Handmade Jewellery', count: '260+ Creators', icon: Shirt, bgGradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-50', textCol: 'text-emerald-700' },
  { name: 'Photography', count: '95+ Creators', icon: Camera, bgGradient: 'from-blue-600 to-indigo-700', lightBg: 'bg-blue-50', textCol: 'text-blue-700' },
  { name: 'Painting & Illustration', count: '190+ Creators', icon: Brush, bgGradient: 'from-fuchsia-500 to-pink-600', lightBg: 'bg-fuchsia-50', textCol: 'text-fuchsia-700' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function FeaturedCategories() {
  return (
    <section id="categories" className="py-24 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
            🎨 Discover Creative Skills
          </span>
          <h2 className="font-extrabold text-3xl md:text-5xl text-gray-900 tracking-tight">
            Explore Handcrafted <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Craft Categories</span>
          </h2>
          <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
            Connect directly with skilled artisans, join live masterclasses, and shop genuine handmade creations.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div key={i} variants={itemVariants}>
                <Link
                  to={`/categories`}
                  className={`group p-6 rounded-3xl glass-card glass-card-hover border border-white/80 flex flex-col items-center text-center cursor-pointer relative overflow-hidden transition-all duration-300`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.bgGradient} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{cat.name}</h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cat.lightBg} ${cat.textCol} mt-2 border border-black/5`}>
                    {cat.count}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-12 text-center">
          <Link 
            to="/categories" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm"
          >
            Browse All Categories & Crafts →
          </Link>
        </div>
      </div>
    </section>
  );
}
