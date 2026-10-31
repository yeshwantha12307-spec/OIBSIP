import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.js';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Password reset token is missing from URL.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (res.success) {
        setSuccess(true);
        showToast('Password reset successful! You can now log in.', 'success');
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (err) {
      setError((err as Error).message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-black text-[#38251F]">Set New Password</h1>
          <p className="text-xs text-[#765747]">
            Please enter your new secure password below to regain access.
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
            <h3 className="font-serif text-2xl font-bold text-[#38251F]">Password Updated!</h3>
            <p className="text-xs text-[#765747]">
              Your password has been changed securely. You can now log into your account.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-3.5 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-glow-red transition-all"
              >
                Sign In Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">New Password (min. 6 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Update Password
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
