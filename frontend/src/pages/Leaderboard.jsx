import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BADGE_COLORS = { Platinum: 'text-cyan-300', Gold: 'text-yellow-400', Silver: 'text-gray-300', Bronze: 'text-orange-400' };

export default function Leaderboard() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ['leaderboard'], queryFn: () => api.get('/dashboard/leaderboard').then(r => r.data) });
  const leaders = data?.leaderboard || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">🏆 Civic Champions</h1>
        <p className="text-gray-400 mt-2">Top contributors making their communities better.</p>
      </div>

      {/* Top 3 podium */}
      {leaders.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[leaders[1], leaders[0], leaders[2]].map((u, i) => (
            <div key={u._id} className={`text-center ${i === 1 ? 'mb-0' : 'mb-6'}`}>
              <div className={`w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl mx-auto mb-2 border-2 ${
                i === 1 ? 'border-yellow-400 w-20 h-20' : 'border-gray-600'
              }`}>
                {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-full object-cover" /> : '👤'}
              </div>
              <p className="text-white text-sm font-medium">{u.name}</p>
              <p className="text-emerald-400 text-sm font-bold">{u.points}pts</p>
              <div className={`text-3xl ${i === 1 ? 'text-yellow-400' : i === 0 ? 'text-gray-400' : 'text-orange-400'}`}>
                {i === 1 ? '🥇' : i === 0 ? '🥈' : '🥉'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {leaders.map((leader) => (
          <div key={leader._id}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              user?._id === leader._id ? 'bg-emerald-900/20 border-emerald-800' : 'bg-gray-900 border-gray-800 hover:border-gray-700'
            }`}>
            <span className="text-gray-500 font-bold w-6 text-right">{leader.rank}</span>
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              {leader.avatar_url ? <img src={leader.avatar_url} className="w-full h-full rounded-full object-cover" /> : '👤'}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{leader.name} {user?._id === leader._id && <span className="text-emerald-400 text-xs">(You)</span>}</p>
              <p className="text-gray-500 text-sm">{leader.reports_count} reports · {leader.verified_reports} verified</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">{leader.points}</p>
              <p className={`text-xs font-medium ${BADGE_COLORS[leader.badge_tier]}`}>{leader.badge_tier}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
