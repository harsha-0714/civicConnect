import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';

const PASSWORD_RULES = [
  { test: (p) => p.length >= 6, label: 'At least 6 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'One number' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const failed = PASSWORD_RULES.find(r => !r.test(form.password));
    if (failed) return toast.error(failed.label);

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to CivicConnect 🎉');
      navigate('/map');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-emerald-900/40 border border-emerald-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌆</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-gray-400 mt-1">Join the community fixing cities together</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Harsha Kumar"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 chars, 1 uppercase, 1 number"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {/* Password strength indicators */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  {PASSWORD_RULES.map(({ test, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <FiCheck size={12} className={test(form.password) ? 'text-emerald-400' : 'text-gray-600'} />
                      <span className={`text-xs ${test(form.password) ? 'text-emerald-400' : 'text-gray-600'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-4">
              <p className="text-emerald-400 text-xs font-medium mb-1">🎁 Welcome Bonus</p>
              <p className="text-gray-400 text-xs">Create your account and earn <strong className="text-white">10 points</strong> on your first report!</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
