import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data);
      } catch(err) { console.error(err); }
    }
    fetchProduct();
  }, [id]);

  const handlePurchase = async () => {
    if(!user) return navigate('/signin');
    if(quantity > product.stock) {
      alert('Not enough stock available.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/orders', {
        productId: product._id,
        quantity
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Successfully purchased!');
      navigate('/dashboard/user');
    } catch(err) {
      alert(err.response?.data?.message || 'Error purchasing product');
    }
  }

  if(!product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto px-4 w-full py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Image Gallery */}
          <div className="w-full md:w-1/2 space-y-4">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[activeImg].url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImg(idx)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${activeImg === idx ? 'border-accent' : 'border-transparent'}`}>
                    <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="text-sm text-gray-500 mb-2 font-medium">{product.category}</div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900">{product.title}</h1>
            <p className="text-xl text-gray-500 mb-6">By {product.creatorId?.name || 'Creator'}</p>
            <div className="text-4xl font-bold text-gray-900 mb-6">${product.price}</div>
            
            <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>
            
            <div className="mt-auto p-6 bg-slate-50 rounded-2xl border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Quantity</div>
                  <div className="text-sm text-gray-500">{product.stock} available</div>
                </div>
                <div className="flex items-center border rounded-lg bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-gray-600 hover:bg-gray-50">-</button>
                  <span className="px-4 py-2 font-medium border-x min-w-[3rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2 text-gray-600 hover:bg-gray-50">+</button>
                </div>
              </div>
              <button 
                onClick={handlePurchase} 
                disabled={product.stock <= 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition shadow ${product.stock > 0 ? 'bg-accent text-white hover:bg-orange-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {product.stock > 0 ? 'Purchase Now' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
