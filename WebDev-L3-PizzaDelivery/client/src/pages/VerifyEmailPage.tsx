import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../api/client.js';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setVerified(false);
      setMessage('Missing verification token in link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        if (res.success) {
          setVerified(true);
          setMessage(res.message || 'Email successfully verified!');
        } else {
          setVerified(false);
          setMessage(res.message || 'Verification token is invalid or has expired.');
        }
      } catch (err) {
        setVerified(false);
        setMessage((err as Error).message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="max-w-md mx-auto my-20 px-4">
      <div className="p-8 rounded-3xl bg-oasis-card border border-oasis-border shadow-2xl text-center space-y-5">
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="w-12 h-12 border-4 border-oasis-amber border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="font-serif text-2xl font-bold text-white">Verifying Your Email...</h2>
            <p className="text-xs text-oasis-muted">Securing your Oasis Pizza account credentials.</p>
          </div>
        ) : verified ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Account Verified!</h2>
            <p className="text-sm text-slate-300">{message}</p>
            <div className="pt-4 border-t border-oasis-border/60">
              <Link
                to="/menu"
                className="w-full py-3.5 rounded-xl bg-oasis-red hover:bg-oasis-red-hover text-white font-bold text-sm shadow-md transition-all inline-flex items-center justify-center gap-2"
              >
                Start Ordering Pizzas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-sm text-rose-300">{message}</p>
            <div className="pt-4 border-t border-oasis-border/60 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-oasis-dark border border-oasis-border text-white text-xs font-semibold hover:bg-white/5 transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
