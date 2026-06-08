import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiThumbsUp, FiMapPin, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ISSUE_EMOJIS = { pothole: '🕳️', garbage_dump: '🗑️', broken_streetlight: '💡', water_leakage: '💧', open_manhole: '⚠️' };
const STATUS_STYLES = {
  reported:    'bg-red-900/30 text-red-400',
  in_progress: 'bg-yellow-900/30 text-yellow-400',
  resolved:    'bg-emerald-900/30 text-emerald-400',
};

export default function IssueCard({ issue, queryKey }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutate: vote, isPending } = useMutation({
    mutationFn: () =>
      issue.user_voted ? api.delete(`/votes/${issue._id}`) : api.post(`/votes/${issue._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
      toast.success(issue.user_voted ? 'Vote removed' : 'Upvoted!');
    },
    onError: err => toast.error(err.response?.data?.message || 'Vote failed')
  });

  const severity = issue.severity_score || 0;
  const severityColor = severity >= 7 ? 'text-red-400' : severity >= 4 ? 'text-yellow-400' : 'text-emerald-400';

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl overflow-hidden transition-colors group">
      {/* Image */}
      <Link to={`/issues/${issue._id}`}>
        <div className="relative h-40 bg-gray-800">
          {issue.images?.[0] ? (
            <img src={issue.images[0].thumbnail_url || issue.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {ISSUE_EMOJIS[issue.issue_type] || '📍'}
            </div>
          )}
          <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[issue.status]}`}>
            {issue.status?.replace('_', ' ')}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">{ISSUE_EMOJIS[issue.issue_type]}</span>
          <span className="text-gray-500 text-xs capitalize">{issue.issue_type?.replace('_', ' ')}</span>
          <span className="ml-auto text-xs font-medium">
            ⚡ <span className={severityColor}>{severity.toFixed(1)}</span>
          </span>
        </div>

        <Link to={`/issues/${issue._id}`}>
          <h3 className="text-white font-medium text-sm leading-snug hover:text-emerald-400 transition-colors line-clamp-2 mb-3">{issue.title}</h3>
        </Link>

        {issue.location?.address && (
          <div className="flex items-center gap-1 text-gray-600 text-xs mb-3">
            <FiMapPin size={10} />
            <span className="truncate">{issue.location.address}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <FiClock size={10} />
            <span>{formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
          </div>
          <button
            onClick={() => user ? vote() : toast.error('Login to vote')}
            disabled={isPending || issue.status === 'resolved'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
              issue.user_voted
                ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-transparent'
            }`}>
            <FiThumbsUp size={13} />
            {issue.upvotes_count || 0}
          </button>
        </div>
      </div>
    </div>
  );
}
