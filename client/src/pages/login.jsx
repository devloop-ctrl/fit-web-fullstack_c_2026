import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../features/UserSlice';
import { addToast } from '../features/FitnessSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.user.isLoading);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Step 1: Submit credentials -> Step 2: Verify via Redux thunk -> Step 3: Route by role
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await dispatch(login({ username: username.trim(), password })).unwrap();
      dispatch(addToast(`Welcome back, ${user.name || user.username}!`));
      navigate(user.role === 'Admin' ? '/admin' : '/calculators', { replace: true });
    } catch (msg) {
      setError(msg || 'Invalid credentials');
    }
  };

  return (
    <div className="max-w-sm mx-auto my-8 flat-box overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h1 className="font-bold text-sm text-slate-900">Account Login</h1>
        <p className="text-[11px] text-slate-500">Enter username or email and password to log in</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            <i className="fa-solid fa-circle-exclamation text-red-500 mr-2"></i>{error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Username or Email</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 text-xs flat-input"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-xs flat-input"
          />
        </div>

        <div>
          <Link to="/reset-password" className="text-[11px] text-slate-500 hover:text-slate-900">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn cursor-pointer"
        >
          {isLoading ? 'Authenticating...' : 'Log In'}
        </button>

        <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
          Don&apos;t have an account?
          <Link to="/register" className="text-slate-900 font-semibold underline ml-1">Register</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;

