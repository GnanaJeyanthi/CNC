import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const defaultWorkshops = [
  { title: 'Handbuilding Mugs & Handles', host: 'Studio Ceramics', avatar: 'https://i.pravatar.cc/150?img=4', price: '₹1,500', seats: '18/25 joined', status: 'LIVE', img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', duration: '2 Hours' },
  { title: 'Abstract Acrylic Pouring', host: 'Alex Makes Art', avatar: 'https://i.pravatar.cc/150?img=6', price: '₹950', seats: '42/50 joined', status: 'LIVE', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', duration: '1.5 Hours' },
  { title: 'Leather Wallet Crafting', host: 'Nomad Goods', avatar: 'https://i.pravatar.cc/150?img=11', price: '₹2,200', seats: '8/15 joined', status: 'IN 15M', img: 'https://images.unsplash.com/photo-1593985583274-7296068212e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', duration: '3 Hours' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function PopularWorkshops() {
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/workshops');
        if (data && data.length > 0) {
          setWorkshops(data);
        } else {
          setWorkshops(defaultWorkshops);
        }
      } catch (err) {
        console.error('Error fetching workshops:', err);
        setWorkshops(defaultWorkshops);
      }
    };
    fetchWorkshops();
  }, []);

  return (
    <section id="workshops" className="bg-background py-24 border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="font-bold text-3xl md:text-4xl text-textMain tracking-tight">Popular Live Workshops</h2>
            <p className="mt-4 text-textMuted text-lg">Join professional creators in live sessions. Learn new skills and buy their latest drops.</p>
          </div>
          <a href="#" className="text-primary hover:text-blue-700 font-semibold transition-colors flex items-center gap-1">
            View All Workshops <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </a>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {workshops.map((w, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-hover transition-all group flex flex-col cursor-pointer"
            >
              <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                <img src={w.thumbnailUrl || w.img || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3'} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1.5 ${(w.status === 'live' || w.status === 'LIVE') ? 'bg-red-500 text-white' : 'bg-white/90 text-textMain backdrop-blur-sm'}`}>
                    {(w.status === 'live' || w.status === 'LIVE') && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
                    {(w.status || 'UPCOMING').toUpperCase()}
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded">
                  {w.durationMinutes ? `${w.durationMinutes} Mins` : (w.duration || '60 Mins')}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold text-textMain mb-3 group-hover:text-primary transition-colors leading-tight">{w.title}</h3>
                
                <div className="flex items-center gap-3 mb-6 flex-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    <img src={w.creatorId?.avatar || w.avatar || 'https://i.pravatar.cc/150?img=1'} alt={w.creatorId?.name || w.host} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-textMuted">{w.creatorId?.name || w.host}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <div>
                    <div className="text-2xl font-bold text-textMain">{w.price === 0 ? 'Free' : (typeof w.price === 'number' ? `$${w.price}` : w.price)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs font-medium text-secondary bg-teal-50 px-2 py-1 rounded">
                      {w.maxParticipants ? `Max ${w.maxParticipants} limit` : (w.seats || 'Limited seats')}
                    </div>
                    <button className="bg-primary text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                      Join Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
