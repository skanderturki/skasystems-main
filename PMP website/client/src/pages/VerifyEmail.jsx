import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyEmail, resendVerification } from '../api/authApi';
import { GraduationCap, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      return toast.error('Please enter the 6-digit code');
    }
    setLoading(true);
    try {
      const res = await verifyEmail(code);
      setUser({ ...user, isVerified: true });
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      toast.success('New verification code sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Verify your email</h1>
          <p className="text-gray-600 mt-2">
            We sent a 6-digit code to<br />
            <span className="font-medium text-gray-900">{user?.email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <Mail className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">Check your inbox for the verification code. It expires in 10 minutes.</p>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
            >
              {resending ? 'Sending...' : "Didn't receive the code? Resend"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
