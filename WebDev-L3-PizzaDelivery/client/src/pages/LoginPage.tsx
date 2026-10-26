import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../api/client.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        showToast(`Welcome back, ${res.user.name}! 🍕`, 'success');
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError((err as Error).message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillCustomerDemo = () => {
    setEmail('customer@oasispizza.com');
    setPassword('CustomerPassword@123');
    setError(null);
  };

  const fillAdminDemo = () => {
    setEmail('admin@oasispizza.com');
    setPassword('AdminPassword@123');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-oasis-red/20 text-oasis-red flex items-center justify-center mx-auto text-2xl shadow-glow-red">
          🍕
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">Sign In to Oasis Pizza</h1>
        <p className="text-sm text-oasis-muted">
          Access your artisan pizza orders, custom presets, and fast checkout.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Demo Credentials Quick Fill Box */}
      <div className="p-4 rounded-2xl bg-oasis-card border border-oasis-border/80 space-y-3">
        <span className="text-[11px] font-bold text-oasis-amber uppercase tracking-wider block">
          ⚡ Evaluation Quick Fill
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={fillCustomerDemo}
            className="p-2.5 rounded-xl border border-oasis-border bg-oasis-dark/80 hover:bg-oasis-dark text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 font-medium"
          >
            <UserCheck className="w-3.5 h-3.5 text-oasis-amber" />
            Customer Demo
          </button>
          <button
            type="button"
            onClick={fillAdminDemo}
            className="p-2.5 rounded-xl border border-oasis-border bg-oasis-dark/80 hover:bg-oasis-dark text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-oasis-red" />
            Admin Demo
          </button>
        </div>
      </div>

      {/* Login Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-oasis-card border border-oasis-border shadow-2xl space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-oasis-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-oasis-dark border border-oasis-border text-white text-sm focus:outline-none focus:border-oasis-red transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-oasis-amber hover:text-white transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-oasis-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-oasis-dark border border-oasis-border text-white text-sm focus:outline-none focus:border-oasis-red transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-oasis-red hover:bg-oasis-red-hover disabled:bg-slate-700 text-white font-bold text-sm shadow-glow-red hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 pt-3"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-oasis-border/60 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-oasis-amber hover:text-white font-bold transition-colors">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
