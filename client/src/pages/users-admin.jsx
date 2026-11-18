// ============================================================
// Route: /admin/users
// Admin page: Create and Read users (no edit, update, or delete)
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, addToast } from '../features/FitnessSlice';

// ------------------------------------------------------------
// 2. Constants
// ------------------------------------------------------------
const emptyForm = { username: '', name: '', email: '', phone: '', role: 'Member', password: '' };
const inputClass = 'w-full px-3 py-1.5 text-xs flat-input';

// ------------------------------------------------------------
// 3. UsersAdmin component
// ------------------------------------------------------------
const UsersAdmin = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const users = useSelector((state) => state.fitness.users);

  // --- Page state ---
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // --- Functions ---

  // Update one field when the admin types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // "+ Add User": open an empty form
  const handleAdd = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  // "Save": CREATE
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await dispatch(addItem({ type: 'users', data: form })).unwrap();
      setShowForm(false);
      dispatch(addToast('User saved'));
    } catch (message) {
      dispatch(addToast(`Error: ${message}`));
    }
  };

  // --- Render ---
  return (
    <section className="space-y-4">
      {/* ---------------- READ: users table ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">Users ({users.length})</span>
          <button onClick={handleAdd} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs flat-btn cursor-pointer">
            + Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-400">No users found.</td>
                </tr>
              )}

              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 font-mono text-slate-400">{user.id}</td>
                  <td className="px-4 py-2 font-medium">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.phone}</td>
                  <td className="px-4 py-2">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- CREATE form ---------------- */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-lg max-w-md w-full p-4 space-y-3 shadow-xl">
            <h3 className="font-bold text-sm">Add User</h3>

            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required className={inputClass} />
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required className={inputClass} />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className={inputClass} />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className={inputClass} />

            <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
              <option value="Member">Member</option>
              <option value="Trainer">Trainer</option>
              <option value="Admin">Admin</option>
            </select>

            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required className={inputClass} />

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 border border-slate-200 text-xs cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white text-xs cursor-pointer">Save</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default UsersAdmin;
