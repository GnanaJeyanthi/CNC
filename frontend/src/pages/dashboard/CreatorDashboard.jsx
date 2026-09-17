import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getFieldsForCategory } from '../../utils/categoryFields';
import DailyGamesBanner from '../../components/DailyGamesBanner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DEFAULT_CATEGORIES = [
  'Painting', 'Crochet', 'Baking', 'Cooking', 'Photography', 'Makeup',
  'Jewellery', 'Embroidery', 'Candle Making', 'Soap Making', 'Pottery',
  'Fashion Design', 'Music', 'Dance', 'Art & Craft', 'Knitting', 'Home Decor',
  'Handmade Accessories'
];

const CreatorDashboard = () => {
  const { user } = useContext(AuthContext);

  const categoryOptions = Array.from(new Set([
    ...(user?.categories || []),
    ...DEFAULT_CATEGORIES
  ]));

  const [analytics, setAnalytics] = useState({
    totalWorkshops: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    chartLabels: [],
    chartData: [],
  });
  const [myProducts, setMyProducts] = useState([]);
  const [myWorkshops, setMyWorkshops] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [showContentModal, setShowContentModal] = useState(false);
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [materialForm, setMaterialForm] = useState({ title: '', file: null });
  const [recordingFile, setRecordingFile] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (user && user._id) {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/analytics/creator/${user._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          
          let totalRev = 0;
          if (data.revenueOverTime) {
            totalRev = data.revenueOverTime.reduce((sum, item) => sum + item.revenue, 0);
          }

          setAnalytics({
            totalWorkshops: data.totalWorkshops || 0,
            totalParticipants: data.totalParticipants || 0,
            totalRevenue: totalRev,
            chartLabels: data.workshopAttendance?.map(w => w.title) || [],
            chartData: data.workshopAttendance?.map(w => w.participants) || [],
          });
        } catch (err) {
          console.error("Failed to fetch analytics:", err);
        }
      }
    };
    
    const fetchProducts = async () => {
      if (user && user._id) {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/products/creator/${user._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setMyProducts(data.products || []);
        } catch(err) { console.error("Failed to fetch products:", err); }
      }
    };
    
    const fetchWorkshops = async () => {
      if (user && user._id) {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/workshops/creator/${user._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setMyWorkshops(data.workshops || []);
        } catch(err) { console.error("Failed to fetch workshops:", err); }
      }
    };

    fetchAnalytics();
    fetchProducts();
    fetchWorkshops();
  }, [user]);

  const [showClassModal, setShowClassModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);

  const [classForm, setClassForm] = useState({ 
    title: '', description: '', category: '', 
    priceType: 'free', price: '', 
    maxParticipants: 40, thumbnail: null,
    date: '', time: '', durationMinutes: 60,
    learningObjectives: '', ngrokUrl: ''
  });
  const [salesForm, setSalesForm] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    price: '', 
    stock: 1, 
    images: null,
    attributes: {} 
  });

  const handleGoLive = async (workshop) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/workshops/${workshop._id}/start`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      let targetUrl = res.data.ngrokUrl || res.data.jitsiUrl || res.data.liveLink;
      if (targetUrl) {
        if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;
        const hostName = encodeURIComponent(user?.name ? `Host: ${user.name}` : 'Host (Creator)');
        const fullHostUrl = `${targetUrl}#userInfo.displayName="${hostName}"`;
        window.open(fullHostUrl, '_blank');
      }
      window.location.reload();
    } catch(err) {
      alert('Error starting live class: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', classForm.title);
    formData.append('description', classForm.description);
    formData.append('category', classForm.category);
    formData.append('price', classForm.priceType === 'paid' ? classForm.price : 0);
    formData.append('maxParticipants', classForm.maxParticipants);
    formData.append('durationMinutes', classForm.durationMinutes);
    if(classForm.ngrokUrl) {
      formData.append('ngrokUrl', classForm.ngrokUrl);
    }
    if(classForm.date && classForm.time) {
      formData.append('scheduledDate', new Date(`${classForm.date}T${classForm.time}`).toISOString());
    }
    if(classForm.learningObjectives) {
      formData.append('learningObjectives', classForm.learningObjectives);
    }
    if(classForm.thumbnail) formData.append('thumbnail', classForm.thumbnail);
    try {
      await axios.post('http://localhost:5000/api/workshops', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Class created!');
      setShowClassModal(false);
    } catch(err) {
      console.error('Error creating workshop:', err.response?.data || err);
      alert('Error creating class: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', salesForm.title);
    formData.append('description', salesForm.description);
    formData.append('category', salesForm.category);
    formData.append('price', salesForm.price);
    formData.append('stock', salesForm.stock);
    if (salesForm.attributes) {
      formData.append('attributes', JSON.stringify(salesForm.attributes));
    }
    if(salesForm.images) {
      for(let i = 0; i < salesForm.images.length; i++) {
        formData.append('images', salesForm.images[i]);
      }
    }
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        alert('Product updated!');
      } else {
        await axios.post('http://localhost:5000/api/products', formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        alert('Product created!');
      }
      setShowSalesModal(false);
      setEditingProduct(null);
      window.location.reload();
    } catch(err) {
      alert('Error saving product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMyProducts(myProducts.filter(p => p._id !== id));
      alert('Product deleted');
    } catch(err) {
      alert('Error deleting product');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setSalesForm({
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      attributes: product.attributes ? (typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes) : {},
      images: null
    });
    setShowSalesModal(true);
  };

  const handleUploadRecording = async (e) => {
    e.preventDefault();
    if(!recordingFile) return alert('Select a video file');
    const formData = new FormData();
    formData.append('recording', recordingFile);
    try {
      await axios.post(`http://localhost:5000/api/workshops/${activeWorkshop._id}/recording`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Recording uploaded!');
      window.location.reload();
    } catch (err) { alert('Error uploading recording'); }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if(!materialForm.file) return alert('Select a file');
    const formData = new FormData();
    formData.append('title', materialForm.title);
    formData.append('file', materialForm.file);
    try {
      await axios.post(`http://localhost:5000/api/workshops/${activeWorkshop._id}/materials`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Material uploaded!');
      window.location.reload();
    } catch (err) { alert('Error uploading material'); }
  };

  const chartDataObj = {
    labels: analytics.chartLabels.length ? analytics.chartLabels : ['No Data'],
    datasets: [
      {
        label: 'Workshop Attendees',
        data: analytics.chartData.length ? analytics.chartData : [0],
        backgroundColor: '#14B8A6',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Workshop Attendance' },
    },
  };

  return (
    <div className="min-h-screen bg-ambient-blobs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="flex flex-wrap justify-end items-center gap-3 mb-8">
          <a href="/games" className="bg-amber-500 text-amber-950 px-4 py-2 rounded-xl shadow hover:bg-amber-400 transition text-sm font-extrabold flex items-center gap-1.5">
            <span>🧩</span> Daily Puzzles
          </a>
          <a href="/dashboard/categories" className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition text-sm font-semibold">
            🏷️ Categories
          </a>
          <a href="/dashboard/attendance" className="bg-secondary text-white px-4 py-2 rounded-xl shadow hover:bg-teal-600 transition text-sm font-semibold">
            📊 Attendance Reports
          </a>
          <a href="/dashboard/analytics" className="bg-purple-600 text-white px-4 py-2 rounded-xl shadow hover:bg-purple-700 transition text-sm font-semibold">
            📈 Analytics
          </a>
          <button onClick={() => setShowClassModal(true)} className="bg-primary text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition text-sm font-semibold">
            + Create Class
          </button>
          <button onClick={() => setShowSalesModal(true)} className="bg-accent text-white px-4 py-2 rounded-xl shadow hover:bg-orange-600 transition text-sm font-semibold">
            + Sell New Product
          </button>
          <a href="/profile" className="bg-gray-700 text-white px-4 py-2 rounded-xl shadow hover:bg-gray-900 transition text-sm font-semibold">
            👤 Profile
          </a>
        </div>

        {/* Daily Puzzles LinkedIn-style Bar */}
        <DailyGamesBanner />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-3xl shadow-sm border border-indigo-100/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Workshops</h3>
            <p className="text-3xl font-black text-primary mt-2">{analytics.totalWorkshops}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl shadow-sm border border-teal-100/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Students</h3>
            <p className="text-3xl font-black text-secondary mt-2">{analytics.totalParticipants}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl shadow-sm border border-amber-100/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Revenue</h3>
            <p className="text-3xl font-black text-accent mt-2">₹{analytics.totalRevenue}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl shadow-sm border border-indigo-100/60 mb-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Analytics Overview</h2>
          <div className="h-64 flex items-center justify-center">
            <Bar data={chartDataObj} options={chartOptions} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl shadow-sm border border-indigo-100/60 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-extrabold text-gray-900">My Workshops</h2>
          </div>
          {myWorkshops.length === 0 ? <p className="text-gray-500">No workshops created.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {myWorkshops.map(w => (
                <div key={w._id} className="border rounded-xl overflow-hidden shadow-sm flex flex-col p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{w.title}</h3>
                  <div className="text-sm text-gray-500 mb-2">{w.scheduledDate ? new Date(w.scheduledDate).toLocaleString() : 'TBA'} | Status: <span className="font-semibold text-purple-600 uppercase text-xs">{w.status}</span></div>
                  {w.ngrokUrl && (
                    <div className="text-xs text-blue-700 truncate mb-3 bg-blue-50 p-2 rounded border border-blue-100 font-mono">
                      🌐 {w.ngrokUrl}
                    </div>
                  )}
                  <div className="mt-auto flex flex-col gap-2">
                    <button onClick={() => handleGoLive(w)} className={`w-full py-2 rounded text-sm font-semibold transition text-white ${w.status === 'live' ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                      {w.status === 'live' ? '🔴 Currently Live (Update Link)' : '🚀 Start Live Class (Ngrok)'}
                    </button>
                    <button onClick={() => { setActiveWorkshop(w); setShowContentModal(true); }} className="w-full bg-gray-100 text-gray-700 py-1.5 rounded text-sm hover:bg-gray-200">Manage Content</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Marketplace Products</h2>
            <button 
              onClick={() => { setEditingProduct(null); setSalesForm({ title: '', description: '', category: '', price: '', stock: 1, images: null }); setShowSalesModal(true); }} 
              className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition shadow-sm flex items-center gap-1.5"
            >
              + Sell New Product
            </button>
          </div>
          {myProducts.length === 0 ? (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center">
              <div className="text-3xl mb-2">🛍️</div>
              <p className="text-gray-600 font-medium text-sm mb-1">No products listed yet.</p>
              <p className="text-gray-400 text-xs mb-4">Start selling your handmade creations or products on CastNCart Marketplace.</p>
              <button 
                onClick={() => { setEditingProduct(null); setSalesForm({ title: '', description: '', category: '', price: '', stock: 1, images: null }); setShowSalesModal(true); }}
                className="bg-accent text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow"
              >
                + Add Product for Sale
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {myProducts.map(p => (
                <div key={p._id} className="border rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="h-32 bg-gray-100">
                    {p.images && p.images.length > 0 && <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded w-fit mb-1 border border-amber-200">{p.category}</div>
                    <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
                    <div className="text-sm text-gray-700 font-extrabold mb-2">₹{p.price} | Stock: {p.stock}</div>
                    {p.attributes && Object.keys(p.attributes).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {Object.entries(typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes).slice(0, 3).map(([k, v]) => (
                          <span key={k} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-1.5 py-0.5 rounded border border-slate-200 capitalize">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex gap-2">
                      <button onClick={() => openEditModal(p)} className="flex-1 bg-gray-100 text-gray-700 py-1 rounded text-sm hover:bg-gray-200">Edit</button>
                      <button onClick={() => handleDeleteProduct(p._id)} className="flex-1 bg-red-100 text-red-600 py-1 rounded text-sm hover:bg-red-200">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Class Modal */}
        {showClassModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-textMain">Create New Class</h2>
              <form onSubmit={handleCreateClass} className="flex flex-col gap-4">
                <input type="text" placeholder="Title" required className="border p-2 rounded"
                  value={classForm.title || ''} onChange={e => setClassForm({...classForm, title: e.target.value})} />
                <textarea placeholder="Description" className="border p-2 rounded"
                  value={classForm.description || ''} onChange={e => setClassForm({...classForm, description: e.target.value})}></textarea>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    required
                    className="border p-2 rounded w-full bg-white text-gray-800"
                    value={classForm.category || ''}
                    onChange={e => setClassForm({...classForm, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {user?.categories && user.categories.length > 0 && (
                      <optgroup label="My Selected Categories">
                        {user.categories.map(cat => (
                          <option key={`my-${cat}`} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="All Categories">
                      {DEFAULT_CATEGORIES.filter(cat => !(user?.categories || []).includes(cat)).map(cat => (
                        <option key={`def-${cat}`} value={cat}>{cat}</option>
                      ))}
                    </optgroup>
                  </select>
                  {(!user?.categories || user.categories.length === 0) && (
                    <p className="text-xs text-amber-600 mt-1">
                      Tip: You can set your primary skill categories in <a href="/dashboard/categories" className="underline font-semibold">Categories Management</a>.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input type="date" required className="border p-2 rounded w-full"
                      value={classForm.date || ''} onChange={e => setClassForm({...classForm, date: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <input type="time" required className="border p-2 rounded w-full"
                      value={classForm.time || ''} onChange={e => setClassForm({...classForm, time: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Duration (Mins)</label>
                    <input type="number" required min="15" className="border p-2 rounded w-full"
                      value={classForm.durationMinutes || ''} onChange={e => setClassForm({...classForm, durationMinutes: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Max Participants</label>
                    <input type="number" required max="100" className="border p-2 rounded w-full"
                      value={classForm.maxParticipants || ''} onChange={e => setClassForm({...classForm, maxParticipants: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <label className="block text-sm font-medium mb-1 mr-4">Type:</label>
                  <label className="mr-4"><input type="radio" name="priceType" value="free" checked={classForm.priceType === 'free'} onChange={() => setClassForm({...classForm, priceType: 'free', price: ''})} /> Free</label>
                  <label><input type="radio" name="priceType" value="paid" checked={classForm.priceType === 'paid'} onChange={() => setClassForm({...classForm, priceType: 'paid'})} /> Paid</label>
                </div>
                {classForm.priceType === 'paid' && (
                  <input type="number" placeholder="Price ($)" required min="1" className="border p-2 rounded"
                    value={classForm.price || ''} onChange={e => setClassForm({...classForm, price: e.target.value})} />
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Learning Objectives (one per line)</label>
                  <textarea placeholder="e.g. Master the basics of React..." className="border p-2 rounded w-full"
                    value={classForm.learningObjectives || ''} onChange={e => setClassForm({...classForm, learningObjectives: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thumbnail Photo</label>
                  <input type="file" accept="image/*" onChange={e => setClassForm({...classForm, thumbnail: e.target.files[0]})} className="border p-2 rounded w-full" />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowClassModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sales (Add/Edit Product) Modal */}
        {showSalesModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-3">
                {editingProduct ? 'Edit Product' : 'Sell a Product'}
              </h2>
              <form onSubmit={handleCreateSale} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Handmade Ceramic Mug / Crochet Scarf" 
                    required 
                    className="border p-2.5 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    value={salesForm.title || ''} 
                    onChange={e => setSalesForm({...salesForm, title: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Description</label>
                  <textarea 
                    placeholder="Describe your product details, materials, size, etc..." 
                    rows="3"
                    required
                    className="border p-2.5 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    value={salesForm.description || ''} 
                    onChange={e => setSalesForm({...salesForm, description: e.target.value})}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    required
                    className="border p-2.5 rounded-xl w-full bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    value={salesForm.category || ''}
                    onChange={e => setSalesForm({...salesForm, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {user?.categories && user.categories.length > 0 && (
                      <optgroup label="My Selected Categories">
                        {user.categories.map(cat => (
                          <option key={`my-${cat}`} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="All Categories">
                      {DEFAULT_CATEGORIES.filter(cat => !(user?.categories || []).includes(cat)).map(cat => (
                        <option key={`def-${cat}`} value={cat}>{cat}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* DYNAMIC CATEGORY-SPECIFIC FIELDS */}
                {salesForm.category && (
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        ✨ {salesForm.category} Specification Fields
                      </span>
                      <span className="text-[11px] text-amber-700">Tailored Product Info</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {getFieldsForCategory(salesForm.category).map(field => (
                        <div key={field.key} className={field.key === 'ingredients' ? 'sm:col-span-2' : ''}>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            required={field.required}
                            placeholder={field.placeholder}
                            value={salesForm.attributes?.[field.key] || ''}
                            onChange={e => setSalesForm({
                              ...salesForm,
                              attributes: {
                                ...(salesForm.attributes || {}),
                                [field.key]: e.target.value
                              }
                            })}
                            className="border p-2.5 rounded-xl w-full text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 25" 
                      required 
                      min="0" 
                      step="0.01"
                      className="border p-2.5 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                      value={salesForm.price || ''} 
                      onChange={e => setSalesForm({...salesForm, price: e.target.value})} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Quantity</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 10" 
                      required 
                      min="0" 
                      className="border p-2.5 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                      value={salesForm.stock || ''} 
                      onChange={e => setSalesForm({...salesForm, stock: e.target.value})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image(s)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={e => setSalesForm({...salesForm, images: e.target.files})} 
                    className="border p-2 rounded-xl w-full text-xs bg-gray-50 focus:outline-none" 
                  />
                  {editingProduct && <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing images.</p>}
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                  <button 
                    type="button" 
                    onClick={() => {setShowSalesModal(false); setEditingProduct(null);}} 
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow"
                  >
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Content Modal */}
        {showContentModal && activeWorkshop && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-textMain">Manage Content: {activeWorkshop.title}</h2>
              
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-bold mb-2">Upload Recording (Video)</h3>
                <form onSubmit={handleUploadRecording} className="flex gap-2">
                  <input type="file" accept="video/mp4,video/webm" onChange={e => setRecordingFile(e.target.files[0])} className="border p-1 text-sm rounded flex-1 bg-white" required />
                  <button type="submit" className="bg-primary text-white px-4 rounded hover:bg-blue-700">Upload</button>
                </form>
                {activeWorkshop.recordingUrl && <p className="text-xs text-green-600 mt-2">Recording already uploaded. Uploading again will replace it.</p>}
              </div>

              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-bold mb-2">Upload Study Material (PDF, PPT, DOCX, Img)</h3>
                <form onSubmit={handleUploadMaterial} className="flex flex-col gap-2">
                  <input type="text" placeholder="Title (e.g. Week 1 Slides)" required className="border p-2 rounded bg-white"
                    value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} />
                  <div className="flex gap-2">
                    <input type="file" onChange={e => setMaterialForm({...materialForm, file: e.target.files[0]})} className="border p-1 text-sm rounded flex-1 bg-white" required />
                    <button type="submit" className="bg-secondary text-white px-4 rounded hover:bg-teal-600">Upload</button>
                  </div>
                </form>
                
                {activeWorkshop.studyMaterials?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-2">Existing Materials:</h4>
                    <ul className="text-sm space-y-1">
                      {activeWorkshop.studyMaterials.map(m => (
                        <li key={m._id} className="flex justify-between items-center bg-white p-2 rounded border">
                          <span>{m.title} <span className="text-gray-400 text-xs">({m.fileType})</span></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button onClick={() => {setShowContentModal(false); setActiveWorkshop(null);}} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Close</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreatorDashboard;
