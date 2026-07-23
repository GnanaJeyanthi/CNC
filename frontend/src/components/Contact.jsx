import React from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <section className="bg-white py-24 md:py-32 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="font-bold text-3xl md:text-4xl text-textMain mb-6 tracking-tight">Get in touch</h2>
            <p className="text-textMuted mb-10 max-w-sm text-lg">
              Have questions about becoming a seller or need help with a recent order? We're here to help.
            </p>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-textMain font-semibold mb-1">Email</h4>
                <a href="mailto:support@castncart.com" className="text-primary hover:text-blue-700 font-medium transition-colors">support@castncart.com</a>
              </div>
              <div>
                <h4 className="text-textMain font-semibold mb-1">Support Hours</h4>
                <p className="text-textMuted font-medium text-sm">Mon-Fri, 9am - 6pm EST</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 shadow-sm hover:shadow-hover transition-shadow flex flex-col gap-5">
              <div>
                <label className="block text-textMain text-sm font-semibold mb-2">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-textMain text-sm font-semibold mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-textMain text-sm font-semibold mb-2">Message</label>
                <textarea 
                  rows="4" 
                  className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="bg-primary text-white font-medium rounded-xl px-6 py-4 mt-2 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
