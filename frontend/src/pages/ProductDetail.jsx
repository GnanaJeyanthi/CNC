import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShoppingBag, CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react';

// ── Load Razorpay SDK dynamically ─────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id  = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ paymentId, productName, amount, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-90 duration-300">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Payment Successful!</h2>
        <p className="text-gray-500 text-sm mb-5">Your order has been placed.</p>

        <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 mb-6 border border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Product</span>
            <span className="font-semibold text-gray-800 text-right max-w-[60%] truncate">{productName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount Paid</span>
            <span className="font-bold text-green-600">₹{amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment ID</span>
            <span className="font-mono text-xs text-gray-600 truncate max-w-[55%]">{paymentId}</span>
          </div>
        </div>

        <button
          id="btn-success-view-orders"
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 transition text-sm"
        >
          View Order History →
        </button>
      </div>
    </div>
  );
}

// ── Failure Modal ─────────────────────────────────────────────────────────────
function FailureModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Payment Failed</h2>
        <p className="text-gray-500 text-sm mb-6">{message || 'Something went wrong. Please try again.'}</p>
        <button
          id="btn-failure-retry"
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition text-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product,  setProduct]  = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [loading,  setLoading]  = useState(false);

  const [successModal, setSuccessModal] = useState(null); // { paymentId, productName, amount }
  const [failureModal, setFailureModal] = useState(null); // { message }

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API}/products/${id}`);
        setProduct(data);
      } catch (err) { console.error(err); }
    };
    fetchProduct();
  }, [id]);

  // ── Razorpay purchase handler ─────────────────────────────────────────────
  const handlePurchase = async () => {
    if (!user) return navigate('/signin');
    if (quantity > product.stock) {
      setFailureModal({ message: 'Not enough stock available.' });
      return;
    }

    setLoading(true);

    try {
      // 1. Try loading Razorpay SDK
      let sdkLoaded = false;
      try {
        sdkLoaded = await loadRazorpayScript();
      } catch (sdkErr) {
        console.warn('Razorpay SDK failed to load (possibly blocked by browser tracking prevention). Using Demo Payment fallback.');
      }

      // 2. Create a Razorpay order on the backend
      const { data: orderData } = await axios.post(
        `${API}/payments/create-order`,
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // 3. Check if Demo payment mode or SDK is missing
      if (orderData.isMock || !sdkLoaded || !window.Razorpay) {
        const mockPaymentId = `pay_demo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await axios.post(
          `${API}/payments/verify`,
          {
            razorpayOrderId:   orderData.razorpayOrderId,
            razorpayPaymentId: mockPaymentId,
            razorpaySignature: 'demo_signature',
            productId:  product._id,
            quantity,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        setSuccessModal({
          paymentId:   mockPaymentId,
          productName: product.title,
          amount:      product.price * quantity,
        });

        // Refresh stock count
        const { data: updated } = await axios.get(`${API}/products/${id}`);
        setProduct(updated);
        setLoading(false);
        return;
      }

      // 4. Open real Razorpay checkout modal
      const options = {
        key:      orderData.key,
        amount:   orderData.amount,
        currency: orderData.currency,
        name:     'CastNcart',
        description: `Purchase: ${orderData.productName}`,
        image:    product.images?.[0]?.url || '',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name:  user.name  || '',
          email: user.email || '',
        },
        theme: { color: '#6366f1' },

        handler: async (response) => {
          try {
            await axios.post(
              `${API}/payments/verify`,
              {
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                productId:  product._id,
                quantity,
              },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );

            setSuccessModal({
              paymentId:   response.razorpay_payment_id,
              productName: product.title,
              amount:      product.price * quantity,
            });

            // Refresh stock count
            const { data: updated } = await axios.get(`${API}/products/${id}`);
            setProduct(updated);
          } catch (err) {
            setFailureModal({ message: err.response?.data?.message || 'Payment verification failed.' });
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setFailureModal({ message: response.error?.description || 'Payment was declined. Please try again.' });
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      setFailureModal({ message: err.response?.data?.message || 'Could not initiate payment.' });
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-ambient-blobs">
      <Navbar />

      {/* Modals */}
      {successModal && (
        <SuccessModal
          paymentId={successModal.paymentId}
          productName={successModal.productName}
          amount={successModal.amount}
          onClose={() => {
            setSuccessModal(null);
            navigate('/dashboard/user', { state: { tab: 'Order History' } });
          }}
        />
      )}
      {failureModal && (
        <FailureModal
          message={failureModal.message}
          onClose={() => setFailureModal(null)}
        />
      )}

      <div className="flex-1 max-w-6xl mx-auto px-4 w-full py-12 z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-xl border border-indigo-100/60 flex flex-col md:flex-row gap-12">

          {/* Image Gallery */}
          <div className="w-full md:w-1/2 space-y-4">
            <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[activeImg].url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImg(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${activeImg === idx ? 'border-accent' : 'border-transparent'}`}>
                    <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 w-fit mb-3">
              {product.category}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-gray-900">{product.title}</h1>
            <p className="text-sm text-gray-500 mb-4 font-medium">
              Crafted by <span className="text-gray-800 font-semibold">{product.creatorId?.name || 'Artisan Creator'}</span>
            </p>
            <div className="text-4xl font-black text-gray-900 mb-6">₹{product.price}</div>

            <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6">{product.description}</p>

            {/* Specifications */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-8 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                  ✨ Product Specifications ({product.category})
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {Object.entries(typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes).map(([key, val]) => (
                    <div key={key} className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold mb-0.5">{key}</span>
                      <span className="text-slate-800 font-semibold text-xs">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Panel */}
            <div className="mt-auto p-6 bg-slate-50 rounded-2xl border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Quantity</div>
                  <div className="text-sm text-gray-500">{product.stock} available</div>
                </div>
                <div className="flex items-center border rounded-lg bg-white">
                  <button
                    id="btn-qty-decrease"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >-</button>
                  <span className="px-4 py-2 font-medium border-x min-w-[3rem] text-center">{quantity}</span>
                  <button
                    id="btn-qty-increase"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >+</button>
                </div>
              </div>

              {/* Total preview */}
              <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                <span>Total</span>
                <span className="text-xl font-black text-gray-900">₹{product.price * quantity}</span>
              </div>

              <button
                id="btn-buy-now"
                onClick={handlePurchase}
                disabled={product.stock <= 0 || loading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition shadow flex items-center justify-center gap-2 ${
                  product.stock > 0 && !loading
                    ? 'bg-accent text-white hover:bg-orange-600 active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : product.stock > 0 ? (
                  <><CreditCard className="w-5 h-5" /> Pay with Razorpay</>
                ) : (
                  <><ShoppingBag className="w-5 h-5" /> Out of Stock</>
                )}
              </button>

              {product.stock > 0 && (
                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  🔒 Secure payment powered by Razorpay
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
