import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, Tag, Layers, ShoppingBag, Video, ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_CATEGORIES = [
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
  'Handmade Accessories'
];

const CategoryManagement = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [availableCategories, setAvailableCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [activeTabCategory, setActiveTabCategory] = useState(null);
  const [myWorkshops, setMyWorkshops] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);

  // Initialize selected categories from user profile
  useEffect(() => {
    if (user) {
      const userCats = user.categories && user.categories.length > 0 ? user.categories : [];
      setSelectedCategories(userCats);
      if (userCats.length > 0) {
        setActiveTabCategory(userCats[0]);
      }
      
      // Ensure custom user categories are also in available list
      const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...userCats]));
      setAvailableCategories(merged);
    }
  }, [user]);

  // Fetch creator's products & workshops to display linkage
  useEffect(() => {
    const fetchCreatorContent = async () => {
      if (user && user._id) {
        setLoadingContent(true);
        try {
          const [productsRes, workshopsRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/products/creator/${user._id}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            }),
            axios.get(`http://localhost:5000/api/workshops/creator/${user._id}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
          ]);
          setMyProducts(productsRes.data?.products || []);
          setMyWorkshops(workshopsRes.data?.workshops || []);
        } catch (err) {
          console.error('Error fetching creator content:', err);
        } finally {
          setLoadingContent(false);
        }
      }
    };
    fetchCreatorContent();
  }, [user]);

  // Toggle category selection
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      const updated = selectedCategories.filter(c => c !== cat);
      setSelectedCategories(updated);
      if (activeTabCategory === cat) {
        setActiveTabCategory(updated.length > 0 ? updated[0] : null);
      }
    } else {
      const updated = [...selectedCategories, cat];
      setSelectedCategories(updated);
      if (!activeTabCategory) {
        setActiveTabCategory(cat);
      }
    }
  };

  // Add custom category
  const handleAddCustomCategory = (e) => {
    e.preventDefault();
    const trimmed = customCategoryInput.trim();
    if (!trimmed) return;

    if (!availableCategories.includes(trimmed)) {
      setAvailableCategories([...availableCategories, trimmed]);
    }
    if (!selectedCategories.includes(trimmed)) {
      setSelectedCategories([...selectedCategories, trimmed]);
      setActiveTabCategory(trimmed);
    }
    setCustomCategoryInput('');
  };

  // Remove category from available & selected list
  const handleRemoveCategory = (cat, e) => {
    e.stopPropagation();
    setSelectedCategories(selectedCategories.filter(c => c !== cat));
    setAvailableCategories(availableCategories.filter(c => c !== cat));
    if (activeTabCategory === cat) {
      const remaining = selectedCategories.filter(c => c !== cat);
      setActiveTabCategory(remaining.length > 0 ? remaining[0] : null);
    }
  };

  // Save selected categories to MongoDB
  const handleSaveCategories = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await axios.put(
        'http://localhost:5000/api/auth/categories',
        { categories: selectedCategories },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Update global context & local storage
      updateUser({ categories: selectedCategories });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save categories: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Filter content by active selected category tab
  const filteredProducts = myProducts.filter(p => p.category?.toLowerCase() === activeTabCategory?.toLowerCase());
  const filteredWorkshops = myWorkshops.filter(w => w.category?.toLowerCase() === activeTabCategory?.toLowerCase());

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link to="/dashboard/creator" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Tag className="w-8 h-8 text-primary" /> Creator Categories Management
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Select your skill categories. These categories will be linked to your profile and available when creating products & workshops.
            </p>
          </div>
          <button
            onClick={handleSaveCategories}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Categories'}
          </button>
        </div>

        {/* Success Alert Banner */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Categories Saved Successfully!</h4>
                  <p className="text-xs text-green-600">Your categories have been linked to your profile and are now ready for workshop & product creation.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Summary Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Creator Profile Linkage</h2>
              <p className="text-sm text-gray-500">
                Creator: <span className="font-semibold text-gray-800">{user?.name}</span> ({user?.email})
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selected Categories ({selectedCategories.length}):</span>
              {selectedCategories.length === 0 ? (
                <span className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  No categories selected yet
                </span>
              ) : (
                selectedCategories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1.5 bg-blue-50 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
                    <Tag className="w-3 h-3" /> {cat}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Grid Layout: Left Available Categories Selection, Right Preview & Linkage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Available Categories Selection Box */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Select Skill Categories</h3>
                <p className="text-xs text-gray-500 mt-0.5">Click any category badge to add or remove it from your skills.</p>
              </div>
              <span className="text-xs text-gray-400 font-mono">{selectedCategories.length} selected</span>
            </div>

            {/* Custom Category Add Input Form */}
            <form onSubmit={handleAddCustomCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Add custom category (e.g. Paper Craft)..."
                value={customCategoryInput}
                onChange={e => setCustomCategoryInput(e.target.value)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                className="bg-secondary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-600 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>

            {/* Categories Chips Selection Grid */}
            <div className="flex flex-wrap gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {availableCategories.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                const isCustom = !DEFAULT_CATEGORIES.includes(cat);
                return (
                  <motion.button
                    key={cat}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleCategory(cat)}
                    className={`relative group px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${isSelected ? 'bg-white text-primary font-bold' : 'border border-gray-300'}`}>
                      {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                    </div>
                    <span>{cat}</span>

                    {/* Allow removing custom or standard category if hovered */}
                    {isCustom && (
                      <span
                        onClick={(e) => handleRemoveCategory(cat, e)}
                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full"
                        title="Remove category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Assigned Workshops & Products Showcase Linkage */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Category Content Linkage</h3>
            <p className="text-xs text-gray-500 mb-4">
              Workshops and products created under your selected categories.
            </p>

            {selectedCategories.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Layers className="w-12 h-12 text-gray-300 mb-3" />
                <h4 className="font-semibold text-gray-700">No Categories Selected</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Select one or more categories from the list on the left to start assigning products & workshops.
                </p>
              </div>
            ) : (
              <>
                {/* Category Selector Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 border-b border-gray-100">
                  {selectedCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveTabCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        activeTabCategory === cat
                          ? 'bg-secondary text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Filtered Content List */}
                <div className="flex-1 overflow-y-auto space-y-6">
                  
                  {/* Products Section for Active Category */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <ShoppingBag className="w-3.5 h-3.5 text-accent" /> Products in "{activeTabCategory}" ({filteredProducts.length})
                    </h4>
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                        <p className="text-xs text-gray-500">No products created in <span className="font-semibold text-gray-700">{activeTabCategory}</span> yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredProducts.map(prod => (
                          <div key={prod._id} className="p-3 bg-surface rounded-xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {prod.images?.[0]?.url ? (
                                <img src={prod.images[0].url} alt={prod.title} className="w-10 h-10 rounded-lg object-cover" />
                              ) : (
                                <div className="w-10 h-10 bg-orange-100 text-accent rounded-lg flex items-center justify-center font-bold text-xs">📦</div>
                              )}
                              <div>
                                <h5 className="font-semibold text-sm text-gray-900">{prod.title}</h5>
                                <span className="text-xs text-gray-500">${prod.price} • Stock: {prod.stock}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold uppercase bg-orange-50 text-accent px-2 py-0.5 rounded border border-orange-100">Product</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Workshops Section for Active Category */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Video className="w-3.5 h-3.5 text-primary" /> Workshops in "{activeTabCategory}" ({filteredWorkshops.length})
                    </h4>
                    {filteredWorkshops.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                        <p className="text-xs text-gray-500">No workshops created in <span className="font-semibold text-gray-700">{activeTabCategory}</span> yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredWorkshops.map(ws => (
                          <div key={ws._id} className="p-3 bg-surface rounded-xl border border-gray-100 flex items-center justify-between">
                            <div>
                              <h5 className="font-semibold text-sm text-gray-900">{ws.title}</h5>
                              <span className="text-xs text-gray-500">{ws.scheduledDate ? new Date(ws.scheduledDate).toLocaleDateString() : 'Draft'} • ${ws.price}</span>
                            </div>
                            <span className="text-[10px] font-semibold uppercase bg-blue-50 text-primary px-2 py-0.5 rounded border border-blue-100">Workshop</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default CategoryManagement;
