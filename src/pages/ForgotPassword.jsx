import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send a password reset link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl">
        <h1 className="text-2xl font-bold text-center mb-2">Forgot Password?</h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {message ? (
          <div role="status" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-lg">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 font-semibold py-3 rounded-xl transition"
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-xs text-center text-slate-400 mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
