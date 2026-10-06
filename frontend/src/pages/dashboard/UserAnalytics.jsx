import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { BookOpen, ShoppingCart, Clock, TrendingUp, Award, CheckCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true } },
};

function KPI({ icon: Icon, label, value, sub, color, pct }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
      {pct !== undefined && (
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-100 rounded-full">
            <div
              className={`h-2 rounded-full ${color}`}
              style={{ width: `${Math.min(100, pct)}%`, transition: 'width 1s ease' }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">{pct}%</div>
        </div>
      )}
    </div>
  );
}

export default function UserAnalytics() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    axios.get(`${API_URL}/api/analytics/user/stats`, {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(r => { setData(r.data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 animate-pulse text-lg">Loading your analytics…</div>
    </div>
  );
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load.</div>;

  // ── Chart datasets ──────────────────────────────────────────────────────────
  const joinedChart = {
    labels: data.monthlyJoined.map(m => m.label),
    datasets: [{
      label: 'Workshops Joined',
      data: data.monthlyJoined.map(m => m.count),
      fill: true,
      backgroundColor: 'rgba(59,130,246,0.12)',
      borderColor: 'rgba(59,130,246,1)',
      pointBackgroundColor: 'rgba(59,130,246,1)',
      tension: 0.4,
    }],
  };

  const spendingChart = {
    labels: data.monthlySpending.map(m => m.label),
    datasets: [{
      label: 'Amount Spent ($)',
      data: data.monthlySpending.map(m => m.spent),
      backgroundColor: 'rgba(249,115,22,0.8)',
      borderRadius: 6,
    }],
  };

  const COLORS = [
    'rgba(59,130,246,0.85)', 'rgba(20,184,166,0.85)', 'rgba(249,115,22,0.85)',
    'rgba(139,92,246,0.85)', 'rgba(34,197,94,0.85)', 'rgba(239,68,68,0.85)',
  ];
  const categoryChart = {
    labels: data.categoryBreakdown.map(c => c.category),
    datasets: [{
      data: data.categoryBreakdown.map(c => c.count),
      backgroundColor: COLORS,
      borderWidth: 0,
    }],
  };

  const attendanceChart = {
    labels: data.attendanceBreakdown.map(a => a.status),
    datasets: [{
      data: data.attendanceBreakdown.map(a => a.count),
      backgroundColor: [
        'rgba(34,197,94,0.85)',
        'rgba(234,179,8,0.85)',
        'rgba(239,68,68,0.85)',
        'rgba(59,130,246,0.85)',
      ],
      borderWidth: 0,
    }],
  };

  const donutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 12 } } },
  };

  const learningHours = Math.round(data.totalLearningMins / 60 * 10) / 10;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Learning Analytics</h1>
            <p className="text-gray-500 mt-1">Track your progress and learning journey</p>
          </div>
          <a href="/dashboard/user" className="text-sm text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition">
            ← Dashboard
          </a>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <KPI icon={BookOpen}     label="Workshops Joined"       value={data.totalJoined}          color="bg-blue-500" />
          <KPI icon={CheckCircle}  label="Workshops Attended"     value={data.totalAttended}        color="bg-green-500" />
          <KPI icon={Award}        label="Attendance Rate"        value={`${data.attendancePct}%`}  pct={data.attendancePct} color="bg-teal-500" />
          <KPI icon={Clock}        label="Learning Hours"         value={`${learningHours}h`}       sub={`${data.totalLearningMins} mins total`} color="bg-purple-500" />
          <KPI icon={ShoppingCart} label="Products Purchased"     value={data.productsPurchased}    color="bg-orange-500" />
          <KPI icon={TrendingUp}   label="Total Spent"            value={`$${data.totalSpent}`}     color="bg-red-500" />
        </div>

        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center md:text-left">
              <div className="text-4xl font-bold">{data.attendancePct}%</div>
              <div className="text-white/80 text-sm">Attendance Rate</div>
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs text-white/70 mb-2">
                <span>Your Progress</span><span>{data.totalAttended} of {data.totalJoined} workshops attended</span>
              </div>
              <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${data.attendancePct}%` }}
                />
              </div>
            </div>
            <div className="hidden md:flex gap-8 text-center flex-shrink-0">
              <div><div className="text-2xl font-bold">{learningHours}h</div><div className="text-white/70 text-xs">Learning Time</div></div>
              <div><div className="text-2xl font-bold">{data.categoryBreakdown.length}</div><div className="text-white/70 text-xs">Categories</div></div>
            </div>
          </div>
        </div>

        {/* Row 1: Joined chart + Spending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">Workshops Joined Per Month</h2>
            <div className="h-56">
              <Line data={joinedChart} options={chartDefaults} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">Monthly Spending ($)</h2>
            <div className="h-56">
              <Bar data={spendingChart} options={chartDefaults} />
            </div>
          </div>
        </div>

        {/* Row 2: Category breakdown + Attendance breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">Workshops by Category</h2>
            <div className="h-56">
              {data.categoryBreakdown.length === 0
                ? <div className="h-full flex items-center justify-center text-gray-400">No data yet</div>
                : <Doughnut data={categoryChart} options={donutOpts} />
              }
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-4">Attendance Status Breakdown</h2>
            <div className="h-56">
              {data.attendanceBreakdown.every(a => a.count === 0)
                ? <div className="h-full flex items-center justify-center text-gray-400">No attendance data yet</div>
                : <Doughnut data={attendanceChart} options={donutOpts} />
              }
            </div>
          </div>
        </div>

        {/* Category progress bars */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-5">Learning Interests</h2>
          {data.categoryBreakdown.length === 0
            ? <p className="text-gray-400">Join some workshops to see your interests.</p>
            : <div className="space-y-4">
                {data.categoryBreakdown.map((c, i) => (
                  <div key={c.category} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600 font-medium text-right flex-shrink-0">{c.category}</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(c.count / data.categoryBreakdown[0].count) * 100}%`,
                          background: `hsl(${200 + i * 30}, 70%, 55%)`,
                          transition: 'width 1s ease',
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-8 text-right">{c.count}</span>
                  </div>
                ))}
              </div>
          }
        </div>

      </div>
    </div>
  );
}
