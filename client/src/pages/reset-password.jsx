import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../features/UserSlice';
import { addToast } from '../features/FitnessSlice';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.user.isLoading);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const message = await dispatch(resetPassword(email.trim())).unwrap();
      dispatch(addToast(message));
      navigate('/login');
    } catch (msg) {
      setError(msg || 'Reset failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto my-8 flat-box overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h1 className="font-bold text-sm text-slate-900">Reset Password</h1>
        <p className="text-[11px] text-slate-500">Enter your email to receive a recovery link</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            <i className="fa-solid fa-circle-exclamation text-red-500 mr-2"></i>{error}
          </div>
        )}

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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn cursor-pointer"
        >
          {isLoading ? 'Sending...' : 'Send Reset Instructions'}
        </button>

        <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
          Remember password?
          <Link to="/login" className="text-slate-900 font-semibold underline ml-1">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;

