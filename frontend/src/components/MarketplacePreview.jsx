import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function MarketplacePreview() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="bg-slate-50 py-24 border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="font-bold text-3xl md:text-4xl text-textMain tracking-tight">Creator Marketplace (Sales)</h2>
            <p className="mt-4 text-textMuted text-lg">Support your favorite creators by purchasing their products.</p>
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((p, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-hover transition-all group flex flex-col cursor-pointer"
            >
              <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                {p.images && p.images[0] ? (
                  <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">No Image</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-textMain mb-2 group-hover:text-accent transition-colors leading-tight">{p.title}</h3>
                <span className="text-sm font-medium text-textMuted mb-4">By {p.creatorId?.name || 'Creator'}</span>
                
                <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
                  <div className="text-xl font-bold text-textMain">${p.price}</div>
                  <button className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm">
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
