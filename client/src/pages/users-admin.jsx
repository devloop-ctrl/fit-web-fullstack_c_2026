// ============================================================
// Route: /admin/users
// Admin page: CRUD for users (Create, Read, Update, Delete)
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, updateItem, deleteItem, addToast } from '../features/FitnessSlice';

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
  const [editId, setEditId] = useState(null); // null = creating a new user
  const [form, setForm] = useState(emptyForm);

  // --- Functions ---

  // Update one field when the admin types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // "+ Add User": open an empty form
  const handleAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  // "Edit": open the form with the user's data
  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({ ...emptyForm, ...user, password: '' });
    setShowForm(true);
  };

  // "Save": CREATE or UPDATE
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        const { username, name, email, phone, role } = form;
        await dispatch(updateItem({ type: 'users', id: editId, data: { username, name, email, phone, role } })).unwrap();
      } else {
        await dispatch(addItem({ type: 'users', data: form })).unwrap();
      }
      setShowForm(false);
      dispatch(addToast('User saved'));
    } catch (message) {
      dispatch(addToast(`Error: ${message}`));
    }
  };

  // "Delete": DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await dispatch(deleteItem({ type: 'users', id })).unwrap();
      dispatch(addToast('User deleted'));
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
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-slate-400">No users found.</td>
                </tr>
              )}

              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 font-mono text-slate-400">{user.id}</td>
                  <td className="px-4 py-2 font-medium">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.phone}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button onClick={() => handleEdit(user)} className="text-slate-600 hover:text-black cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- CREATE / UPDATE form ---------------- */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-lg max-w-md w-full p-4 space-y-3 shadow-xl">
            <h3 className="font-bold text-sm">{editId ? 'Edit User' : 'Add User'}</h3>

            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required className={inputClass} />
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required className={inputClass} />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className={inputClass} />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className={inputClass} />

            <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
              <option value="Member">Member</option>
              <option value="Trainer">Trainer</option>
              <option value="Admin">Admin</option>
            </select>

            {/* Password is only needed when creating a user */}
            {!editId && (
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required className={inputClass} />
            )}

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
