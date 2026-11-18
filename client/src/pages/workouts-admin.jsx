import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveItem, deleteItem, addToast } from '../features/FitnessSlice';

const EMPTY = { title: '', category: 'Upper Body', difficulty: 'Medium', duration: '40 mins', exercises: '' };

const WorkoutsAdmin = () => {
  const dispatch = useDispatch();
  const workouts = useSelector((state) => state.fitness.workouts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const openNew = () => { setEditId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (w) => {
    setEditId(w.id);
    setForm({ title: w.title, category: w.category, difficulty: w.difficulty, duration: w.duration, exercises: w.exercises });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await dispatch(saveItem({ type: 'workouts', id: editId, data: form })).unwrap();
      setModalOpen(false);
      dispatch(addToast('Workout saved'));
    } catch (msg) {
      dispatch(addToast(`Error saving workout: ${msg}`));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      await dispatch(deleteItem({ type: 'workouts', id })).unwrap();
      dispatch(addToast('Workout deleted'));
    } catch (msg) {
      dispatch(addToast(`Error deleting workout: ${msg}`));
    }
  };

  const bind = (name) => ({ value: form[name], onChange: (e) => setForm({ ...form, [name]: e.target.value }), className: 'w-full px-3 py-1.5 text-xs flat-input' });

  return (
    <section className="space-y-4">
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">Workouts ({workouts.length})</span>
          <button onClick={openNew} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
            + Add Workout
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Difficulty</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workouts.length === 0 && <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-400">No workouts found.</td></tr>}
              {workouts.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{w.title}</td>
                  <td className="px-4 py-2">{w.category}</td>
                  <td className="px-4 py-2">{w.difficulty}</td>
                  <td className="px-4 py-2 text-slate-500">{w.duration}</td>
                  <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => openEdit(w)} className="text-slate-600 hover:text-black font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(w.id)} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">Delete</button>
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
              <span className="font-bold text-xs text-slate-900">{editId ? 'Edit Workout' : 'Add Workout'}</span>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-black cursor-pointer"><i className="fa-solid fa-xmark text-xs"></i></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div><label className="block text-xs text-slate-600 mb-1">Workout Title</label><input type="text" required {...bind('title')} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Category</label>
                  <select {...bind('category')}>
                    <option value="Upper Body">Upper Body</option>
                    <option value="Lower Body">Lower Body</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Difficulty</label>
                  <select {...bind('difficulty')}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div><label className="block text-xs text-slate-600 mb-1">Duration</label><input type="text" {...bind('duration')} /></div>
              </div>
              <div><label className="block text-xs text-slate-600 mb-1">Exercises</label><textarea rows="3" required {...bind('exercises')} /></div>
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

export default WorkoutsAdmin;

