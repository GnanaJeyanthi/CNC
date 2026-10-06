import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { Search, Video, Calendar, Clock, User, Tag, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Painting',
  'Crochet',
  'Baking',
  'Cooking',
  'Photography',
  'Makeup',
  'Jewellery',
  'Embroidery',
  'Candle Making',
  'Soap Making',
  'Pottery',
  'Fashion Design',
  'Music',
  'Dance',
  'Art & Craft',
  'Knitting',
  'Home Decor',
  'Handmade Accessories',
  'Other'
];

export default function Workshops() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [workshops, setWorkshops] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);

  const fetchWorkshops = async (cat = category, q = search) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.get(`${API_URL}/api/workshops?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`);
      setWorkshops(data || []);
    } catch(err) {
      console.error("Error fetching workshops:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlCat = searchParams.get('category') || 'All';
    const urlSearch = searchParams.get('search') || '';
    setCategory(urlCat);
    setSearch(urlSearch);
    fetchWorkshops(urlCat, urlSearch);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (search) p.set('search', search);
      else p.delete('search');
      return p;
    });
    fetchWorkshops(category, search);
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (newCat && newCat !== 'All') p.set('category', newCat);
      else p.delete('category');
      return p;
    });
  };

  // Collect unique categories from actual workshops to complement standard categories
  const workshopCategories = Array.from(new Set(workshops.map(w => w.category).filter(Boolean)));
  const allCategoryOptions = Array.from(new Set([...CATEGORIES, ...workshopCategories]));

  return (
    <div className="min-h-screen flex flex-col bg-ambient-blobs">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 z-10">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden border border-purple-500/20">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-semibold text-purple-200 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Learning
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Live Creator Workshops
            </h1>
            <p className="text-slate-300 text-sm md:text-base">
              Learn directly from expert creators in real-time interactive classes. Join live streams, access study materials, and build new skills.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-purple-500/20 to-transparent pointer-events-none" />
        </div>

        {/* Search & Filter Controls */}
        <div className="glass-card p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search workshops by title, creator, or topic..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  if (e.target.value === '') fetchWorkshops();
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white/90"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1 text-sm"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="border border-gray-200 p-2.5 rounded-xl bg-white/90 text-sm text-gray-800 font-medium min-w-[200px] w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              {allCategoryOptions.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Workshops List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading live workshops...</p>
          </div>
        ) : workshops.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-dashed border-purple-200/80 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📹
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">No live workshops found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {search || category !== 'All' 
                ? `No workshops matched "${search || category}". Try searching another keyword or category.`
                : 'No workshops are currently scheduled.'
              }
            </p>
            {user?.role === 'Creator' && (
              <Link
                to="/dashboard/creator"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow hover:bg-purple-700 transition"
              >
                + Schedule a Workshop
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workshops.map(w => {
              const creatorName = w.creatorId?.name || 'Creator';
              const isLive = w.status === 'live';

              return (
                <div
                  key={w._id}
                  className="glass-card glass-card-hover rounded-3xl overflow-hidden shadow-sm flex flex-col group relative"
                >
                  {/* Thumbnail */}
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    {w.thumbnailUrl ? (
                      <img
                        src={w.thumbnailUrl}
                        alt={w.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-4 text-center">
                        <Video className="w-8 h-8 text-purple-400 mb-2 opacity-80" />
                        <span className="font-semibold text-sm line-clamp-1">{w.title}</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    {isLive ? (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        🔴 LIVE NOW
                      </span>
                    ) : w.status === 'ended' ? (
                      <span className="absolute top-3 left-3 bg-gray-800/80 backdrop-blur-md text-gray-300 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-400" /> Completed
                      </span>
                    ) : (
                      <span className="absolute top-3 left-3 bg-indigo-900/80 backdrop-blur-md text-indigo-200 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-400/30">
                        <Calendar className="w-3 h-3 text-purple-300" /> Scheduled
                      </span>
                    )}

                    {/* Category Tag */}
                    {w.category && (
                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                        <Tag className="w-3 h-3 text-purple-300" /> {w.category}
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>By <span className="font-semibold text-gray-700">{creatorName}</span></span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-700 transition-colors line-clamp-1">
                      {w.title}
                    </h3>

                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                      {w.description || 'No description provided.'}
                    </p>

                    <div className="space-y-1.5 text-xs text-gray-600 mb-5 bg-purple-50/50 p-3 rounded-xl border border-purple-100/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>{w.scheduledDate ? new Date(w.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span>{w.scheduledDate ? new Date(w.scheduledDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'TBA'} ({w.durationMinutes || 60} mins)</span>
                      </div>
                    </div>

                    {/* Price and Join Footer */}
                    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div>
                        <span className="text-xl font-extrabold text-gray-900">
                          {w.price === 0 || !w.price ? (
                            <span className="text-green-600 font-black">Free</span>
                          ) : (
                            `₹${w.price}`
                          )}
                        </span>
                      </div>

                      <Link
                        to={`/workshops/${w._id}`}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 ${
                          isLive 
                            ? 'bg-red-600 text-white hover:bg-red-700 animate-bounce' 
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {isLive ? '🔴 Join Live Now' : 'View Workshop'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
