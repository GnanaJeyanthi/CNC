import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Palette, Music, Camera, Activity, Scissors, Sparkles, Shirt } from 'lucide-react';

const categories = [
  { name: 'Pottery & Ceramics', count: '124 creators', icon: Coffee },
  { name: 'Fine Art', count: '89 creators', icon: Palette },
  { name: 'Textiles & Fashion', count: '215 creators', icon: Shirt },
  { name: 'Music Production', count: '64 creators', icon: Music },
  { name: 'Photography', count: '42 creators', icon: Camera },
  { name: 'Craft & Woodwork', count: '156 creators', icon: Scissors },
  { name: 'Fitness & Wellness', count: '38 creators', icon: Activity },
  { name: 'Beauty & Skincare', count: '92 creators', icon: Sparkles },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function FeaturedCategories() {
  return (
    <section id="categories" className="bg-background py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl text-textMain tracking-tight">Explore Categories</h2>
          <p className="mt-4 text-textMuted text-lg">Discover talented creators streaming live and selling unique goods in your favorite categories.</p>
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
              <motion.a
                href="#"
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="group p-6 rounded-2xl bg-surface shadow-sm border border-border hover:shadow-hover hover:border-primary/30 transition-all flex flex-col items-center text-center cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-4">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-textMain group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-sm text-textMuted mt-1">{cat.count}</p>
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
