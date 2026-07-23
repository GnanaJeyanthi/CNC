import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CreatorDashboard = () => {
  const { user } = useContext(AuthContext);

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
    learningObjectives: ''
  });
  const [salesForm, setSalesForm] = useState({ title: '', description: '', category: '', price: '', stock: 1, images: null });

  const handleCreateClass = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', classForm.title);
    formData.append('description', classForm.description);
    formData.append('category', classForm.category);
    formData.append('price', classForm.priceType === 'paid' ? classForm.price : 0);
    formData.append('maxParticipants', classForm.maxParticipants);
    formData.append('durationMinutes', classForm.durationMinutes);
    if(classForm.date && classForm.time) {
      formData.append('scheduledDate', new Date(`${classForm.date}T${classForm.time}`).toISOString());
    }
    if(classForm.learningObjectives) {
      formData.append('learningObjectives', classForm.learningObjectives);
    }
    if(classForm.thumbnail) formData.append('thumbnail', classForm.thumbnail);
    try {
      await axios.post('http://localhost:5000/api/workshops', formData, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert('Class created!');
      setShowClassModal(false);
    } catch(err) {
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
    if(salesForm.images) {
      for(let i = 0; i < salesForm.images.length; i++) {
        formData.append('images', salesForm.images[i]);
      }
    }
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
        });
        alert('Product updated!');
      } else {
        await axios.post('http://localhost:5000/api/products', formData, {
          headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
        });
        alert('Product created!');
      }
      setShowSalesModal(false);
      setEditingProduct(null);
      // reload page or state (simplified)
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
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
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
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
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
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <div className="flex gap-4">
            <a href="/dashboard/attendance" className="bg-secondary text-white px-4 py-2 rounded-lg shadow hover:bg-teal-600 transition text-sm">
              📊 Attendance Reports
            </a>
            <a href="/dashboard/analytics" className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition text-sm">
              📈 Analytics
            </a>
            <button onClick={() => setShowClassModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
              Create Class
            </button>
            <button onClick={() => setShowSalesModal(true)} className="bg-accent text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600 transition">
              Sales (Add Product)
            </button>
            <a href="/profile" className="bg-gray-700 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-900 transition text-sm">
              👤 My Profile
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Workshops</h3>
            <p className="text-3xl font-bold text-primary mt-2">{analytics.totalWorkshops}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
            <p className="text-3xl font-bold text-secondary mt-2">{analytics.totalParticipants}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <p className="text-3xl font-bold text-accent mt-2">${analytics.totalRevenue}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics Overview</h2>
          <div className="h-64 flex items-center justify-center">
            <Bar data={chartDataObj} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Workshops</h2>
          </div>
          {myWorkshops.length === 0 ? <p className="text-gray-500">No workshops created.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {myWorkshops.map(w => (
                <div key={w._id} className="border rounded-xl overflow-hidden shadow-sm flex flex-col p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{w.title}</h3>
                  <div className="text-sm text-gray-500 mb-4">{w.scheduledDate ? new Date(w.scheduledDate).toLocaleString() : 'TBA'} | {w.status}</div>
                  <button onClick={() => { setActiveWorkshop(w); setShowContentModal(true); }} className="mt-auto w-full bg-primary text-white py-2 rounded text-sm hover:bg-blue-700">Manage Content</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Marketplace Products</h2>
          </div>
          {myProducts.length === 0 ? <p className="text-gray-500">No products found. Start selling!</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {myProducts.map(p => (
                <div key={p._id} className="border rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="h-32 bg-gray-100">
                    {p.images && p.images.length > 0 && <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
                    <div className="text-sm text-gray-500 mb-4">${p.price} | Stock: {p.stock}</div>
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
                  value={classForm.title} onChange={e => setClassForm({...classForm, title: e.target.value})} />
                <textarea placeholder="Description" className="border p-2 rounded"
                  value={classForm.description} onChange={e => setClassForm({...classForm, description: e.target.value})}></textarea>
                <input type="text" placeholder="Category" required className="border p-2 rounded"
                  value={classForm.category} onChange={e => setClassForm({...classForm, category: e.target.value})} />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input type="date" required className="border p-2 rounded w-full"
                      value={classForm.date} onChange={e => setClassForm({...classForm, date: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <input type="time" required className="border p-2 rounded w-full"
                      value={classForm.time} onChange={e => setClassForm({...classForm, time: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Duration (Mins)</label>
                    <input type="number" required min="15" className="border p-2 rounded w-full"
                      value={classForm.durationMinutes} onChange={e => setClassForm({...classForm, durationMinutes: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Max Participants</label>
                    <input type="number" required max="100" className="border p-2 rounded w-full"
                      value={classForm.maxParticipants} onChange={e => setClassForm({...classForm, maxParticipants: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <label className="block text-sm font-medium mb-1 mr-4">Type:</label>
                  <label className="mr-4"><input type="radio" name="priceType" value="free" checked={classForm.priceType === 'free'} onChange={() => setClassForm({...classForm, priceType: 'free', price: 0})} /> Free</label>
                  <label><input type="radio" name="priceType" value="paid" checked={classForm.priceType === 'paid'} onChange={() => setClassForm({...classForm, priceType: 'paid'})} /> Paid</label>
                </div>
                {classForm.priceType === 'paid' && (
                  <input type="number" placeholder="Price ($)" required min="1" className="border p-2 rounded"
                    value={classForm.price} onChange={e => setClassForm({...classForm, price: e.target.value})} />
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Learning Objectives (one per line)</label>
                  <textarea placeholder="e.g. Master the basics of React..." className="border p-2 rounded w-full"
                    value={classForm.learningObjectives} onChange={e => setClassForm({...classForm, learningObjectives: e.target.value})}></textarea>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-textMain">{editingProduct ? 'Edit Product' : 'Add Product for Sale'}</h2>
              <form onSubmit={handleCreateSale} className="flex flex-col gap-4">
                <input type="text" placeholder="Title" required className="border p-2 rounded"
                  value={salesForm.title} onChange={e => setSalesForm({...salesForm, title: e.target.value})} />
                <textarea placeholder="Description" className="border p-2 rounded"
                  value={salesForm.description} onChange={e => setSalesForm({...salesForm, description: e.target.value})}></textarea>
                <input type="text" placeholder="Category" required className="border p-2 rounded"
                  value={salesForm.category} onChange={e => setSalesForm({...salesForm, category: e.target.value})} />
                <div className="flex gap-2">
                  <input type="number" placeholder="Price" required min="0" className="border p-2 rounded flex-1"
                    value={salesForm.price} onChange={e => setSalesForm({...salesForm, price: e.target.value})} />
                  <input type="number" placeholder="Stock" required min="0" className="border p-2 rounded flex-1"
                    value={salesForm.stock} onChange={e => setSalesForm({...salesForm, stock: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Product Photos (Multiple allowed)</label>
                  <input type="file" accept="image/*" multiple onChange={e => setSalesForm({...salesForm, images: e.target.files})} className="border p-2 rounded w-full" />
                  {editingProduct && <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing images.</p>}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => {setShowSalesModal(false); setEditingProduct(null);}} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-accent text-white rounded hover:bg-orange-600">{editingProduct ? 'Save Changes' : 'Add to Sales'}</button>
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
