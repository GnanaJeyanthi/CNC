import React from 'react';
import { motion } from 'framer-motion';

const reviews = [
  { quote: "The adrenaline of watching a piece come out of the kiln and checking out before anyone else grabs it is unmatched.", name: "Sarah Jenkins", role: "Buyer since 2025", initial: "S" },
  { quote: "I used to photograph inventory, write descriptions, and hope the algorithm liked me. Now I just turn on my camera and sell out in 20 minutes.", name: "Marcus T.", role: "Creator, Ceramics", initial: "M" },
  { quote: "It feels like hanging out in my favorite artist's studio. Being able to ask questions while they work completely changes the buying experience.", name: "Elena R.", role: "Collector", initial: "E" },
];

export default function Testimonials() {
  return (
    <section className="bg-background py-24 md:py-32 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl text-textMain tracking-tight">The community is talking</h2>
          <p className="mt-4 text-textMuted text-lg">See why thousands of creators and buyers love CastNCart.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="bg-surface border border-border p-8 rounded-2xl shadow-sm hover:shadow-hover transition-all flex flex-col justify-between"
            >
              <div className="text-primary opacity-20 text-5xl font-bold leading-none mb-4">"</div>
              <p className="text-textMain text-lg leading-relaxed mb-8 flex-grow">
                {r.quote}
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-blue-50 text-primary">
                  {r.initial}
                </div>
                <div>
                  <h4 className="font-semibold text-textMain">{r.name}</h4>
                  <p className="text-xs text-textMuted font-medium mt-1 uppercase tracking-wider">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
