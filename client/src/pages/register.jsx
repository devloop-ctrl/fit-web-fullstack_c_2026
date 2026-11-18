// ============================================================
// Route: /register
// Register page. Steps: type details -> check passwords -> create account -> go to dashboard
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../features/UserSlice';
import { addToast } from '../features/FitnessSlice';

// ------------------------------------------------------------
// 2. Constants
// ------------------------------------------------------------
const EMPTY_FORM = { username: '', email: '', phone: '', password: '', repassword: '' };

// ------------------------------------------------------------
// 3. Register component
// ------------------------------------------------------------
const Register = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.user.isLoading);

  // --- Form state ---
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  // --- Functions ---

  // Update one field of the form when the user types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Step 1: both passwords must match
    if (form.password !== form.repassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Step 2: create the account in the database
      const user = await dispatch(
        register({
          username: form.username.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password
        })
      ).unwrap();

      // Step 3: welcome the user and open the member dashboard
      dispatch(addToast(`Account registered successfully! Welcome, ${user.name || user.username}.`));
      navigate('/calculators', { replace: true });
    } catch (message) {
      setError(message || 'Registration failed');
    }
  };

  // --- Render ---
  return (
    <div className="max-w-sm mx-auto my-8 flat-box overflow-hidden">
      {/* ---------------- Title ---------------- */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h1 className="font-bold text-sm text-slate-900">Create New Account</h1>
        <p className="text-[11px] text-slate-500">Join FitPulse with your personal details</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-2.5">
        {/* ---------------- Error message ---------------- */}
        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            <i className="fa-solid fa-circle-exclamation text-red-500 mr-2"></i>{error}
          </div>
        )}

        {/* ---------------- Username ---------------- */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
          <input name="username" type="text" required value={form.username} onChange={handleChange} className="w-full px-3 py-2 text-xs flat-input" />
        </div>

        {/* ---------------- Email ---------------- */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
          <input name="email" type="email" required value={form.email} onChange={handleChange} className="w-full px-3 py-2 text-xs flat-input" />
        </div>

        {/* ---------------- Phone ---------------- */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
          <input name="phone" type="tel" required value={form.phone} onChange={handleChange} className="w-full px-3 py-2 text-xs flat-input" />
        </div>

        {/* ---------------- Passwords ---------------- */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input name="password" type="password" required value={form.password} onChange={handleChange} className="w-full px-3 py-2 text-xs flat-input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Repeat Password</label>
            <input name="repassword" type="password" required value={form.repassword} onChange={handleChange} className="w-full px-3 py-2 text-xs flat-input" />
          </div>
        </div>

        {/* ---------------- Submit ---------------- */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn cursor-pointer"
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>

        {/* ---------------- Link to login ---------------- */}
        <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
          Already have an account?
          <Link to="/login" className="text-slate-900 font-semibold underline ml-1">Log in</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
