import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Search, ShoppingCart, Tag, User, Sparkles, Filter } from 'lucide-react';

const CATEGORY_LIST = [
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
  'Digital',
  'Physical',
  'Merch',
  'Other'
];

export default function Marketplace() {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
      setProducts(data || []);
    } catch(err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // Collect unique categories from existing products to add to dropdown if missing
  const productCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const allCategoryOptions = Array.from(new Set([...CATEGORY_LIST, ...productCategories]));

  return (
    <div className="min-h-screen flex flex-col bg-ambient-blobs">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 z-10">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden border border-indigo-500/20">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-200 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Direct From Creators
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Creator Marketplace
            </h1>
            <p className="text-slate-300 text-sm md:text-base">
              Discover unique handmade items, artwork, digital guides, and products crafted by talented creators on CastNCart.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products by title, description, or tag..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  if (e.target.value === '') fetchProducts();
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white/90"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              className="bg-accent text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1 text-sm"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="border border-gray-200 p-2.5 rounded-xl bg-white/90 text-sm text-gray-800 font-medium min-w-[200px] w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {allCategoryOptions.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading creator products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-dashed border-indigo-200/80 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 bg-orange-50 text-accent rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {search || category !== 'All' 
                ? `No products matched "${search || category}". Try searching another keyword or category.`
                : 'No products have been listed on the marketplace yet.'
              }
            </p>
            {user?.role === 'Creator' && (
              <Link
                to="/dashboard/creator"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow hover:bg-blue-700 transition"
              >
                + Create & Sell a Product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => {
              const isMine = user && (p.creatorId?._id === user._id || p.creatorId === user._id);
              const creatorName = p.creatorId?.name || 'Unknown Creator';
              
              return (
                <div 
                  key={p._id} 
                  className="glass-card glass-card-hover rounded-3xl overflow-hidden shadow-sm flex flex-col group relative"
                >
                  {/* Image Container */}
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    {p.images && p.images.length > 0 ? (
                      <img 
                        src={p.images[0].url} 
                        alt={p.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                        No Image Available
                      </div>
                    )}

                    {/* Category Badge */}
                    {p.category && (
                      <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                        <Tag className="w-3 h-3 text-accent" /> {p.category}
                      </span>
                    )}

                    {/* Mine Indicator */}
                    {isMine && (
                      <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                        Your Product
                      </span>
                    )}

                    {/* Out of Stock Overlay */}
                    {p.stock <= 0 && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center font-bold text-red-400 text-sm uppercase tracking-wider">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>By <span className="font-semibold text-gray-700">{creatorName}</span></span>
                    </div>

                    <Link to={`/marketplace/${p._id}`}>
                      <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {p.title}
                      </h3>
                    </Link>
                    
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                      {p.description || 'No detailed description provided.'}
                    </p>

                    {/* Specification Badges */}
                    {p.attributes && Object.keys(p.attributes).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {Object.entries(typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes).slice(0, 3).map(([k, v]) => (
                          <span key={k} className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-100/80 capitalize">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price and Action Footer */}
                    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div>
                        <span className="text-xl font-extrabold text-gray-900">₹{p.price}</span>
                        <span className="text-[11px] text-gray-400 block font-medium">Stock: {p.stock}</span>
                      </div>
                      
                      {isMine ? (
                        <Link
                          to="/dashboard/creator"
                          className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition"
                        >
                          Manage
                        </Link>
                      ) : user?.role === 'Creator' ? (
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded border border-gray-200">
                          Listed Item
                        </span>
                      ) : (
                        <button 
                          disabled={p.stock <= 0}
                          onClick={() => {
                            addToCart(p);
                            alert(`Added "${p.title}" to cart!`);
                          }}
                          className="bg-accent text-white p-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold px-3"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-4 h-4" /> Buy
                        </button>
                      )}
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
