import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CategoryManagement from './dashboard/CategoryManagement';
import { AuthContext } from '../context/AuthContext';
import {
  Palette,
  Scissors,
  Cake,
  Gem,
  Flame,
  Camera,
  Sparkles,
  Search,
  Video,
  ShoppingBag,
  BookOpen,
  Settings,
  Brush,
  Flower2,
  Shirt,
  Music,
  Heart,
  Star,
  Sun,
  Droplets,
  Gift,
  Leaf,
  PenTool,
  Layers,
  Feather,
  Crown
} from 'lucide-react';

/* ================================================================
   FULL CATEGORY LIST — Organized by creative groups
   ================================================================ */
const CATEGORY_GROUPS = [
  {
    groupName: '🎨 Art & Creative',
    groupColor: 'from-violet-600 to-purple-700',
    categories: [
      { id: 'painting', name: 'Painting', icon: Palette, color: 'from-violet-500 to-purple-600', bgColor: 'bg-violet-50 text-violet-600 border-violet-200', desc: 'Oil, acrylic, watercolor, portraiture & abstract canvas art.' },
      { id: 'sketching-drawing', name: 'Sketching & Drawing', icon: PenTool, color: 'from-slate-500 to-gray-700', bgColor: 'bg-slate-50 text-slate-600 border-slate-200', desc: 'Pencil sketching, charcoal, figure drawing & illustration.' },
      { id: 'digital-art', name: 'Digital Art & Design', icon: Layers, color: 'from-cyan-500 to-blue-600', bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-200', desc: 'Digital illustration, graphic design, Procreate & tablet art.' },
      { id: 'calligraphy', name: 'Calligraphy & Hand Lettering', icon: Feather, color: 'from-amber-600 to-yellow-700', bgColor: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'Brush lettering, modern calligraphy, hand-lettered quotes.' },
      { id: 'photography', name: 'Photography', icon: Camera, color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50 text-blue-600 border-blue-200', desc: 'Product photography, portrait lighting, editing & composition.' },
      { id: 'craft-making', name: 'Craft Making', icon: Scissors, color: 'from-pink-500 to-rose-600', bgColor: 'bg-pink-50 text-pink-600 border-pink-200', desc: 'General handcrafts, mixed media, DIY art projects.' },
    ],
  },
  {
    groupName: '🧶 Handmade & Crafts',
    groupColor: 'from-amber-500 to-orange-600',
    categories: [
      { id: 'crochet-knitting', name: 'Crochet & Knitting', icon: Heart, color: 'from-rose-500 to-pink-600', bgColor: 'bg-rose-50 text-rose-600 border-rose-200', desc: 'Amigurumi, sweaters, plushies, yarn crafts & crochet patterns.' },
      { id: 'embroidery', name: 'Embroidery', icon: Sparkles, color: 'from-fuchsia-500 to-pink-600', bgColor: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200', desc: 'Hand needlework, sashiko, thread painting & hoop art.' },
      { id: 'macrame', name: 'Macramé', icon: Feather, color: 'from-lime-500 to-green-600', bgColor: 'bg-lime-50 text-lime-700 border-lime-200', desc: 'Knotting, wall hangings, plant hangers & boho décor.' },
      { id: 'sewing-tailoring', name: 'Sewing & Tailoring', icon: Scissors, color: 'from-indigo-500 to-blue-600', bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-200', desc: 'Garment construction, pattern making & tailoring skills.' },
      { id: 'pottery-ceramics', name: 'Pottery & Ceramics', icon: Flame, color: 'from-orange-500 to-amber-700', bgColor: 'bg-orange-50 text-orange-600 border-orange-200', desc: 'Wheel throwing, clay sculpting, ceramic glazing & mugs.' },
      { id: 'resin-art', name: 'Resin Art', icon: Droplets, color: 'from-teal-500 to-cyan-600', bgColor: 'bg-teal-50 text-teal-600 border-teal-200', desc: 'Epoxy resin coasters, trays, jewelry & mixed-media resin.' },
      { id: 'woodcraft', name: 'Woodcraft', icon: Layers, color: 'from-yellow-700 to-amber-800', bgColor: 'bg-yellow-50 text-yellow-800 border-yellow-200', desc: 'Wood carving, pyrography, furniture & wooden décor pieces.' },
      { id: 'paper-crafts', name: 'Paper Crafts', icon: BookOpen, color: 'from-sky-500 to-blue-600', bgColor: 'bg-sky-50 text-sky-600 border-sky-200', desc: 'Origami, quilling, scrapbooking, paper flowers & cards.' },
      { id: 'handmade-toys', name: 'Handmade Toys', icon: Star, color: 'from-yellow-400 to-orange-500', bgColor: 'bg-yellow-50 text-yellow-600 border-yellow-200', desc: 'Stuffed animals, wooden toys, soft dolls & baby-safe crafts.' },
      { id: 'handmade-accessories', name: 'Handmade Accessories', icon: Crown, color: 'from-purple-500 to-violet-600', bgColor: 'bg-purple-50 text-purple-600 border-purple-200', desc: 'Bags, hair accessories, keychains, bookmarks & more.' },
    ],
  },
  {
    groupName: '💎 Fashion & Beauty',
    groupColor: 'from-pink-500 to-rose-600',
    categories: [
      { id: 'jewellery-making', name: 'Jewellery Making', icon: Gem, color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200', desc: 'Resin jewelry, polymer clay, beadwork & silver craft.' },
      { id: 'fashion-styling', name: 'Fashion & Styling', icon: Shirt, color: 'from-pink-500 to-fuchsia-600', bgColor: 'bg-pink-50 text-pink-600 border-pink-200', desc: 'Personal styling, fashion design, outfit curation & trends.' },
      { id: 'makeup-beauty', name: 'Makeup & Beauty', icon: Sparkles, color: 'from-rose-400 to-pink-600', bgColor: 'bg-rose-50 text-rose-500 border-rose-200', desc: 'Bridal makeup, skincare, beauty hacks & cosmetics tutorials.' },
      { id: 'nail-art', name: 'Nail Art', icon: Brush, color: 'from-red-400 to-rose-600', bgColor: 'bg-red-50 text-red-500 border-red-200', desc: 'Gel nails, nail painting, stamping, 3D art & manicure designs.' },
      { id: 'mehndi-henna', name: 'Mehndi & Henna Art', icon: PenTool, color: 'from-orange-500 to-red-600', bgColor: 'bg-orange-50 text-orange-600 border-orange-200', desc: 'Traditional mehndi, bridal henna, Arabic designs & tutorials.' },
    ],
  },
  {
    groupName: '🍰 Food & Kitchen',
    groupColor: 'from-rose-500 to-red-600',
    categories: [
      { id: 'baking', name: 'Baking', icon: Cake, color: 'from-rose-500 to-pink-600', bgColor: 'bg-rose-50 text-rose-600 border-rose-200', desc: 'Artisan sourdough, cake decorating, pastries & dessert art.' },
      { id: 'chocolate-making', name: 'Chocolate Making', icon: Heart, color: 'from-amber-700 to-yellow-900', bgColor: 'bg-amber-50 text-amber-800 border-amber-200', desc: 'Truffles, pralines, bonbons, tempering & chocolate art.' },
      { id: 'dessert-making', name: 'Dessert Making', icon: Sparkles, color: 'from-pink-400 to-rose-500', bgColor: 'bg-pink-50 text-pink-500 border-pink-200', desc: 'Puddings, mousse, cheesecakes, ice-cream & fusion desserts.' },
      { id: 'cooking-recipes', name: 'Cooking & Recipes', icon: Flame, color: 'from-red-500 to-orange-600', bgColor: 'bg-red-50 text-red-600 border-red-200', desc: 'Regional cuisines, home cooking, meal prep & recipe sharing.' },
      { id: 'pickle-homemade', name: 'Pickle & Homemade Foods', icon: Sun, color: 'from-yellow-500 to-amber-600', bgColor: 'bg-yellow-50 text-yellow-700 border-yellow-200', desc: 'Homemade pickles, chutneys, jams, masala powders & snacks.' },
    ],
  },
  {
    groupName: '🕯️ Home & Lifestyle',
    groupColor: 'from-amber-400 to-yellow-600',
    categories: [
      { id: 'candle-making', name: 'Candle Making', icon: Flame, color: 'from-amber-400 to-yellow-600', bgColor: 'bg-amber-50 text-amber-600 border-amber-200', desc: 'Scented soy wax, beeswax, gel candles & decorative candles.' },
      { id: 'soap-making', name: 'Soap Making', icon: Droplets, color: 'from-sky-400 to-blue-500', bgColor: 'bg-sky-50 text-sky-600 border-sky-200', desc: 'Melt & pour, cold process, handmade soap & bath products.' },
      { id: 'flower-floral-art', name: 'Flower & Floral Art', icon: Flower2, color: 'from-pink-400 to-rose-500', bgColor: 'bg-pink-50 text-pink-500 border-pink-200', desc: 'Fresh & dried flower arrangements, bouquets & floral design.' },
      { id: 'home-decor', name: 'Home Décor', icon: Star, color: 'from-violet-400 to-purple-600', bgColor: 'bg-violet-50 text-violet-600 border-violet-200', desc: 'Wall art, furniture upcycling, interior styling & DIY décor.' },
    ],
  },
  {
    groupName: '⭐ More Creative Skills',
    groupColor: 'from-indigo-500 to-blue-700',
    categories: [
      { id: 'gift-hamper', name: 'Gift & Hamper Making', icon: Gift, color: 'from-red-400 to-pink-500', bgColor: 'bg-red-50 text-red-500 border-red-200', desc: 'Custom gift baskets, hampers, personalized gifting ideas.' },
      { id: 'gardening', name: 'Gardening & Plant Care', icon: Leaf, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50 text-green-600 border-green-200', desc: 'Indoor plants, terrace gardens, propagation & plant care.' },
      { id: 'terracotta-art', name: 'Terracotta Art', icon: Flame, color: 'from-orange-600 to-red-700', bgColor: 'bg-orange-50 text-orange-700 border-orange-200', desc: 'Terracotta painting, Diya decoration, pot art & sculptures.' },
      { id: 'leather-craft', name: 'Leather Craft', icon: Layers, color: 'from-amber-700 to-stone-700', bgColor: 'bg-stone-50 text-stone-700 border-stone-200', desc: 'Leather wallets, bags, belts, tooling & carving techniques.' },
      { id: 'fabric-painting', name: 'Fabric Painting', icon: Palette, color: 'from-fuchsia-500 to-purple-600', bgColor: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200', desc: 'Hand-painted tees, sarees, cushion covers & fabric art.' },
      { id: 'tie-dye-fabric', name: 'Tie-Dye & Fabric Art', icon: Sun, color: 'from-yellow-400 to-pink-500', bgColor: 'bg-yellow-50 text-yellow-600 border-yellow-200', desc: 'Shibori, bandhani, tie-dye techniques & fabric coloring.' },
      { id: 'balloon-decoration', name: 'Balloon Decoration', icon: Sparkles, color: 'from-blue-400 to-indigo-500', bgColor: 'bg-blue-50 text-blue-500 border-blue-200', desc: 'Balloon garlands, arches, party setups & event décor.' },
      { id: 'event-decoration', name: 'Event Decoration', icon: Star, color: 'from-pink-500 to-violet-600', bgColor: 'bg-pink-50 text-pink-600 border-pink-200', desc: 'Stage décor, wedding setups, themed parties & backdrops.' },
      { id: 'music-instruments', name: 'Music & Instruments', icon: Music, color: 'from-indigo-500 to-blue-700', bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-200', desc: 'Guitar, ukulele, keyboard, vocals & music production.' },
      { id: 'dance-performance', name: 'Dance & Performance', icon: Heart, color: 'from-rose-500 to-fuchsia-600', bgColor: 'bg-rose-50 text-rose-600 border-rose-200', desc: 'Classical, contemporary, Bollywood, choreography & fitness.' },
    ],
  },
];

// Flatten for search
const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.categories);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function CategoriesExplore() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [counts, setCounts] = useState({});
  const [expandedGroup, setExpandedGroup] = useState(null);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const [wRes, pRes] = await Promise.all([
          axios.get('http://localhost:5000/api/workshops'),
          axios.get('http://localhost:5000/api/products'),
        ]);
        const workshops = wRes.data || [];
        const products = pRes.data || [];

        const categoryCounts = {};
        workshops.forEach((w) => {
          if (w.category) {
            const key = w.category.toLowerCase();
            categoryCounts[key] = categoryCounts[key] || { workshops: 0, products: 0 };
            categoryCounts[key].workshops += 1;
          }
        });

        products.forEach((p) => {
          if (p.category) {
            const key = p.category.toLowerCase();
            categoryCounts[key] = categoryCounts[key] || { workshops: 0, products: 0 };
            categoryCounts[key].products += 1;
          }
        });

        setCounts(categoryCounts);
      } catch (err) {
        console.error('Error fetching category counts:', err);
      }
    };

    fetchCategoryCounts();
  }, []);

  const isSearching = searchTerm.trim().length > 0;
  const searchResults = ALL_CATEGORIES.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If Creator chose manage tab, render CategoryManagement
  if (user?.role === 'Creator' && activeTab === 'manage') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex justify-between items-center">
          <button
            onClick={() => setActiveTab('browse')}
            className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            ← Back to All Categories
          </button>
        </div>
        <div className="flex-1">
          <CategoryManagement />
        </div>
        <Footer />
      </div>
    );
  }

  const renderCategoryCard = (cat, idx) => {
    const IconComp = cat.icon;

    return (
      <motion.div key={cat.id} variants={itemVariants}>
        <div
          onClick={() => navigate(`/marketplace?category=${encodeURIComponent(cat.name)}`)}
          className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden cursor-pointer"
        >
          {/* Gradient overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-2xl pointer-events-none`}
          />

          <div className="relative z-10">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3.5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${cat.bgColor}`}
            >
              <IconComp className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-purple-700 transition-colors leading-tight">
              {cat.name}
            </h3>

            <p className="text-slate-500 text-[11px] leading-relaxed mb-4 line-clamp-2">{cat.desc}</p>
          </div>

          <div className="relative z-10 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/marketplace?category=${encodeURIComponent(cat.name)}`);
              }}
              className="w-full text-center text-xs font-bold py-2 px-3 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Explore Products
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-6"
            >
              <BookOpen className="w-3.5 h-3.5" /> {ALL_CATEGORIES.length} Creative Categories
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6"
            >
              Explore Creative{' '}
              <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Categories
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light mb-8"
            >
              From painting & crochet to baking & mehndi — discover live workshops and handcrafted products across{' '}
              {ALL_CATEGORIES.length}+ creative skills.
            </motion.p>

            {/* Creator Mode Switch */}
            {user?.role === 'Creator' && (
              <div className="inline-flex p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'browse' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Browse Categories
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'manage' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" /> Manage My Skills
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SEARCH BAR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-10">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search categories (e.g. Pottery, Mehndi, Chocolate, Macramé)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
          </div>
        </section>

        {/* CATEGORIES CONTENT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {isSearching ? (
            /* Search Results */
            <div>
              <p className="text-sm text-slate-500 mb-6 font-medium">
                Found <span className="text-slate-900 font-bold">{searchResults.length}</span> categories matching "
                <span className="text-purple-600 font-semibold">{searchTerm}</span>"
              </p>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {searchResults.map((cat, idx) => renderCategoryCard(cat, idx))}
              </motion.div>
              {searchResults.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="font-bold text-slate-600 text-lg">No categories found</p>
                  <p className="text-sm mt-1">Try searching for "Painting", "Crochet", "Baking" or "Jewellery"</p>
                </div>
              )}
            </div>
          ) : (
            /* Grouped Categories View */
            <div className="space-y-12">
              {CATEGORY_GROUPS.map((group, gIdx) => (
                <motion.div
                  key={group.groupName}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: gIdx * 0.08 }}
                >
                  {/* Group Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`h-10 px-5 rounded-2xl bg-gradient-to-r ${group.groupColor} text-white flex items-center justify-center font-bold text-sm shadow-md`}
                    >
                      {group.groupName}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                    <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
                      {group.categories.length} skills
                    </span>
                  </div>

                  {/* Category Cards Grid */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-30px' }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                  >
                    {group.categories.map((cat, idx) => renderCategoryCard(cat, idx))}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
