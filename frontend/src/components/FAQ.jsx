import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { q: "How do I know a session is really live?", a: "Every broadcast on CastNCart is verified real-time. We don't support pre-recorded uploads, so you can interact with the maker in the chat and get immediate responses." },
  { q: "What happens if I miss checkout during a drop?", a: "Items are unique and sold on a first-come, first-served basis. If an item sells out during the stream, it's gone. However, many makers accept custom commissions during their broadcasts." },
  { q: "How do creators get paid?", a: "Creators receive 90% of all sales. Payouts are processed securely via Stripe and are deposited directly into your linked bank account within 2-3 business days." },
  { q: "Is there a mobile app?", a: "Currently, CastNCart is a web-first platform optimized for mobile browsers. A dedicated iOS and Android app is on our roadmap for later this year." },
  { q: "Can I sell digital products?", a: "CastNCart is specifically designed for physical, handmade goods where the creation process is part of the experience. We currently do not support digital product sales." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-slate-50 py-24 md:py-32 border-t border-border">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h2 className="font-bold text-3xl md:text-4xl text-textMain text-center mb-12 tracking-tight">Common Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
                className="border border-border rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button 
                  onClick={() => toggle(i)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                >
                  <span className="font-semibold text-textMain pr-4">{faq.q}</span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-gray-50 border border-border text-textMuted'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-0 text-textMuted leading-relaxed border-t border-border mt-2 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
