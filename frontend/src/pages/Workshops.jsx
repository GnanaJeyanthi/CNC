import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search } from 'lucide-react';

export default function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  
  const fetchWorkshops = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/workshops?search=${search}&category=${category}`);
      setWorkshops(data);
    } catch(err) { console.error(err); }
  }

  useEffect(() => {
    fetchWorkshops();
  }, [category]); // fetch on category change

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkshops();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 w-full py-12">
        <h1 className="text-3xl font-bold mb-8">Browse Workshops</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input type="text" placeholder="Search workshops..." value={search} onChange={e=>setSearch(e.target.value)} className="border p-2 rounded-lg flex-1" />
            <button type="submit" className="bg-primary text-white px-4 rounded-lg flex items-center"><Search className="w-5 h-5"/></button>
          </form>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="border p-2 rounded-lg bg-white min-w-[200px]">
            <option value="All">All Categories</option>
            <option value="Pottery">Pottery</option>
            <option value="Painting">Painting</option>
            <option value="Tech">Tech</option>
            <option value="Cooking">Cooking</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workshops.map(w => (
            <Link to={`/workshops/${w._id}`} key={w._id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
              <div className="h-48 bg-gray-200">
                {w.thumbnailUrl && <img src={w.thumbnailUrl} alt={w.title} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{w.title}</h3>
                <p className="text-sm text-gray-500 mb-2">By {w.creatorId?.name || 'Creator'}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-primary">{w.price === 0 ? 'Free' : `$${w.price}`}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{w.category}</span>
                </div>
              </div>
            </Link>
          ))}
          {workshops.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No workshops found.</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}
