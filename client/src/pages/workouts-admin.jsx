// ============================================================
// Route: /admin/workouts
// Admin page: list, add, edit, and delete workouts
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
const EMPTY_FORM = { title: '', category: 'Upper Body', difficulty: 'Medium', duration: '40 mins', exercises: '' };
const INPUT_STYLE = 'w-full px-3 py-1.5 text-xs flat-input';

// ------------------------------------------------------------
// 3. WorkoutsAdmin component
// ------------------------------------------------------------
const WorkoutsAdmin = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const workouts = useSelector((state) => state.fitness.workouts);

  // --- Page state ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null = adding a new workout
  const [form, setForm] = useState(EMPTY_FORM);

  // --- Functions ---

  // Connect an input to the "form" state (value + onChange)
  const bindInput = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    className: INPUT_STYLE
  });

  // "+ Add Workout" button: open an empty form
  const handleAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  // "Edit" button: open the form filled with the workout's data
  const handleEdit = (workout) => {
    setEditId(workout.id);
    setForm({
      title: workout.title,
      category: workout.category,
      difficulty: workout.difficulty,
      duration: workout.duration,
      exercises: workout.exercises
    });
    setIsModalOpen(true);
  };

  // "Save" button in the form
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await dispatch(saveItem({ type: 'workouts', id: editId, data: form })).unwrap();
      setIsModalOpen(false);
      dispatch(addToast('Workout saved'));
    } catch (message) {
      dispatch(addToast(`Error saving workout: ${message}`));
    }
  };

  // "Delete" button
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout?')) return;

    try {
      await dispatch(deleteItem({ type: 'workouts', id })).unwrap();
      dispatch(addToast('Workout deleted'));
    } catch (message) {
      dispatch(addToast(`Error deleting workout: ${message}`));
    }
  };

  // --- Render ---
  return (
    <section className="space-y-4">
      {/* ---------------- Workouts table ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">Workouts ({workouts.length})</span>
          <button onClick={handleAdd} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
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
              {workouts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-400">No workouts found.</td>
                </tr>
              )}

              {workouts.map((workout) => (
                <tr key={workout.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{workout.title}</td>
                  <td className="px-4 py-2">{workout.category}</td>
                  <td className="px-4 py-2">{workout.difficulty}</td>
                  <td className="px-4 py-2 text-slate-500">{workout.duration}</td>
                  <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleEdit(workout)} className="text-slate-600 hover:text-black font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(workout.id)} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">Delete</button>
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
              <span className="font-bold text-xs text-slate-900">{editId ? 'Edit Workout' : 'Add Workout'}</span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Workout Title</label>
                <input type="text" required {...bindInput('title')} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Category</label>
                  <select {...bindInput('category')}>
                    <option value="Upper Body">Upper Body</option>
                    <option value="Lower Body">Lower Body</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Difficulty</label>
                  <select {...bindInput('difficulty')}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Duration</label>
                  <input type="text" {...bindInput('duration')} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Exercises</label>
                <textarea rows="3" required {...bindInput('exercises')} />
              </div>

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

export default WorkoutsAdmin;
