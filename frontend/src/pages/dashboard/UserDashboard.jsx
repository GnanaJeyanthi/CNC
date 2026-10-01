import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { Play, Calendar, Star, Package, Clock, CheckCircle, XCircle, AlertCircle, Truck, MapPin, Home, CheckCircle2 } from 'lucide-react';
import DailyGamesBanner from '../../components/DailyGamesBanner';

const statusColors = {
  attended:   'bg-green-100 text-green-700',
  partial:    'bg-yellow-100 text-yellow-700',
  absent:     'bg-red-100 text-red-600',
  registered: 'bg-blue-100 text-blue-700',
};
const statusIcons = {
  attended:   <CheckCircle className="w-3.5 h-3.5" />,
  partial:    <AlertCircle className="w-3.5 h-3.5" />,
  absent:     <XCircle    className="w-3.5 h-3.5" />,
  registered: <Clock      className="w-3.5 h-3.5" />,
};

const TABS = ['Overview', 'Recorded Videos 📹', 'Attendance History', 'Order History'];

const TRACKING_STEPS = [
  { id: 'Order Confirmed', label: 'Confirmed', icon: '✅' },
  { id: 'Preparing', label: 'Preparing', icon: '📦' },
  { id: 'Shipped', label: 'Shipped', icon: '🚀' },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: '🚚' },
  { id: 'Delivered', label: 'Delivered', icon: '🏠' },
  { id: 'Customer Confirmed Received', label: 'Order Received', icon: '🎉' },
];

