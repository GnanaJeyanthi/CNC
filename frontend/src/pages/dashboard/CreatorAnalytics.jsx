import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Users, DollarSign, BookOpen, Package, Star, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const PALETTE = {
  blue:   'rgba(59,130,246,',
  teal:   'rgba(20,184,166,',
  orange: 'rgba(249,115,22,',
  purple: 'rgba(139,92,246,',
  green:  'rgba(34,197,94,',
};

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true } },
};

function KPI({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function CreatorAnalytics() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    axios.get(`http://localhost:5000/api/analytics/creator/${user._id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(r => { setData(r.data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 animate-pulse text-lg">Loading analytics…</div>
    </div>
  );

  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load analytics.</div>;

  // ── Chart datasets ──────────────────────────────────────────────────────────
  const revenueChart = {
    labels: data.monthlyRevenue.map(m => m.label),
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.monthlyRevenue.map(m => m.revenue),
        backgroundColor: `${PALETTE.blue}0.85)`,
        borderRadius: 6,
      },
      {
        label: 'Orders',
        data: data.monthlyRevenue.map(m => m.orders),
        backgroundColor: `${PALETTE.orange}0.7)`,
        borderRadius: 6,
      },
    ],
  };

  const enrollChart = {
    labels: data.monthlyEnrollments.map(m => m.label),
    datasets: [{
      label: 'Enrollments',
      data: data.monthlyEnrollments.map(m => m.count),
      fill: true,
      backgroundColor: `${PALETTE.teal}0.15)`,
      borderColor: `${PALETTE.teal}1)`,
      pointBackgroundColor: `${PALETTE.teal}1)`,
      tension: 0.4,
    }],
  };

  const popularChart = {
    labels: data.popularWorkshops.map(w => w.title.length > 18 ? w.title.slice(0, 18) + '…' : w.title),
    datasets: [
      {
        label: 'Enrolled',
        data: data.popularWorkshops.map(w => w.enrollments),
        backgroundColor: `${PALETTE.purple}0.8)`,
        borderRadius: 6,
      },
      {
        label: 'Attended',
        data: data.popularWorkshops.map(w => w.attended),
        backgroundColor: `${PALETTE.green}0.8)`,
        borderRadius: 6,
      },
    ],
  };

  const statusColors = ['rgba(59,130,246,0.8)', 'rgba(20,184,166,0.8)', 'rgba(249,115,22,0.8)', 'rgba(139,92,246,0.8)', 'rgba(239,68,68,0.8)'];
  const statusChart = {
    labels: data.statusBreakdown.map(s => s._id),
    datasets: [{
      data: data.statusBreakdown.map(s => s.count),
      backgroundColor: statusColors,
      borderWidth: 0,
    }],
  };

  const bestProductsChart = {
    labels: data.bestProducts.map(p => p.title?.length > 16 ? p.title.slice(0, 16) + '…' : (p.title || 'Unknown')),
    datasets: [
      {
        label: 'Units Sold',
        data: data.bestProducts.map(p => p.unitsSold),
        backgroundColor: `${PALETTE.orange}0.8)`,
        borderRadius: 6,
      },
      {
        label: 'Revenue ($)',
        data: data.bestProducts.map(p => p.revenue),
        backgroundColor: `${PALETTE.blue}0.8)`,
        borderRadius: 6,
      },
    ],
  };

  const donutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 12 } } },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Creator Analytics</h1>
            <p className="text-gray-500 mt-1">All data sourced live from MongoDB</p>
          </div>
          <a href="/dashboard/creator" className="text-sm text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition">
            ← Dashboard
          </a>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPI icon={BookOpen}   label="Total Workshops"  value={data.totalWorkshops}    sub={`${data.liveWorkshops} live`}             color="bg-blue-500" />
          <KPI icon={Users}      label="Enrolled Students" value={data.totalParticipants} sub={`${data.attendanceRate}% attended`}        color="bg-teal-500" />
          <KPI icon={DollarSign} label="Total Revenue"    value={`$${data.totalRevenue}`} sub={`${data.totalOrders} orders`}             color="bg-orange-500" />
          <KPI icon={Package}    label="Products Listed"  value={data.totalProducts}      sub={`${data.endedWorkshops} ended workshops`} color="bg-purple-500" />
        </div>

        {/* Row 1: Revenue + Enrollments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">Monthly Revenue & Orders</h2>
            <div className="h-64">
              <Bar data={revenueChart} options={chartDefaults} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">Monthly Enrollments (Growth)</h2>
            <div className="h-64">
              <Line data={enrollChart} options={{ ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, beginAtZero: true } } }} />
            </div>
          </div>
        </div>

        {/* Row 2: Popular Workshops + Workshop Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <h2 className="text-base font-bold text-gray-800 mb-4">Most Popular Workshops</h2>
            <div className="h-64">
              {data.popularWorkshops.length === 0
                ? <div className="h-full flex items-center justify-center text-gray-400">No data yet</div>
                : <Bar data={popularChart} options={chartDefaults} />
              }
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">Workshop Status Mix</h2>
            <div className="h-64">
              {data.statusBreakdown.length === 0
                ? <div className="h-full flex items-center justify-center text-gray-400">No data yet</div>
                : <Doughnut data={statusChart} options={donutOpts} />
              }
            </div>
          </div>
        </div>

        {/* Row 3: Best Products + Top Workshops Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">Best Selling Products</h2>
            <div className="h-64">
              {data.bestProducts.length === 0
                ? <div className="h-full flex items-center justify-center text-gray-400">No product sales yet</div>
                : <Bar data={bestProductsChart} options={chartDefaults} />
              }
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">Top Workshops by Enrollment</h2>
            <div className="space-y-3">
              {data.popularWorkshops.length === 0
                ? <p className="text-gray-400 text-sm">No enrollment data yet.</p>
                : data.popularWorkshops.map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{w.title}</div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                          style={{ width: `${Math.min(100, (w.enrollments / (data.popularWorkshops[0]?.enrollments || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 flex-shrink-0">{w.enrollments}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Attendance rate banner */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-3xl font-bold">{data.attendanceRate}%</div>
            <div className="text-white/80 text-sm mt-1">Overall attendance rate across all workshops</div>
          </div>
          <div className="flex gap-8 text-center">
            <div><div className="text-2xl font-bold">{data.attendedCount}</div><div className="text-white/70 text-xs">Attended</div></div>
            <div><div className="text-2xl font-bold">{data.totalParticipants - data.attendedCount}</div><div className="text-white/70 text-xs">Absent</div></div>
            <div><div className="text-2xl font-bold">{data.totalParticipants}</div><div className="text-white/70 text-xs">Total Enrolled</div></div>
          </div>
          <Activity className="w-16 h-16 text-white/30 hidden md:block" />
        </div>

      </div>
    </div>
  );
}
