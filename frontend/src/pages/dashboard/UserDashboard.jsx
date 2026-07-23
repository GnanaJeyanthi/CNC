import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Play, Calendar, Star, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

const TABS = ['Overview', 'Attendance History', 'Order History'];

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Overview');
  const [data, setData] = useState({
    upcomingWorkshops: [],
    recommendedWorkshops: [],
    purchasedProducts: [],
    recentlyWatched: []
  });
  const [attendance, setAttendance] = useState([]);
  const [orders, setOrders] = useState([]);

  const headers = { Authorization: `Bearer ${user?.token}` };

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
    setOrders(data.purchasedProducts || []);
  }, [user, activeTab, data]);

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
                  {data.recentlyWatched.length === 0
                    ? <p className="text-gray-500 text-sm">No recordings yet.</p>
                    : data.recentlyWatched.map(w => (
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

        {/* ── Order History Tab ─────────────────────────────────────────────── */}
        {activeTab === 'Order History' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Order History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Order ID</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Items</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-center px-6 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-right px-6 py-3 text-gray-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.purchasedProducts.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-400">No orders placed yet.</td></tr>
                  )}
                  {data.purchasedProducts.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 text-xs font-mono">{order._id.slice(-8)}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {order.items.map(item => (
                            <div key={item._id} className="flex items-center gap-2">
                              <Package className="w-3.5 h-3.5 text-accent" />
                              <span>{item.itemId?.title || 'Item'}</span>
                              <span className="text-gray-400 text-xs">×{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'paid' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">${order.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserDashboard;
