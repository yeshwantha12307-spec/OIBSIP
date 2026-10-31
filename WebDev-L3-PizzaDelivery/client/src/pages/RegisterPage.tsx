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
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#D92D20] to-[#A91F18] text-white flex items-center justify-center mx-auto text-3xl shadow-glow-red">
          🍕
        </div>
        <h1 className="font-serif text-3xl font-black text-[#38251F]">Join Oasis Pizza</h1>
        <p className="text-sm text-[#765747]">
          Create an account to craft custom artisan pizzas and track live orders.
        </p>
      </div>

      {registeredSuccess ? (
        <div className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EBF7EE] text-[#198754] border border-[#198754]/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#38251F]">Verification Link Sent!</h2>
          <p className="text-sm text-[#765747] leading-relaxed">
            We have dispatched a verification email to <strong className="text-[#38251F]">{email}</strong>. Please click the link inside to verify your account.
          </p>

          {/* Development fast-track helper button */}
          {verificationToken && (
            <div className="pt-2">
              <Link
                to={`/verify-email?token=${verificationToken}`}
                className="w-full py-3.5 rounded-2xl bg-[#FEF3C7] text-[#D97706] font-bold text-xs inline-flex items-center justify-center gap-2 hover:bg-[#FDE68A] transition-colors shadow-sm"
              >
                Simulate Email Verification Click
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-[#F2E8DC]">
            <Link
              to="/menu"
              className="w-full py-3.5 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-bold text-sm shadow-glow-red inline-flex items-center justify-center gap-2 transition-all"
            >
              Start Ordering Pizzas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#D92D20]/30 text-[#D92D20] text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">Your Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sophia Rossi"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
                />
              </div>
            </div>

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
              <label className="text-xs font-bold text-[#38251F]">Create Password (min. 6 characters)</label>
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">Confirm Password</label>
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
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#F2E8DC] text-center">
            <p className="text-xs text-[#765747]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#D92D20] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
