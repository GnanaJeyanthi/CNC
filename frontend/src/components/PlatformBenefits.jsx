import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function PlatformBenefits() {
  const benefits = [
    "90% revenue share for creators",
    "No inventory holding required",
    "Direct audience, no algorithm gatekeeping",
    "Secure in-stream checkout",
    "Built-in shipping & label generation"
  ];

  return (
    <section className="bg-surface py-24 md:py-32 font-sans border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="font-bold text-3xl md:text-5xl text-textMain leading-tight mb-6 tracking-tight">
              Built for <span className="text-primary">makers</span>, not just brands.
            </h2>
            <p className="text-lg text-textMuted leading-relaxed max-w-lg">
              We believe creators should keep more of what they make. 
              CastNCart provides the tools you need to sell directly to your audience in real time, without the overhead of traditional e-commerce.
            </p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="bg-white border border-border rounded-2xl p-8 md:p-12 shadow-sm hover:shadow-hover transition-shadow"
          >
            <ul className="space-y-6">
              {benefits.map((b, i) => (
                <motion.li 
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
                  }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-textMain text-lg font-medium">{b}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
