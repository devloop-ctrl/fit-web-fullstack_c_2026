// ============================================================
// Route: /admin/users
// Admin page: list, add, edit, and delete users
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveItem, deleteItem, addToast } from '../features/FitnessSlice';

// ------------------------------------------------------------
// 2. Constants
// ------------------------------------------------------------
const EMPTY_FORM = { username: '', name: '', email: '', phone: '', role: 'Member', password: '' };
const INPUT_STYLE = 'w-full px-3 py-1.5 text-xs flat-input';

// ------------------------------------------------------------
// 3. UsersAdmin component
// ------------------------------------------------------------
const UsersAdmin = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const users = useSelector((state) => state.fitness.users);

  // --- Page state ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null = adding a new user
  const [form, setForm] = useState(EMPTY_FORM);

  // --- Functions ---

  // Connect an input to the "form" state (value + onChange)
  const bindInput = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    className: INPUT_STYLE
  });

  // "+ Add User" button: open an empty form
  const handleAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  // "Edit" button: open the form filled with the user's data
  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({
      username: user.username,
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: ''
    });
    setIsModalOpen(true);
  };

  // "Save" button in the form
  const handleSave = async (e) => {
    e.preventDefault();

    // The password is only sent when creating a new user
    const { password, ...dataWithoutPassword } = form;
    const data = editId ? dataWithoutPassword : { ...dataWithoutPassword, password };

    try {
      await dispatch(saveItem({ type: 'users', id: editId, data })).unwrap();
      setIsModalOpen(false);
      dispatch(addToast('User saved'));
    } catch (message) {
      dispatch(addToast(`Error saving user: ${message}`));
    }
  };

  // "Delete" button
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await dispatch(deleteItem({ type: 'users', id })).unwrap();
      dispatch(addToast('User deleted'));
    } catch (message) {
      dispatch(addToast(`Error deleting user: ${message}`));
    }
  };

  // --- Render ---
  return (
    <section className="space-y-4">
      {/* ---------------- Users table ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">User Accounts ({users.length})</span>
          <button onClick={handleAdd} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
            + Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2">User ID</th>
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
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-slate-400">{user.id}</td>
                  <td className="px-4 py-2 font-medium text-slate-900">{user.username}</td>
                  <td className="px-4 py-2 text-slate-600">{user.email}</td>
                  <td className="px-4 py-2 font-mono text-slate-600">{user.phone}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">{user.role}</span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleEdit(user)} className="text-slate-600 hover:text-black font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- Add / Edit form (popup) ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="font-bold text-xs text-slate-900">{editId ? 'Edit User' : 'Add User'}</span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Username</label>
                <input type="text" required {...bindInput('username')} />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Full Name</label>
                <input type="text" required {...bindInput('name')} />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Email</label>
                <input type="email" required {...bindInput('email')} />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Phone Number</label>
                <input type="tel" {...bindInput('phone')} />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Role</label>
                <select {...bindInput('role')}>
                  <option value="Member">Member</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Password is only needed for new users */}
              {!editId && (
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Password</label>
                  <input type="password" required {...bindInput('password')} />
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border border-slate-200 text-xs font-medium flat-btn hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default UsersAdmin;
