// ============================================================
// Route: /profile
// Member page: view personal details (read-only), change password, and view bills
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changePassword } from '../features/UserSlice';
import { addToast } from '../features/FitnessSlice';

// ------------------------------------------------------------
// 2. Constants
// ------------------------------------------------------------
const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };
const inputClass = 'w-full px-3 py-2 text-xs flat-input';

// ------------------------------------------------------------
// 3. ProfileMember component
// ------------------------------------------------------------
const ProfileMember = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isLoading = useSelector((state) => state.user.isLoading);
  const bills = useSelector((state) => state.fitness.bills);

  // --- Password form state ---
  const [form, setForm] = useState(EMPTY_PASSWORD_FORM);
  const [error, setError] = useState('');

  // --- Functions ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      const message = await dispatch(
        changePassword({
          userId: user.id,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      ).unwrap();

      setForm(EMPTY_PASSWORD_FORM);
      dispatch(addToast(message));
    } catch (message) {
      setError(message || 'Could not update password');
    }
  };

  // --- User detail rows (read-only) ---
  const details = [
    ['User ID', user.id],
    ['Username', user.username],
    ['Full Name', user.name || '-'],
    ['Email', user.email],
    ['Phone', user.phone || '-'],
    ['Role', user.role]
  ];

  // --- Render ---
  return (
    <section className="space-y-6">
      {/* ---------------- Page title ---------------- */}
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-900">My Profile</h2>
        <p className="text-xs text-slate-500">View your account details, update your password, and check your bills.</p>
      </div>

      {/* ---------------- Details (read-only) + Re-Password ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ---------------- Account details ---------------- */}
        <div className="flat-box overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="font-bold text-xs text-slate-800">Account Details</span>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-mono rounded">Read-Only</span>
          </div>

          <div className="p-4 divide-y divide-slate-100 text-xs">
            {details.map(([label, value]) => (
              <div key={label} className="py-2.5 flex justify-between items-center gap-4">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-900 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- Re-Password ---------------- */}
        <div className="flat-box overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <span className="font-bold text-xs text-slate-800">Change Password</span>
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-4 space-y-3">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                <i className="fa-solid fa-circle-exclamation text-red-500 mr-2"></i>{error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Current Password</label>
              <input
                name="currentPassword"
                type="password"
                required
                value={form.currentPassword}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
              <input
                name="newPassword"
                type="password"
                required
                value={form.newPassword}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn cursor-pointer"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* ---------------- My Bills ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">My Bills ({bills.length})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2">Invoice #</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-400">No bills found.</td>
                </tr>
              )}

              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono font-bold text-slate-900">{bill.id}</td>
                  <td className="px-4 py-2 text-slate-600">{bill.items}</td>
                  <td className="px-4 py-2 font-mono font-semibold">${Number(bill.total).toFixed(2)}</td>
                  <td className="px-4 py-2 text-slate-500">{bill.date}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ProfileMember;
