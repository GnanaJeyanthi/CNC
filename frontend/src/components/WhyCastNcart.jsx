import React from 'react';

const WhyCastNcart = () => {
  return (
    <section className="bg-inkSoft py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-cream">
            Built for the <span className="text-gold italic">live</span> experience
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-800/50 rounded-2xl overflow-hidden bg-ink">
          
          <div className="p-8 lg:p-12 border-b md:border-b-0 md:border-r border-gray-800/50 hover:bg-white/5 transition-colors group">
            <div className="w-12 h-12 bg-coral/10 text-coral rounded-xl flex items-center justify-center mb-6 ring-1 ring-coral/20 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-cream mb-3">Real-time, not recorded</h3>
            <p className="text-gray-400 font-body leading-relaxed">
              Interact with makers as they create. Ask questions, request details, and see the craftsmanship unfold live before your eyes.
            </p>
          </div>
          
          <div className="p-8 lg:p-12 border-b md:border-b-0 md:border-r border-gray-800/50 hover:bg-white/5 transition-colors group">
            <div className="w-12 h-12 bg-gold/10 text-gold rounded-xl flex items-center justify-center mb-6 ring-1 ring-gold/20 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-cream mb-3">Checkout without leaving</h3>
            <p className="text-gray-400 font-body leading-relaxed">
              Found something you love? Add it to your cart and check out instantly without ever missing a moment of the broadcast.
            </p>
          </div>
          
          <div className="p-8 lg:p-12 hover:bg-white/5 transition-colors group">
            <div className="w-12 h-12 bg-sage/10 text-sage rounded-xl flex items-center justify-center mb-6 ring-1 ring-sage/20 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-cream mb-3">Built for makers</h3>
            <p className="text-gray-400 font-body leading-relaxed">
              We take a transparent 10% fee. No hidden costs, no algorithm gatekeeping. You own your audience and keep your profits.
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default WhyCastNcart;
