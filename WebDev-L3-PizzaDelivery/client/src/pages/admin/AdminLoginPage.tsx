import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../api/client.js';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide administrator credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token && res.user) {
        if (res.user.role !== 'admin') {
          setError('Access Denied: This account does not possess administrator privileges.');
          return;
        }

        login(res.token, res.user);
        showToast(`Administrator authenticated: Welcome, ${res.user.name}`, 'success');
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Authentication failed');
      }
    } catch (err) {
      setError((err as Error).message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminDemo = () => {
    setEmail('admin@oasispizza.com');
    setPassword('AdminPassword@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF8EF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#D92D20] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#D97706] to-[#B45309] text-white flex items-center justify-center mx-auto shadow-glow-amber">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-black text-[#38251F]">Admin Command Portal</h1>
        <p className="text-xs text-[#765747] font-medium max-w-xs mx-auto">
          Authorized personnel only. Access live kitchen queues, inventory stocks, and low-stock monitors.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#FFFCF7] py-8 px-6 sm:px-10 rounded-3xl border border-[#F2E8DC] shadow-warm-lg space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#D92D20]/30 text-[#D92D20] text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Quick Fill Box */}
          <div className="p-3.5 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] flex items-center justify-between">
            <span className="text-xs font-bold text-[#765747] flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#D97706]" />
              Evaluation Demo Key
            </span>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="px-3 py-1.5 rounded-xl bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] text-xs font-bold transition-colors shadow-sm"
            >
              Fill Admin Creds
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@oasispizza.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">Secret Passcode</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-sm shadow-glow-amber transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Authenticate Admin
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#F2E8DC] text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#765747] hover:text-[#38251F] font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Pizzeria Customer Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

