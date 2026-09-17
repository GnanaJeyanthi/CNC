import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroVideo from '../assets/Artist_creating_painting_in_studio_202607231152.mp4';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-40 px-8 lg:px-14 overflow-hidden min-h-[80vh] flex items-center">
      {/* Background Video */}
      <video 
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
            </span>
            Live platform for creators
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.15] mb-6 tracking-tight">
            Learn. Create. Sell.<br/>
            <span className="text-[#FDE047]">Everything in One Place.</span>
          </h1>
          
          <p className="text-lg text-gray-200 mb-10 max-w-xl leading-relaxed">
            Join thousands of talented creators who broadcast their craft in real-time and sell their handcrafted products directly to their audience.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-12">
            <Link to="/live" className="bg-primary text-white font-medium px-8 py-4 rounded-xl hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl">
              Join Live Workshop
            </Link>
            <Link to="/login" className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-medium px-8 py-4 rounded-xl hover:bg-white/20 transition-colors shadow-sm">
              Become a Creator
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-300">
            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Secure Platform</div>
            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Live Workshops</div>
            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Digital Products</div>
            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Trusted Creators</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
