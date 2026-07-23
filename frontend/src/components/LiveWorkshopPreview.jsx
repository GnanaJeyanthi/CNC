import React from 'react';
import { motion } from 'framer-motion';
import { MicOff, Video, MessageSquare, PhoneOff, User, MoreHorizontal } from 'lucide-react';

export default function LiveWorkshopPreview() {
  const participants = [
    { name: 'Alex M.', initial: 'A', bg: 'bg-blue-100 text-blue-700' },
    { name: 'Sarah T.', initial: 'S', bg: 'bg-teal-100 text-teal-700' },
    { name: 'David L.', initial: 'D', bg: 'bg-orange-100 text-orange-700' },
    { name: 'Priya K.', initial: 'P', bg: 'bg-purple-100 text-purple-700' },
    { name: 'Jamie R.', initial: 'J', bg: 'bg-blue-100 text-blue-700' },
  ];

  return (
    <section className="bg-slate-50 py-24 md:py-28 font-sans overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto"
        >
          {/* Main Stage & Grid */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Host Tile */}
            <div className="relative rounded-3xl bg-gray-100 overflow-hidden border border-border p-4 aspect-video flex flex-col shadow-sm">
              <img src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Workshop" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
              
              <div className="flex justify-between items-start z-10 w-full mb-auto relative">
                <span className="flex items-center gap-1.5 bg-red-500 text-white font-bold px-2.5 py-1 rounded text-xs shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> LIVE
                </span>
                <span className="text-white/90 font-medium text-xs bg-black/40 backdrop-blur px-2 py-1 rounded">👁 421 watching</span>
              </div>
              <div className="relative z-10 mt-auto">
                <div className="inline-flex items-center gap-2.5 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
                  <span className="w-6 h-6 rounded-full bg-teal-500 overflow-hidden"><img src="https://i.pravatar.cc/150?img=4" alt="Host" className="w-full h-full object-cover" /></span>
                  <span className="text-sm font-semibold text-white">Meera's Studio (Host)</span>
                </div>
              </div>
            </div>

            {/* Participants Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {participants.map((p, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-white border border-border flex flex-col items-center justify-center relative shadow-sm">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${p.bg}`}>
                    {p.initial}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                    <span className="text-[10px] text-textMuted font-medium truncate pr-1">{p.name}</span>
                    <MicOff className="w-3 h-3 text-red-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex justify-center items-center gap-4 mt-2">
              <button className="w-12 h-12 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-gray-50 transition">
                <MicOff className="w-5 h-5 text-textMain" />
              </button>
              <button className="w-12 h-12 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-gray-50 transition">
                <Video className="w-5 h-5 text-textMain" />
              </button>
              <button className="w-12 h-12 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-gray-50 transition">
                <MessageSquare className="w-5 h-5 text-textMain" />
              </button>
              <button className="w-12 h-12 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-gray-50 transition">
                <MoreHorizontal className="w-5 h-5 text-textMain" />
              </button>
              <button className="w-12 h-12 rounded-full bg-red-50 border border-red-200 shadow-sm flex items-center justify-center hover:bg-red-100 transition ml-2">
                <PhoneOff className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="w-full lg:w-80 rounded-3xl bg-white border border-border flex flex-col overflow-hidden h-[500px] lg:h-auto shadow-sm">
            <div className="p-4 border-b border-border bg-gray-50">
              <h3 className="font-semibold text-textMain text-sm">Live Chat</h3>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
              <div className="text-xs text-textMuted text-center pb-2 font-medium">Welcome to the live session!</div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">A</div>
                <div>
                  <span className="text-xs text-secondary font-semibold mr-2">Alex M.</span>
                  <p className="text-sm text-textMain mt-0.5">That glaze color is beautiful! Will these be available today?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0"><img src="https://i.pravatar.cc/150?img=4" alt="Host" className="w-full h-full object-cover" /></div>
                <div>
                  <span className="text-xs text-primary font-semibold mr-2">Meera's Studio</span>
                  <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-bold">HOST</span>
                  <p className="text-sm text-textMain mt-0.5">Yes! I'll be dropping them in the cart in about 10 mins.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">S</div>
                <div>
                  <span className="text-xs text-secondary font-semibold mr-2">Sarah T.</span>
                  <p className="text-sm text-textMain mt-0.5">Can't wait! 💸</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-white">
              <div className="bg-slate-50 border border-border rounded-full px-4 py-2.5 flex items-center gap-2 text-textMuted text-sm">
                Say something...
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
