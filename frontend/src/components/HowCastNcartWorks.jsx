import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Eye, ShoppingBag } from 'lucide-react';

const steps = [
  { num: '1', title: 'Choose a Creator', description: 'Browse talented makers and find sessions that match your interests.', icon: Compass },
  { num: '2', title: 'Join a Live Workshop', description: 'Watch them work, ask questions, and learn their unique techniques.', icon: Eye },
  { num: '3', title: 'Buy Handmade Products', description: 'Purchase items directly from the stream before anyone else.', icon: ShoppingBag },
];

export default function HowCastNcartWorks() {
  return (
    <section className="bg-slate-50 py-24 md:py-32 overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <h2 className="font-bold text-3xl md:text-4xl text-textMain tracking-tight">How CastNCart Works</h2>
          <p className="mt-4 text-textMuted text-lg">Your journey from discovering a craft to owning a masterpiece in three simple steps.</p>
        </div>
        
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-border border-dashed border-t-2"></div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10"
          >
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                  }}
                  className="flex flex-col items-center text-center bg-surface p-8 rounded-2xl shadow-sm border border-border relative group hover:shadow-hover transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                    <Icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-white border border-border shadow-sm rounded-full flex items-center justify-center font-bold text-primary">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-textMain text-xl mb-3">{step.title}</h3>
                  <p className="text-textMuted text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