const getStepIndex = (status) => {
  if (status === 'paid') return 0;
  const idx = TRACKING_STEPS.findIndex(s => s.id === status);
  return idx >= 0 ? idx : 0;
};

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState('Overview');
  const [data, setData] = useState({
    upcomingWorkshops: [],
    recommendedWorkshops: [],
    purchasedProducts: [],
    recentlyWatched: [],
    recordedVideos: []
  });
  const [attendance, setAttendance] = useState([]);
  const [orders, setOrders] = useState([]);

  const headers = { Authorization: `Bearer ${user?.token}` };

  const fetchMyOrders = () => {
    if (!user) return;
    axios.get('http://localhost:5000/api/orders/my-orders', { headers })
      .then(r => setOrders(r.data))
      .catch(console.error);
  };

  useEffect(() => {
    if (!user) return;
    // Always fetch overview data
    axios.get('http://localhost:5000/api/analytics/user', { headers })
      .then(r => setData(r.data))
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user || activeTab !== 'Attendance History') return;
    axios.get('http://localhost:5000/api/attendance/my-history', { headers })
      .then(r => setAttendance(r.data))
      .catch(console.error);
  }, [user, activeTab]);

  useEffect(() => {
    if (!user || activeTab !== 'Order History') return;
    fetchMyOrders();
  }, [user, activeTab]);

  // Real-time socket updates for Customer Order Status
  useEffect(() => {
    if (!socket || !user) return;
    const handleOrderUpdate = () => {
      fetchMyOrders();
    };

    socket.on('order_status_updated', handleOrderUpdate);
    socket.on('payment_success', handleOrderUpdate);

    return () => {
      socket.off('order_status_updated', handleOrderUpdate);
      socket.off('payment_success', handleOrderUpdate);
    };
  }, [socket, user]);

  const handleConfirmReceived = async (orderId) => {
    try {
      const { data: res } = await axios.post(
        `http://localhost:5000/api/orders/${orderId}/confirm-received`,
        {},
        { headers }
      );
      setOrders(prev => prev.map(o => o._id === orderId ? res.order : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm order receipt');
    }
  };

  const handleJoin = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/workshops/${id}/join`, {}, { headers });
      const res = await axios.get('http://localhost:5000/api/analytics/user', { headers });
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error joining workshop');
    }
  };

  const handleJoinLive = async (workshop) => {
    try {
      await axios.post(`http://localhost:5000/api/attendance/workshops/${workshop._id}/join-session`, {}, { headers });
    } catch (e) { /* non-critical */ }
    const liveUrl = workshop.ngrokUrl 
      ? (workshop.ngrokUrl.startsWith('http') ? workshop.ngrokUrl : `https://${workshop.ngrokUrl}`)
      : `https://meet.jit.si/${workshop.jitsiRoomName}`;
    const studentName = encodeURIComponent(user?.name ? `Student: ${user.name}` : 'Student');
    const fullStudentUrl = `${liveUrl}#userInfo.displayName="${studentName}"`;
    window.open(fullStudentUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>

          {/* Tabs */}
          <div className="flex items-center gap-3">
            <a href="/games" className="text-sm bg-amber-500 text-amber-950 font-bold px-4 py-1.5 rounded-lg hover:bg-amber-400 transition flex items-center gap-1.5 shadow-sm">
              <span>🧩</span> Daily Puzzles
            </a>
            <a href="/profile" className="text-sm bg-gray-700 text-white px-4 py-1.5 rounded-lg hover:bg-gray-900 transition">
              👤 My Profile
            </a>
            <a href="/dashboard/user/analytics" className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 transition">
              📈 My Analytics
            </a>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Puzzles LinkedIn-style Bar */}
        <DailyGamesBanner />

        {/* ── Overview Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Workshops */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Workshops</h2>
                <div className="space-y-4">
                  {data.upcomingWorkshops.length === 0
                    ? <p className="text-gray-500">No upcoming workshops. <a href="/workshops" className="text-primary underline">Browse workshops →</a></p>
                    : data.upcomingWorkshops.map(w => (
                      <div key={w._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 text-primary rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                            {w.thumbnailUrl ? <img src={w.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" /> : <Calendar className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{w.title}</h3>
                            <p className="text-sm text-gray-500">{w.scheduledDate ? new Date(w.scheduledDate).toLocaleString() : 'TBA'}</p>
                          </div>
                        </div>
                        {w.status === 'live' ? (
                          <button onClick={() => handleJoinLive(w)}
                            className="flex items-center text-sm font-medium text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors animate-pulse shadow-md">
                            <Play className="w-4 h-4 mr-1.5" /> Join Live Now
                          </button>
                        ) : (
                          <button className="flex items-center text-sm font-medium text-gray-400 bg-gray-100 px-4 py-2 rounded-lg cursor-not-allowed" disabled>
                            <Clock className="w-4 h-4 mr-1.5" /> Waiting for host
                          </button>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Recommended */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended for you</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.recommendedWorkshops.length === 0
                    ? <p className="text-gray-500">No recommendations right now.</p>
                    : data.recommendedWorkshops.map(w => (
                      <div key={w._id} className="border border-gray-100 rounded-xl overflow-hidden group cursor-pointer hover:shadow-md transition">
                        <div className="h-32 bg-gray-200 w-full relative">
                          {w.thumbnailUrl && <img src={w.thumbnailUrl} alt={w.title} className="w-full h-full object-cover" />}
                          <div className="absolute top-2 right-2 bg-white px-2 py-1 text-xs font-bold rounded-md shadow-sm text-gray-700">
                            {w.price === 0 ? 'Free' : `$${w.price}`}
                          </div>
                        </div>
                        <div className="p-4 bg-white flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">{w.title}</h3>
                            <p className="text-xs text-gray-500">By {w.creatorId?.name || 'Creator'}</p>
                          </div>
                          <button onClick={() => handleJoin(w._id)} className="bg-primary text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700">
                            Enroll
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recently Watched */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Watch Recordings</h2>
                <div className="space-y-4">
                  {(data.recordedVideos || []).length === 0
                    ? <p className="text-gray-500 text-sm">No recordings yet.</p>
                    : (data.recordedVideos || []).map(w => (
                      <div key={w._id} className="flex justify-between items-center border-b pb-3">
                        <div>
                          <div className="text-sm font-semibold">{w.title}</div>
                          <div className="text-xs text-gray-400">Recorded session</div>
                        </div>
                        {w.recordingUrl ? (
                          <a href={w.recordingUrl} target="_blank" rel="noreferrer"
                            className="text-primary hover:text-blue-700 text-xs flex items-center gap-1">
                            <Play className="w-3 h-3" /> Watch
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">Processing</span>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Purchased Products */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Purchased Products</h2>
                <div className="space-y-3">
                  {data.purchasedProducts.length === 0
                    ? <p className="text-gray-500 text-sm">No orders yet. <a href="/marketplace" className="text-primary underline">Shop now →</a></p>
                    : data.purchasedProducts.slice(0, 3).map(order => (
                      <div key={order._id} className="border rounded-lg p-3 space-y-2">
                        {order.items.map(item => (
                          <div key={item._id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-accent" />
                              <span className="font-medium">{item.itemId?.title || 'Item'}</span>
                            </div>
                            <span className="text-gray-500 text-xs">×{item.quantity}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center text-xs text-gray-400 pt-1 border-t">
                          <span>{order.status}</span>
                          <span className="font-semibold text-gray-700">${order.totalAmount}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Recorded Videos Tab ────────────────────────────────────────── */}
        {activeTab === 'Recorded Videos 📹' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Recorded Masterclasses & Workshops</h2>
              <p className="text-sm text-gray-500 mt-1">Watch replays of the workshops you've attended.</p>
            </div>
            
            <div className="p-6">
              {(data.recordedVideos || []).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No recordings available yet</h3>
                  <p className="text-gray-500">When your instructors publish workshop recordings, they will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(data.recordedVideos || []).map(w => (
                    <div key={w._id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition bg-white flex flex-col">
                      <div className="h-40 bg-gray-900 relative group cursor-pointer" onClick={() => window.location.href = `/workshops/${w._id}`}>
                        {w.thumbnailUrl ? (
                          <img src={w.thumbnailUrl} alt={w.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-700">🎨</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 group-hover:bg-primary group-hover:border-primary transition">
                            <Play className="w-5 h-5 ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-md">
                          Replay Available
                        </div>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col">
                        <span className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{w.category || 'Workshop'}</span>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{w.title}</h3>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{w.description}</p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {w.creatorId?.avatar ? (
                              <img src={w.creatorId.avatar} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                {w.creatorId?.name?.[0] || 'I'}
                              </div>
                            )}
                            <span className="text-xs font-medium text-gray-600 truncate max-w-[100px]">{w.creatorId?.name || 'Instructor'}</span>
                          </div>
                          <a 
                            href={`/workshops/${w._id}`}
                            className="text-primary text-xs font-bold hover:underline"
                          >
                            Watch Now →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Attendance History Tab ────────────────────────────────────────── */}
        {activeTab === 'Attendance History' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">My Attendance History</h2>
              <p className="text-sm text-gray-500 mt-1">A record of all workshops you registered or attended.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Workshop</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Creator</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-center px-6 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-center px-6 py-3 text-gray-500 font-medium">Join Time</th>
                    <th className="text-center px-6 py-3 text-gray-500 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendance.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">No attendance records found.</td></tr>
                  )}
                  {attendance.map(a => (
                    <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {a.workshopId?.thumbnailUrl && (
                            <img src={a.workshopId.thumbnailUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <span className="font-medium text-gray-900">{a.workshopId?.title || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{a.workshopId?.creatorId?.name || '—'}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {a.workshopId?.scheduledDate ? new Date(a.workshopId.scheduledDate).toLocaleDateString() : 'TBA'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[a.status] || statusColors.registered}`}>
                          {statusIcons[a.status] || statusIcons.registered} {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500 text-xs">
                        {a.joinTime ? new Date(a.joinTime).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {a.totalDurationMinutes > 0 ? `${a.totalDurationMinutes} min` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Order History & Real-Time Tracking Tab ───────────────────────── */}
        {activeTab === 'Order History' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-gray-900">My Orders & Live Tracking</h2>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Updates
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Track order preparation, shipping progress, and confirm order receipts.</p>
              </div>
              <a href="/marketplace" className="text-sm bg-accent text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition font-bold shadow-sm flex items-center gap-1">
                Shop Marketplace →
              </a>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  🛍️
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No Orders Placed Yet</h3>
                <p className="text-gray-400 text-sm mb-4">Your purchased items will appear here with live real-time order tracking.</p>
                <a href="/marketplace" className="inline-block bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow hover:bg-blue-700 transition">
                  Explore Products
                </a>
              </div>
            ) : (
              orders.map(order => {
                const currentStatus = order.orderStatus || order.status || 'Order Confirmed';
                const currentStepIdx = getStepIndex(currentStatus);
                const shortId = order._id.slice(-8).toUpperCase();
                const creatorName = order.creatorId?.name || 'Creator';
                const orderDate = new Date(order.createdAt).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-600 text-base">#{shortId}</span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs font-semibold text-gray-500">{orderDate}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Payment: Paid
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1 font-medium">
                          Seller: <span className="font-bold text-gray-800">{creatorName}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-400 font-medium">Total Amount</div>
                        <div className="text-xl font-black text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    {/* Stepper Progress Timeline */}
                    <div className="py-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Order Progress & Status</div>
                      <div className="relative flex items-center justify-between">
                        {/* Connecting Line */}
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-100 z-0 rounded"></div>
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 z-0 transition-all duration-500 rounded"
                          style={{
                            width: `${(currentStepIdx / (TRACKING_STEPS.length - 1)) * 100}%`
                          }}
                        ></div>

                        {/* Steps */}
                        {TRACKING_STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                                isCompleted
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                  : 'bg-white border-gray-300 text-gray-400'
                              } ${isCurrent ? 'ring-4 ring-indigo-100 scale-110' : ''}`}>
                                {isCompleted ? step.icon : idx + 1}
                              </div>
                              <span className={`text-[11px] mt-2 font-bold text-center hidden md:block max-w-[80px] ${
                                isCurrent ? 'text-indigo-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Current Status highlight pill */}
                      <div className="mt-6 flex items-center justify-between bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{TRACKING_STEPS[currentStepIdx]?.icon || '📦'}</span>
                          <div>
                            <span className="text-xs text-gray-500 font-medium">Current Status: </span>
                            <span className="text-xs font-black text-indigo-900 uppercase tracking-wide">
                              {currentStatus}
                            </span>
                          </div>
                        </div>

                        {order.razorpayPaymentId && (
                          <div className="text-[11px] font-mono text-indigo-700 bg-white px-2.5 py-1 rounded-md border border-indigo-200">
                            ID: {order.razorpayPaymentId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-bold text-gray-500">Purchased Items</div>
                      {order.items.map(item => (
                        <div key={item._id} className="flex items-center justify-between gap-4 bg-gray-50 p-3 rounded-xl">
                          <div className="flex items-center gap-3">
                            {item.itemId?.images?.[0]?.url ? (
                              <img src={item.itemId.images[0].url} alt={item.itemId?.title} className="w-12 h-12 rounded-lg object-cover border flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 text-xl">🛍️</div>
                            )}
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{item.itemId?.title || 'Product Item'}</div>
                              <div className="text-xs text-gray-500">Quantity: <span className="font-bold text-gray-800">{item.quantity}</span> · Price: ₹{item.price}</div>
                            </div>
                          </div>
                          <div className="font-bold text-gray-900 text-sm">₹{(item.quantity * item.price).toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                    </div>

                    {/* Customer Action Button: Confirm Received */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
                      {currentStatus === 'Delivered' && (
                        <button
                          onClick={() => handleConfirmReceived(order._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 transform hover:-translate-y-0.5"
                        >
                          <span>✓</span> Yes, I Received My Order
                        </button>
                      )}

                      {order.customerReceived || currentStatus === 'Customer Confirmed Received' ? (
                        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                          <span>🎉</span> Order Received Confirmed {order.customerReceivedAt && `on ${new Date(order.customerReceivedAt).toLocaleDateString('en-IN')}`}
                        </div>
                      ) : currentStatus !== 'Delivered' && (
                        <div className="text-xs text-gray-400 font-medium italic">
                          "Confirm Order Received" button will activate once status is Delivered.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default UserDashboard;
