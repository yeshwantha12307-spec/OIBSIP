import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../api/client.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      if (res.success) {
        setRegisteredSuccess(true);
        if (res.verificationToken) {
          setVerificationToken(res.verificationToken);
        }
        if (res.token && res.user) {
          login(res.token, res.user);
        }
        showToast('Registration successful! Please verify your email.', 'success');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-oasis-red/20 text-oasis-red flex items-center justify-center mx-auto text-2xl shadow-glow-red">
          🍕
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">Join Oasis Pizza</h1>
        <p className="text-sm text-oasis-muted">
          Create an account to craft custom artisan pizzas and track live orders.
        </p>
      </div>

      {registeredSuccess ? (
        <div className="p-8 rounded-3xl bg-oasis-card border border-oasis-border shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">Verification Link Sent!</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We have dispatched a verification email to <strong className="text-white">{email}</strong>. Please click the link inside to verify your account.
          </p>

          {/* Development fast-track helper button */}
          {verificationToken && (
            <div className="pt-2">
              <Link
                to={`/verify-email?token=${verificationToken}`}
                className="w-full py-3 rounded-xl bg-oasis-amber text-oasis-dark font-bold text-xs inline-flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors"
              >
                Simulate Email Verification Click
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-oasis-border/60">
            <Link
              to="/menu"
              className="px-6 py-2.5 rounded-xl bg-oasis-red text-white text-sm font-semibold hover:bg-oasis-red-hover transition-colors inline-block"
            >
              Start Browsing Menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-oasis-card border border-oasis-border shadow-2xl space-y-5">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-oasis-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Leonardo Bianchi"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-oasis-dark border border-oasis-border text-white text-sm focus:outline-none focus:border-oasis-red transition-colors"
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-oasis-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-oasis-dark border border-oasis-border text-white text-sm focus:outline-none focus:border-oasis-red transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-oasis-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
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
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-oasis-border/60 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-oasis-amber hover:text-white font-bold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
