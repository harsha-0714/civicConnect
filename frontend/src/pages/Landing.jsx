import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiMap, FiAward, FiZap, FiShield, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { RiCommunityLine } from 'react-icons/ri';
import api from '../api/axios';

const ISSUE_TYPES = [
  { emoji: '🕳️', label: 'Potholes', color: 'from-amber-900/30 to-amber-900/10 border-amber-800' },
  { emoji: '🗑️', label: 'Garbage Dumps', color: 'from-red-900/30 to-red-900/10 border-red-800' },
  { emoji: '💡', label: 'Broken Streetlights', color: 'from-yellow-900/30 to-yellow-900/10 border-yellow-800' },
  { emoji: '💧', label: 'Water Leakage', color: 'from-blue-900/30 to-blue-900/10 border-blue-800' },
  { emoji: '⚠️', label: 'Open Manholes', color: 'from-orange-900/30 to-orange-900/10 border-orange-800' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Snap a Photo', desc: 'Take or upload a photo of the civic issue you spotted in your neighborhood.', icon: '📸' },
  { step: '02', title: 'AI Analyzes', desc: 'Our YOLOv11 AI detects the issue type and calculates a severity score in seconds.', icon: '🤖' },
  { step: '03', title: 'Pin the Location', desc: 'Mark the exact spot on the map or let GPS do it automatically.', icon: '📍' },
  { step: '04', title: 'Community Votes', desc: 'Neighbors upvote issues. Priority score rises. Authorities act faster.', icon: '⬆️' },
];

export default function Landing() {
  const { data: statsData } = useQuery({
    queryKey: ['publicStats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    staleTime: 1000 * 60 * 5
  });
  const stats = statsData?.stats || {};

  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-800 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">AI-Powered Civic Engagement</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight">
            Report. Vote. <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Fix Your City.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            CivicConnect AI empowers citizens to report potholes, garbage dumps, and broken infrastructure — 
            with AI that detects, prioritizes, and tracks every issue until it's resolved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/report"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-900/50">
              Report an Issue <FiArrowRight />
            </Link>
            <Link to="/map"
              className="flex items-center gap-2 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-medium text-lg transition-all">
              <FiMap /> View Live Map
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Issues Reported', value: stats.total_issues || '—' },
              { label: 'Resolved', value: stats.resolved_issues || '—' },
              { label: 'Active Issues', value: stats.active_issues || '—' },
              { label: 'Resolution Rate', value: stats.resolution_rate ? `${stats.resolution_rate}%` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-gray-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Issue Types ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">What Can You Report?</h2>
          <p className="text-gray-400">Our AI recognizes 5 categories of civic infrastructure issues.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {ISSUE_TYPES.map(({ emoji, label, color }) => (
            <div key={label} className={`bg-gradient-to-b ${color} border rounded-2xl p-5 text-center hover:scale-105 transition-transform cursor-default`}>
              <div className="text-4xl mb-3">{emoji}</div>
              <p className="text-white font-medium text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-gray-900/50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-gray-400">From photo to fixed — in 4 simple steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, icon }) => (
              <div key={step} className="relative">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-full hover:border-emerald-800 transition-colors">
                  <span className="text-5xl font-black text-gray-800 absolute top-4 right-5">{step}</span>
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
                {/* Connector arrow */}
                {step !== '04' && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <FiArrowRight className="text-gray-600" size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Why CivicConnect AI?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: FiZap,
              title: 'AI-Powered Detection',
              desc: 'YOLOv11 identifies issue type and severity automatically. No manual classification needed.',
              color: 'text-yellow-400 bg-yellow-900/20 border-yellow-800'
            },
            {
              icon: FiUsers,
              title: 'Community Upvoting',
              desc: 'Democratic prioritization — the community decides which issues need urgent attention.',
              color: 'text-blue-400 bg-blue-900/20 border-blue-800'
            },
            {
              icon: FiTrendingUp,
              title: 'Smart Priority Score',
              desc: 'Severity × 0.6 + Upvotes × 0.4 — a formula that balances danger with community impact.',
              color: 'text-purple-400 bg-purple-900/20 border-purple-800'
            },
            {
              icon: FiMap,
              title: 'Live Issue Map',
              desc: 'See all issues in your area on an interactive Leaflet map with severity-coded markers.',
              color: 'text-emerald-400 bg-emerald-900/20 border-emerald-800'
            },
            {
              icon: FiAward,
              title: 'Civic Karma Rewards',
              desc: 'Earn points for every valid report. Rise from Bronze to Platinum Citizen.',
              color: 'text-orange-400 bg-orange-900/20 border-orange-800'
            },
            {
              icon: FiShield,
              title: 'Duplicate Detection',
              desc: 'AI checks 50m radius for existing reports — preventing fragmented votes on the same issue.',
              color: 'text-red-400 bg-red-900/20 border-red-800'
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={`border rounded-2xl p-6 ${color.split(' ').slice(1).join(' ')}`}>
              <div className={`inline-flex p-2 rounded-xl border mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-b from-emerald-900/20 to-gray-950 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <RiCommunityLine className="text-emerald-400 text-5xl mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-white mb-4">Ready to make a difference?</h2>
          <p className="text-gray-400 mb-8">Join thousands of citizens building better communities, one report at a time.</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105">
            Get Started Free <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
