import React from 'react';
import { motion } from 'framer-motion';

const creators = [
  { name: 'Meera', tag: 'Ceramic Artist', followers: '12.4k', products: 142, rating: 4.9, avatar: 'https://i.pravatar.cc/150?img=1', cover: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
  { name: 'Arjun', tag: 'Leather Crafts', followers: '8.2k', products: 89, rating: 4.8, avatar: 'https://i.pravatar.cc/150?img=11', cover: 'https://images.unsplash.com/photo-1593985583274-7296068212e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
  { name: 'Studio Noor', tag: 'Textile Design', followers: '24.1k', products: 312, rating: 5.0, avatar: 'https://i.pravatar.cc/150?img=5', cover: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
  { name: 'Devika', tag: 'Fine Jewelry', followers: '15.8k', products: 204, rating: 4.9, avatar: 'https://i.pravatar.cc/150?img=9', cover: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
];

export default function FeaturedCreators() {
  return (
    <section className="bg-slate-50 py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl text-textMain tracking-tight">Trending Creators</h2>
          <p className="mt-4 text-textMuted text-lg">Follow top creators, learn their craft, and buy their exclusive products.</p>
        </div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {creators.map((c, i) => (
            <motion.div 
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
              whileHover={{ y: -4 }}
              className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-hover transition-all cursor-pointer group flex flex-col"
            >
              <div className="h-32 w-full relative overflow-hidden">
                <img src={c.cover} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              
              <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-surface bg-gray-200 -mt-10 overflow-hidden mb-4 shadow-sm relative z-10">
                  <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                </div>
                
                <h3 className="font-semibold text-textMain text-lg text-center">{c.name}</h3>
                <p className="text-sm text-secondary font-medium mt-1">{c.tag}</p>
                
                <div className="flex gap-4 mt-4 text-center text-sm w-full pt-4 border-t border-border">
                  <div className="flex-1">
                    <p className="font-semibold text-textMain">{c.followers}</p>
                    <p className="text-xs text-textMuted">Followers</p>
                  </div>
                  <div className="flex-1 border-l border-border">
                    <p className="font-semibold text-textMain">{c.products}</p>
                    <p className="text-xs text-textMuted">Sales</p>
                  </div>
                  <div className="flex-1 border-l border-border">
                    <p className="font-semibold text-textMain flex items-center justify-center gap-1">
                      {c.rating}
                      <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </p>
                    <p className="text-xs text-textMuted">Rating</p>
                  </div>
                </div>
                
                <button className="mt-6 w-full py-2.5 rounded-xl border border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors text-sm">
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
