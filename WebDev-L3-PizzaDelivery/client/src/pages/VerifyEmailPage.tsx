import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../api/client.js';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setVerified(false);
      setMessage('Missing verification token in link.');
      return;
    }

    if (hasRequested.current) return;
    hasRequested.current = true;

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
      <div className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md text-center space-y-5">
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="w-12 h-12 border-4 border-[#D97706] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="font-serif text-2xl font-bold text-[#38251F]">Verifying Your Email...</h2>
            <p className="text-xs text-[#765747]">Securing your Oasis Pizza account credentials.</p>
          </div>
        ) : verified ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#EBF7EE] text-[#198754] border border-[#198754]/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#38251F]">Account Verified!</h2>
            <p className="text-sm text-[#765747]">{message}</p>
            <div className="pt-4 border-t border-[#F2E8DC]">
              <Link
                to="/menu"
                className="w-full py-3.5 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-bold text-sm shadow-glow-red transition-all inline-flex items-center justify-center gap-2"
              >
                Start Ordering Pizzas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FDF2F2] text-[#D92D20] border border-[#D92D20]/30 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#38251F]">Verification Failed</h2>
            <p className="text-sm text-[#D92D20] font-medium">{message}</p>
            <div className="pt-4 border-t border-[#F2E8DC] flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full py-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-[#38251F] text-xs font-bold hover:bg-[#F2E8DC] transition-colors"
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
