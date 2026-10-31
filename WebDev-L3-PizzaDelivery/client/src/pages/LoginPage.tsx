import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Shield } from 'lucide-react';
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
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#D92D20] to-[#A91F18] text-white flex items-center justify-center mx-auto text-3xl shadow-glow-red">
          🍕
        </div>
        <h1 className="font-serif text-3xl font-black text-[#38251F]">Sign In to Oasis Pizza</h1>
        <p className="text-sm text-[#765747]">
          Access your artisan pizza orders, custom presets, and fast checkout.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#D92D20]/30 text-[#D92D20] text-xs flex items-center gap-3 shadow-warm-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Demo Credentials Quick Fill Box */}
      <div className="p-4 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] space-y-3 shadow-warm-sm">
        <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider block">
          ⚡ Evaluation Quick Fill
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={fillCustomerDemo}
            className="p-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] hover:bg-[#F2E8DC] text-[#38251F] transition-all flex items-center justify-center gap-1.5 font-bold shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#D92D20]" />
            Customer Demo
          </button>
          <button
            type="button"
            onClick={fillAdminDemo}
            className="p-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] hover:bg-[#F2E8DC] text-[#38251F] transition-all flex items-center justify-center gap-1.5 font-bold shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
            Admin Demo
          </button>
        </div>
      </div>

      {/* Main Login Form */}
      <div className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#38251F]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#38251F]">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#D92D20] hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-extrabold text-sm shadow-glow-red transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In to Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#F2E8DC] text-center space-y-3">
          <p className="text-xs text-[#765747]">
            Don't have an Oasis Pizza account?{' '}
            <Link to="/register" className="text-[#D92D20] font-bold hover:underline">
              Join here
            </Link>
          </p>

          <p className="text-xs text-[#765747]">
            Are you a restaurant manager?{' '}
            <Link to="/admin/login" className="text-[#D97706] font-bold hover:underline inline-flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Admin Portal Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
