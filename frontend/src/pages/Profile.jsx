import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BADGE_CONFIGS = {
  Bronze:   { color: 'text-orange-400', bg: 'bg-orange-900/30', emoji: '🥉', next: 'Silver at 100pts' },
  Silver:   { color: 'text-gray-300', bg: 'bg-gray-700/30', emoji: '🥈', next: 'Gold at 300pts' },
  Gold:     { color: 'text-yellow-400', bg: 'bg-yellow-900/30', emoji: '🥇', next: 'Platinum at 600pts' },
  Platinum: { color: 'text-cyan-300', bg: 'bg-cyan-900/30', emoji: '💎', next: 'Max tier reached!' }
};

export default function Profile() {
  const { user } = useAuth();
  const badge = BADGE_CONFIGS[user?.badge_tier || 'Bronze'];

  const { data: rewardsData } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => api.get('/auth/rewards').then(r => r.data)
  });

  const { data: issuesData } = useQuery({
    queryKey: ['userIssues'],
    queryFn: () => api.get(`/issues?reporter=${user?._id}&sort=recent&limit=5`).then(r => r.data)
  });

  const ACTION_LABELS = {
    first_report: { label: 'Submitted Report', icon: '📝', color: 'text-blue-400' },
    verified_report: { label: 'AI Verified Report', icon: '🤖', color: 'text-purple-400' },
    issue_resolved: { label: 'Issue Resolved!', icon: '✅', color: 'text-emerald-400' },
    bonus: { label: 'Bonus Points', icon: '🎁', color: 'text-yellow-400' }
  };

  const nextMilestone = { Bronze: 100, Silver: 300, Gold: 600, Platinum: Infinity }[user?.badge_tier || 'Bronze'];
  const progress = user?.points && nextMilestone !== Infinity
    ? Math.min((user.points / nextMilestone) * 100, 100) : 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gray-700 flex items-center justify-center text-4xl border border-gray-600">
            {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-2xl object-cover" /> : '👤'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full ${badge.bg}`}>
              <span>{badge.emoji}</span>
              <span className={`text-sm font-semibold ${badge.color}`}>{user?.badge_tier} Citizen</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-400">{user?.points}</p>
            <p className="text-gray-500 text-sm">Civic Points</p>
          </div>
        </div>

        {/* Progress to next badge */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress to next badge</span>
            <span>{badge.next}</span>
          </div>
          <div className="bg-gray-800 rounded-full h-2">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          {[
            { label: 'Reports', value: user?.reports_count || 0 },
            { label: 'Verified', value: user?.verified_reports || 0 },
            { label: 'Points', value: user?.points || 0 }
          ].map(({ label, value }) => (
            <div key={label} className="text-center bg-gray-800/50 rounded-xl p-3">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards History */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">Points History</h2>
        <div className="space-y-3">
          {(rewardsData?.transactions || []).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No rewards yet. Start reporting issues!</p>
          ) : (
            rewardsData.transactions.map(tx => {
              const config = ACTION_LABELS[tx.action] || ACTION_LABELS.bonus;
              return (
                <div key={tx._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                  <span className="text-xl">{config.icon}</span>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${config.color}`}>{config.label}</p>
                    {tx.issue_id && <p className="text-gray-500 text-xs">{tx.issue_id.title}</p>}
                  </div>
                  <span className="text-emerald-400 font-bold">+{tx.points}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
