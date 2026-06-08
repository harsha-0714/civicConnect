import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../api/axios';

const COLORS = { pothole: '#f59e0b', garbage_dump: '#ef4444', broken_streetlight: '#eab308', water_leakage: '#3b82f6', open_manhole: '#f97316' };
const STATUS_COLORS = { reported: '#6366f1', in_progress: '#f59e0b', resolved: '#10b981' };

export default function Dashboard() {
  const { data: statsData } = useQuery({ queryKey: ['stats'], queryFn: () => api.get('/dashboard/stats').then(r => r.data) });
  const { data: trendsData } = useQuery({ queryKey: ['trends'], queryFn: () => api.get('/dashboard/trends?period=30d').then(r => r.data) });

  const stats = statsData?.stats || {};

  const typeData = Object.entries(stats.issues_by_type || {}).map(([name, value]) => ({
    name: name.replace('_', ' '), value, fill: COLORS[name] || '#6b7280'
  }));

  const trendChartData = (trendsData?.reported || []).map(item => ({
    date: item._id.slice(5),
    Reported: item.count,
    Resolved: trendsData?.resolved?.find(r => r._id === item._id)?.count || 0
  }));

  const StatCard = ({ label, value, sub, color }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color || 'text-white'}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Community Dashboard</h1>
      <p className="text-gray-400 mb-8">Real-time civic issues analytics for your community.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Issues" value={stats.total_issues || 0} />
        <StatCard label="Resolved" value={stats.resolved_issues || 0} color="text-emerald-400" />
        <StatCard label="Active" value={stats.active_issues || 0} color="text-yellow-400" />
        <StatCard label="Resolution Rate" value={`${stats.resolution_rate || 0}%`} color="text-blue-400" sub="All time" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* 30-day trend */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">30-Day Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
              <Line type="monotone" dataKey="Reported" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Issues by type */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Issues by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {typeData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status breakdown bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Status Overview</h3>
        <div className="space-y-3">
          {[
            { label: 'Reported', count: stats.total_issues - stats.resolved_issues - stats.in_progress_issues, color: 'bg-indigo-500' },
            { label: 'In Progress', count: stats.in_progress_issues, color: 'bg-yellow-500' },
            { label: 'Resolved', count: stats.resolved_issues, color: 'bg-emerald-500' }
          ].map(({ label, count, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-medium">{count || 0}</span>
              </div>
              <div className="bg-gray-800 rounded-full h-2">
                <div className={`${color} h-2 rounded-full transition-all`}
                  style={{ width: stats.total_issues ? `${((count || 0) / stats.total_issues) * 100}%` : '0%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
