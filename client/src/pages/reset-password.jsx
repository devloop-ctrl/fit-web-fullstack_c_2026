// ============================================================
// Route: /reset-password
// Reset password page. Steps: type email -> server sends instructions -> back to login
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../features/UserSlice';
import { addToast } from '../features/FitnessSlice';

// ------------------------------------------------------------
// 2. ResetPassword component
// ------------------------------------------------------------
const ResetPassword = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.user.isLoading);

  // --- Form state ---
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // --- Functions ---

  // Runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Step 1: ask the server to send the instructions
      const message = await dispatch(resetPassword(email.trim())).unwrap();

      // Step 2: show the server message and go back to login
      dispatch(addToast(message));
      navigate('/login');
    } catch (message) {
      setError(message || 'Reset failed');
    }
  };

  // --- Render ---
  return (
    <div className="max-w-sm mx-auto my-8 flat-box overflow-hidden">
      {/* ---------------- Title ---------------- */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h1 className="font-bold text-sm text-slate-900">Reset Password</h1>
        <p className="text-[11px] text-slate-500">Enter your email to receive a recovery link</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        {/* ---------------- Error message ---------------- */}
        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            <i className="fa-solid fa-circle-exclamation text-red-500 mr-2"></i>{error}
          </div>
        )}

        {/* ---------------- Email ---------------- */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-xs flat-input"
          />
        </div>

        {/* ---------------- Submit ---------------- */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn cursor-pointer"
        >
          {isLoading ? 'Sending...' : 'Send Reset Instructions'}
        </button>

        {/* ---------------- Link to login ---------------- */}
        <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
          Remember password?
          <Link to="/login" className="text-slate-900 font-semibold underline ml-1">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
