import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import api from '../api/axios';
import 'leaflet/dist/leaflet.css';

const ISSUE_ICONS = {
  pothole: '🕳️', garbage_dump: '🗑️', broken_streetlight: '💡', water_leakage: '💧', open_manhole: '⚠️'
};

function createCustomIcon(type, severity) {
  const color = severity >= 7 ? '#ef4444' : severity >= 4 ? '#f59e0b' : '#10b981';
  return L.divIcon({
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${ISSUE_ICONS[type] || '📍'}</div>`,
    iconSize: [32, 32],
    className: ''
  });
}

export default function IssueMap() {
  const [filters, setFilters] = useState({ type: '', status: '' });
  const { data } = useQuery({
    queryKey: ['mapData'],
    queryFn: () => api.get('/dashboard/map-data').then(r => r.data)
  });

  const issues = (data?.issues || []).filter(issue => {
    if (filters.type && issue.issue_type !== filters.type) return false;
    if (filters.status && issue.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Filters */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-gray-400 text-sm">{issues.length} issues</span>
        <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm px-3 py-1.5 rounded-lg">
          <option value="">All Types</option>
          {Object.entries(ISSUE_ICONS).map(([val, emoji]) => (
            <option key={val} value={val}>{emoji} {val.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm px-3 py-1.5 rounded-lg">
          <option value="">All Statuses</option>
          <option value="reported">Reported</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <div className="flex items-center gap-3 ml-auto text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/> High Severity</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"/> Medium</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/> Low</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {issues.map(issue => (
            issue.location?.coordinates && (
              <Marker
                key={issue._id}
                position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                icon={createCustomIcon(issue.issue_type, issue.severity_score)}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    {issue.images?.[0] && (
                      <img src={issue.images[0].thumbnail_url || issue.images[0].url} className="w-full h-24 object-cover rounded mb-2" />
                    )}
                    <h4 className="font-semibold text-sm mb-1">{issue.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span>{ISSUE_ICONS[issue.issue_type]} {issue.issue_type?.replace('_', ' ')}</span>
                      <span>·</span>
                      <span className={issue.status === 'resolved' ? 'text-green-600' : issue.status === 'in_progress' ? 'text-yellow-600' : 'text-red-600'}>
                        {issue.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span>⬆️ {issue.upvotes_count} upvotes</span>
                      <span>⚡ {issue.severity_score?.toFixed(1)}/10 severity</span>
                    </div>
                    <a href={`/issues/${issue._id}`} className="block text-center bg-emerald-500 text-white py-1.5 rounded text-xs font-medium">
                      View Details →
                    </a>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
