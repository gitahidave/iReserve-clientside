import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('This password reset link is invalid. Request a new one to continue.');
      return;
    }

    if (password.length < 6) {
      setError('Your password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await resetPassword(token, password);
      setMessage(response.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset your password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          Choose a new password for your iReserve account.
        </p>

        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {message ? (
          <div role="status" className="text-center">
            <p className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-lg">
              {message}
            </p>
            <Link to="/login" className="inline-block text-sm text-blue-400 hover:underline mt-5">
              Log In
            </Link>
          </div>
        ) : token ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-400 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 font-semibold py-3 rounded-xl transition"
            >
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-5">
              This password reset link is invalid or missing its token.
            </p>
            <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">
              Request a new reset link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
