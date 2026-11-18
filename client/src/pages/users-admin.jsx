import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveItem, deleteItem, addToast } from '../features/FitnessSlice';

const EMPTY = { username: '', name: '', email: '', phone: '', role: 'Member', password: '' };

const UsersAdmin = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.fitness.users);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const openNew = () => { setEditId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (u) => {
    setEditId(u.id);
    setForm({ username: u.username, name: u.name || '', email: u.email, phone: u.phone || '', role: u.role, password: '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = editId ? { username: form.username, name: form.name, email: form.email, phone: form.phone, role: form.role } : form;
    try {
      await dispatch(saveItem({ type: 'users', id: editId, data })).unwrap();
      setModalOpen(false);
      dispatch(addToast('User saved'));
    } catch (msg) {
      dispatch(addToast(`Error saving user: ${msg}`));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await dispatch(deleteItem({ type: 'users', id })).unwrap();
      dispatch(addToast('User deleted'));
    } catch (msg) {
      dispatch(addToast(`Error deleting user: ${msg}`));
    }
  };

  const bind = (name) => ({ value: form[name], onChange: (e) => setForm({ ...form, [name]: e.target.value }), className: 'w-full px-3 py-1.5 text-xs flat-input' });

  return (
    <section className="space-y-4">
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">User Accounts ({users.length})</span>
          <button onClick={openNew} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
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
              {users.length === 0 && <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-400">No users found.</td></tr>}
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-slate-400">{u.id}</td>
                  <td className="px-4 py-2 font-medium text-slate-900">{u.username}</td>
                  <td className="px-4 py-2 text-slate-600">{u.email}</td>
                  <td className="px-4 py-2 font-mono text-slate-600">{u.phone}</td>
                  <td className="px-4 py-2"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">{u.role}</span></td>
                  <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => openEdit(u)} className="text-slate-600 hover:text-black font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="font-bold text-xs text-slate-900">{editId ? 'Edit User' : 'Add User'}</span>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-black cursor-pointer"><i className="fa-solid fa-xmark text-xs"></i></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div><label className="block text-xs text-slate-600 mb-1">Username</label><input type="text" required {...bind('username')} /></div>
              <div><label className="block text-xs text-slate-600 mb-1">Full Name</label><input type="text" required {...bind('name')} /></div>
              <div><label className="block text-xs text-slate-600 mb-1">Email</label><input type="email" required {...bind('email')} /></div>
              <div><label className="block text-xs text-slate-600 mb-1">Phone Number</label><input type="tel" {...bind('phone')} /></div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Role</label>
                <select {...bind('role')}>
                  <option value="Member">Member</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              {!editId && <div><label className="block text-xs text-slate-600 mb-1">Password</label><input type="password" required {...bind('password')} /></div>}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 border border-slate-200 text-xs font-medium flat-btn hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default UsersAdmin;

