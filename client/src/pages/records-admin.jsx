import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveItem, deleteItem, addToast } from '../features/FitnessSlice';

const EMPTY = { userId: '', userEmail: '', name: '', height: '', weight: '', calories: '', steps: '' };

const RecordsAdmin = () => {
  const dispatch = useDispatch();
  const records = useSelector((state) => state.fitness.records);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const openNew = () => { setEditId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (r) => {
    setEditId(r.id);
    setForm({ userId: r.userId, userEmail: r.userEmail || '', name: r.name, height: r.height, weight: r.weight, calories: r.calories, steps: r.steps });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { ...form, height: +form.height, weight: +form.weight, calories: +form.calories, steps: +form.steps };
    try {
      await dispatch(saveItem({ type: 'records', id: editId, data })).unwrap();
      setModalOpen(false);
      dispatch(addToast('Record saved'));
    } catch (msg) {
      dispatch(addToast(`Error saving record: ${msg}`));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this measurement record?')) return;
    try {
      await dispatch(deleteItem({ type: 'records', id })).unwrap();
      dispatch(addToast('Record deleted'));
    } catch (msg) {
      dispatch(addToast(`Error deleting record: ${msg}`));
    }
  };

  const bind = (name) => ({ value: form[name], onChange: (e) => setForm({ ...form, [name]: e.target.value }), className: 'w-full px-3 py-1.5 text-xs flat-input' });

  return (
    <section className="space-y-4">
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">Body Measurement Records ({records.length})</span>
          <button onClick={openNew} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
            + Add Record
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2">Member</th>
                <th className="px-4 py-2">H / W</th>
                <th className="px-4 py-2">BMI</th>
                <th className="px-4 py-2">Calories</th>
                <th className="px-4 py-2">Steps</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 && <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-400">No records found.</td></tr>}
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {r.name}
                    <span className="block text-[10px] text-slate-400 font-mono">{r.userId} &bull; {r.userEmail}</span>
                  </td>
                  <td className="px-4 py-2">{r.height}cm / {r.weight}kg</td>
                  <td className="px-4 py-2 font-bold">{r.bmi}</td>
                  <td className="px-4 py-2">{r.calories} kcal</td>
                  <td className="px-4 py-2">{r.steps}</td>
                  <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => openEdit(r)} className="text-slate-600 hover:text-black font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">Delete</button>
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
              <span className="font-bold text-xs text-slate-900">{editId ? 'Edit Record' : 'Add Record'}</span>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-black cursor-pointer"><i className="fa-solid fa-xmark text-xs"></i></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs text-slate-600 mb-1">User ID</label><input type="text" required {...bind('userId')} /></div>
                <div><label className="block text-xs text-slate-600 mb-1">User Email</label><input type="email" {...bind('userEmail')} /></div>
              </div>
              <div><label className="block text-xs text-slate-600 mb-1">Member Name</label><input type="text" required {...bind('name')} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs text-slate-600 mb-1">Height (cm)</label><input type="number" step="any" required {...bind('height')} /></div>
                <div><label className="block text-xs text-slate-600 mb-1">Weight (kg)</label><input type="number" step="any" required {...bind('weight')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs text-slate-600 mb-1">Calories</label><input type="number" required {...bind('calories')} /></div>
                <div><label className="block text-xs text-slate-600 mb-1">Steps</label><input type="number" required {...bind('steps')} /></div>
              </div>
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

export default RecordsAdmin;

