import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client.js';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.success) {
        setSuccess(true);
        if (res.resetToken) {
          setResetToken(res.resetToken);
        }
      } else {
        setError(res.message || 'Failed to dispatch reset request');
      }
    } catch (err) {
      setError((err as Error).message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 space-y-6">
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-xs text-oasis-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      <div className="p-8 rounded-3xl bg-oasis-card border border-oasis-border shadow-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-xs text-oasis-muted leading-relaxed">
            Enter your registered email address and we'll send you instructions to set a new password.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Check Your Inbox</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a password recovery link has been sent.
            </p>

            {resetToken && (
              <div className="pt-2">
                <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="w-full py-2.5 rounded-xl bg-oasis-amber text-oasis-dark font-bold text-xs inline-flex items-center justify-center gap-1.5"
                >
                  Simulate Password Reset Click
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Your Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-oasis-red hover:bg-oasis-red-hover disabled:bg-slate-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
