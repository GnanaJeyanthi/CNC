import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, ShoppingCart } from 'lucide-react';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/products?search=${search}&category=${category}`);
      setProducts(data);
    } catch(err) { console.error(err); }
  }

  useEffect(() => {
    fetchProducts();
  }, [category]); // fetch on category change

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 w-full py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Creator Marketplace</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input type="text" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)} className="border p-2 rounded-lg flex-1" />
            <button type="submit" className="bg-accent text-white px-4 rounded-lg flex items-center hover:bg-orange-600 transition"><Search className="w-5 h-5"/></button>
          </form>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="border p-2 rounded-lg bg-white min-w-[200px]">
            <option value="All">All Categories</option>
            <option value="Digital">Digital Goods</option>
            <option value="Physical">Physical Goods</option>
            <option value="Merch">Merch</option>
            <option value="Art">Art</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map(p => (
            <Link to={`/marketplace/${p._id}`} key={p._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col">
              <div className="h-48 bg-gray-100 relative">
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {p.stock <= 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center font-bold text-red-600">
                    Out of Stock
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{p.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{p.description}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="font-bold text-xl text-gray-900">${p.price}</span>
                  <div className="bg-accent text-white p-2 rounded-full hover:bg-orange-600 transition">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {products.length === 0 && <p className="text-gray-500 col-span-full text-center py-12">No products found.</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}
