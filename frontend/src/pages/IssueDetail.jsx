import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiThumbsUp, FiMapPin, FiClock, FiUser, FiAlertTriangle } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';

const STATUS_CONFIG = {
  reported:    { label: 'Reported',    color: 'bg-red-900/30 text-red-400 border-red-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-900/30 text-yellow-400 border-yellow-800' },
  resolved:    { label: 'Resolved',    color: 'bg-emerald-900/30 text-emerald-400 border-emerald-800' },
};

const ISSUE_EMOJIS = { pothole: '🕳️', garbage_dump: '🗑️', broken_streetlight: '💡', water_leakage: '💧', open_manhole: '⚠️' };

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => api.get(`/issues/${id}`).then(r => r.data)
  });

  const { mutate: toggleVote, isPending: voting } = useMutation({
    mutationFn: () =>
      data.issue.user_voted
        ? api.delete(`/votes/${id}`)
        : api.post(`/votes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['issue', id]);
      toast.success(data.issue.user_voted ? 'Vote removed' : 'Upvoted! 👍');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Vote failed')
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
    </div>
  );

  if (error || !data?.issue) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Issue not found.</p>
      <button onClick={() => navigate(-1)} className="text-emerald-400 mt-4">← Go back</button>
    </div>
  );

  const issue = data.issue;
  const statusCfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;
  const coords = issue.location?.coordinates;

  const severityColor = issue.severity_score >= 7 ? 'text-red-400' : issue.severity_score >= 4 ? 'text-yellow-400' : 'text-emerald-400';
  const severityBg = issue.severity_score >= 7 ? 'from-red-900/30' : issue.severity_score >= 4 ? 'from-yellow-900/30' : 'from-emerald-900/30';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <FiArrowLeft /> Back
      </button>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          {/* Images */}
          {issue.images?.length > 0 && (
            <div className={`grid gap-2 ${issue.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {issue.images.map((img, i) => (
                <img key={i} src={img.url} alt="" className="w-full h-56 object-cover rounded-xl" />
              ))}
            </div>
          )}

          {/* Issue header */}
          <div>
            <div className="flex items-start gap-3 flex-wrap">
              <span className={`text-xs border rounded-full px-3 py-1 font-medium ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
              <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 rounded-full px-3 py-1">
                {ISSUE_EMOJIS[issue.issue_type]} {issue.issue_type?.replace('_', ' ')}
              </span>
              {issue.is_verified && (
                <span className="text-xs bg-blue-900/30 text-blue-400 border border-blue-800 rounded-full px-3 py-1">
                  🤖 AI Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mt-3">{issue.title}</h1>
            {issue.description && <p className="text-gray-400 mt-2 leading-relaxed">{issue.description}</p>}
          </div>

          {/* Reporter + date */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <FiUser size={14} />
            <span>{issue.reporter_id?.name || 'Anonymous'}</span>
            <span className="text-gray-700">·</span>
            <FiClock size={14} />
            <span>{issue.created_at ? format(new Date(issue.created_at), 'MMM d, yyyy') : ''}</span>
          </div>

          {/* AI Analysis */}
          {issue.ai_analysis && (
            <div className={`bg-gradient-to-r ${severityBg} to-transparent border border-gray-800 rounded-xl p-5`}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                🤖 AI Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Detected Type</p>
                  <p className="text-white font-medium capitalize">{issue.ai_analysis.detected_type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Confidence</p>
                  <p className="text-white font-medium">{Math.round((issue.ai_analysis.confidence || 0) * 100)}%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs mb-2">Severity Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-800 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${issue.severity_score >= 7 ? 'bg-red-500' : issue.severity_score >= 4 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                        style={{ width: `${((issue.severity_score || 0) / 10) * 100}%` }}
                      />
                    </div>
                    <span className={`font-bold text-lg ${severityColor}`}>{issue.severity_score?.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status History */}
          {issue.status_history?.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Status History</h3>
              <div className="space-y-3">
                {issue.status_history.map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                      {i < issue.status_history.length - 1 && <div className="w-0.5 h-8 bg-gray-800 mt-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-white text-sm font-medium capitalize">{h.to_status?.replace('_', ' ')}</p>
                      <p className="text-gray-500 text-xs">{h.changed_by?.name} · {h.created_at ? format(new Date(h.created_at), 'MMM d, h:mm a') : ''}</p>
                      {h.note && <p className="text-gray-400 text-xs mt-1">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-2 space-y-4">
          {/* Vote card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
            <p className="text-gray-400 text-sm mb-3">Community Votes</p>
            <p className="text-5xl font-black text-white mb-4">{issue.upvotes_count || 0}</p>
            {user && user._id !== issue.reporter_id?._id && issue.status !== 'resolved' && (
              <button
                onClick={() => toggleVote()}
                disabled={voting}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                  issue.user_voted
                    ? 'bg-emerald-900/40 border border-emerald-700 text-emerald-400 hover:bg-red-900/30 hover:border-red-700 hover:text-red-400'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}>
                <FiThumbsUp size={18} />
                {issue.user_voted ? 'Remove Vote' : 'Upvote This Issue'}
              </button>
            )}
            {!user && (
              <a href="/login" className="block text-emerald-400 text-sm hover:underline">Login to vote</a>
            )}
          </div>

          {/* Priority Score */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">Priority Score</p>
            <p className="text-3xl font-bold text-white">{issue.priority_score?.toFixed(1) || '0.0'}</p>
            <p className="text-gray-600 text-xs mt-1">severity×0.6 + votes×0.4</p>
          </div>

          {/* Location mini-map */}
          {coords && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="h-40">
                <MapContainer
                  center={[coords[1], coords[0]]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[coords[1], coords[0]]} />
                </MapContainer>
              </div>
              <div className="p-3 flex items-center gap-2 text-gray-400 text-xs">
                <FiMapPin size={12} />
                <span>{issue.location?.address || `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`}</span>
              </div>
            </div>
          )}

          {/* Duplicate warning */}
          {issue.is_duplicate && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 flex gap-3">
              <FiAlertTriangle className="text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-yellow-400 text-sm font-medium">Possible Duplicate</p>
                <p className="text-gray-400 text-xs mt-1">A similar issue was reported nearby. Please upvote the original.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
