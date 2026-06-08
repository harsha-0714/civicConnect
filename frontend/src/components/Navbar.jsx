import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMap, FiBarChart2, FiAward, FiUser, FiLogOut, FiPlus } from 'react-icons/fi';
import { RiCommunityLine } from 'react-icons/ri';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <RiCommunityLine className="text-white text-lg" />
            </div>
            <span className="text-white font-bold text-lg">CivicConnect <span className="text-emerald-400">AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/map', icon: FiMap, label: 'Map' },
              { to: '/dashboard', icon: FiBarChart2, label: 'Dashboard' },
              { to: '/leaderboard', icon: FiAward, label: 'Leaderboard' },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'text-emerald-400 bg-emerald-900/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}>
                <Icon size={16} />{label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/report"
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <FiPlus size={16} />Report Issue
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-sm font-medium">{user.points}pts</span>
                  <Link to="/profile" className="text-gray-400 hover:text-white transition-colors"><FiUser size={20} /></Link>
                  <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors"><FiLogOut size={20} /></button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-400 hover:text-white px-3 py-2 text-sm">Login</Link>
                <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
