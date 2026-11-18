import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../features/UserSlice';
import { addToast } from '../features/FitnessSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.user.isLoading);

  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '', repassword: '' });
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1: Validate matching passwords -> Step 2: Create user in DB -> Step 3: Enter member dashboard
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.repassword) return setError('Passwords do not match.');

    try {
      const user = await dispatch(register({
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password
      })).unwrap();
      dispatch(addToast(`Account registered successfully! Welcome, ${user.name || user.username}.`));
      navigate('/calculators', { replace: true });
    } catch (msg) {
      setError(msg || 'Registration failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto my-8 flat-box overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h1 className="font-bold text-sm text-slate-900">Create New Account</h1>
        <p className="text-[11px] text-slate-500">Join FitPulse with your personal details</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-2.5">
        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            <i className="fa-solid fa-circle-exclamation text-red-500 mr-2"></i>{error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
          <input name="username" type="text" required value={form.username} onChange={onChange} className="w-full px-3 py-2 text-xs flat-input" />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
          <input name="email" type="email" required value={form.email} onChange={onChange} className="w-full px-3 py-2 text-xs flat-input" />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
          <input name="phone" type="tel" required value={form.phone} onChange={onChange} className="w-full px-3 py-2 text-xs flat-input" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input name="password" type="password" required value={form.password} onChange={onChange} className="w-full px-3 py-2 text-xs flat-input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Repeat Password</label>
            <input name="repassword" type="password" required value={form.repassword} onChange={onChange} className="w-full px-3 py-2 text-xs flat-input" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn cursor-pointer"
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>

        <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
          Already have an account?
          <Link to="/login" className="text-slate-900 font-semibold underline ml-1">Log in</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;

