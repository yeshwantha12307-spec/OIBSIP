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
        className="inline-flex items-center gap-2 text-xs font-bold text-[#765747] hover:text-[#38251F] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      <div className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-black text-[#38251F]">Reset Password</h1>
          <p className="text-xs text-[#765747] leading-relaxed">
            Enter your registered email address and we'll send you instructions to set a new password.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#D92D20]/30 text-[#D92D20] text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#EBF7EE] text-[#198754] border border-[#198754]/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#38251F]">Reset Link Dispatched!</h3>
            <p className="text-xs text-[#765747] leading-relaxed">
              If an account with <strong className="text-[#38251F]">{email}</strong> exists, password reset instructions have been dispatched.
            </p>

            {resetToken && (
              <div className="pt-2">
                <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="w-full py-3.5 rounded-2xl bg-[#FEF3C7] text-[#D97706] font-bold text-xs inline-flex items-center justify-center gap-2 hover:bg-[#FDE68A] transition-colors shadow-sm"
                >
                  Simulate Password Reset Email Click
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">Registered Email Address</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-extrabold text-sm shadow-glow-red transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
