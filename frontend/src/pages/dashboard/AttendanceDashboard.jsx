import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Users, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle, Search, ChevronDown } from 'lucide-react';

const statusColors = {
  attended: 'bg-green-100 text-green-700',
  partial:  'bg-yellow-100 text-yellow-700',
  absent:   'bg-red-100 text-red-700',
  registered: 'bg-blue-100 text-blue-700',
};

const statusIcons = {
  attended:   <CheckCircle className="w-4 h-4 text-green-600" />,
  partial:    <AlertCircle className="w-4 h-4 text-yellow-600" />,
  absent:     <XCircle    className="w-4 h-4 text-red-600" />,
  registered: <Clock      className="w-4 h-4 text-blue-600" />,
};

export default function AttendanceDashboard() {
  const { user } = useContext(AuthContext);
  const [report, setReport]         = useState([]);
  const [selected, setSelected]     = useState(null);
  const [participants, setParticipants] = useState([]);
  const [pStats, setPStats]         = useState(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading]       = useState(false);

  const headers = { Authorization: `Bearer ${user?.token}` };

  // Fetch overall report
  useEffect(() => {
    if (!user) return;
    axios.get('http://localhost:5000/api/attendance/report', { headers })
      .then(r => setReport(r.data))
      .catch(console.error);
  }, [user]);

  // Fetch participants when a workshop is selected
  const loadParticipants = async (workshopId) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/attendance/workshops/${workshopId}/participants?status=${filterStatus}&search=${search}`,
        { headers }
      );
      setParticipants(data.participants);
      setPStats(data.stats);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSelectWorkshop = (w) => {
    setSelected(w);
    setSearch('');
    setFilterStatus('all');
    loadParticipants(w.workshopId);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selected) loadParticipants(selected.workshopId);
  };

  const handleMarkStatus = async (userId, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/attendance/workshops/${selected.workshopId}/mark-status`,
        { userId, status },
        { headers }
      );
      loadParticipants(selected.workshopId);
    } catch (e) { alert('Error updating status'); }
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-500 mt-1">Track participant attendance across all your workshops</p>
        </div>

        {/* Overall Report Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">All Workshops Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Workshop</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">Total</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">Attended</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">Absent</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">Rate</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">Avg Duration</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">No workshops found</td></tr>
                )}
                {report.map(w => (
                  <tr key={w.workshopId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{w.title}</td>
                    <td className="px-6 py-4 text-gray-500">{w.scheduledDate ? new Date(w.scheduledDate).toLocaleDateString() : 'TBA'}</td>
                    <td className="px-6 py-4 text-center">{w.stats.total}</td>
                    <td className="px-6 py-4 text-center text-green-600 font-semibold">{w.stats.attended}</td>
                    <td className="px-6 py-4 text-center text-red-500">{w.stats.absent}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${w.stats.attendanceRate >= 70 ? 'bg-green-100 text-green-700' : w.stats.attendanceRate >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                        {w.stats.attendanceRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{w.stats.avgDurationMinutes} min</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleSelectWorkshop(w)} className="text-xs bg-primary text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Participant Detail Panel */}
        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.title} — Participants</h2>
                {pStats && (
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-500">Total: <strong>{pStats.total}</strong></span>
                    <span className="text-green-600">Attended: <strong>{pStats.attended}</strong></span>
                    <span className="text-yellow-600">Partial: <strong>{pStats.partial}</strong></span>
                    <span className="text-red-500">Absent: <strong>{pStats.absent}</strong></span>
                    <span className="text-blue-500">Registered: <strong>{pStats.registered}</strong></span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input type="text" placeholder="Search participants..." value={search} onChange={e => setSearch(e.target.value)}
                    className="border px-3 py-1.5 rounded-lg text-sm" />
                  <button type="submit" className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">
                    <Search className="w-4 h-4 text-gray-600" />
                  </button>
                </form>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setTimeout(() => loadParticipants(selected.workshopId), 0); }}
                  className="border px-3 py-1.5 rounded-lg text-sm bg-white">
                  <option value="all">All Statuses</option>
                  <option value="attended">Attended</option>
                  <option value="partial">Partial</option>
                  <option value="absent">Absent</option>
                  <option value="registered">Registered</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Participant</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Registered</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Join Time</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Leave Time</th>
                      <th className="text-center px-6 py-3 text-gray-500 font-medium">Duration</th>
                      <th className="text-center px-6 py-3 text-gray-500 font-medium">Status</th>
                      <th className="text-center px-6 py-3 text-gray-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {participants.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400">No participants found</td></tr>
                    )}
                    {participants.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                              {p.userId?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{p.userId?.name}</div>
                              <div className="text-xs text-gray-400">{p.userId?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{new Date(p.joinedAt).toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{p.joinTime ? new Date(p.joinTime).toLocaleTimeString() : '—'}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{p.leaveTime ? new Date(p.leaveTime).toLocaleTimeString() : '—'}</td>
                        <td className="px-6 py-4 text-center text-gray-600">{p.totalDurationMinutes > 0 ? `${p.totalDurationMinutes} min` : '—'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status]}`}>
                            {statusIcons[p.status]} {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="relative inline-block">
                            <select onChange={e => handleMarkStatus(p.userId?._id, e.target.value)} defaultValue={p.status}
                              className="text-xs border px-2 py-1 rounded-lg bg-white cursor-pointer">
                              <option value="registered">Registered</option>
                              <option value="attended">Attended</option>
                              <option value="partial">Partial</option>
                              <option value="absent">Absent</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
