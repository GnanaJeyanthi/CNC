import React from 'react';
import { Link } from 'react-router-dom';

const CtaStrip = () => {
  return (
    <section className="bg-ink py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-inkSoft to-ink border border-gray-800 rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-coral/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-gold/5 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-cream leading-tight">
              Your next favorite thing is being made right now
            </h2>
            <p className="text-gray-400 font-body text-lg">
              Sign up for notifications when your favorite makers go live. Don't miss out on one-of-a-kind drops.
            </p>
            <div className="pt-4">
              <Link to="/signup" className="inline-block px-8 py-4 bg-coral text-ink font-semibold rounded-lg hover:bg-orange-600 transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-ink shadow-[0_0_20px_rgba(255,107,91,0.3)] hover:shadow-[0_0_25px_rgba(255,107,91,0.5)]">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaStrip;
