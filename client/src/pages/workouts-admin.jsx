// ============================================================
// Route: /admin/workouts
// Admin page: CRUD for workouts (Create, Read, Update, Delete)
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
const emptyForm = { title: '', category: 'Upper Body', difficulty: 'Medium', duration: '40 mins', exercises: '' };
const inputClass = 'w-full px-3 py-1.5 text-xs flat-input';

// ------------------------------------------------------------
// 3. WorkoutsAdmin component
// ------------------------------------------------------------
const WorkoutsAdmin = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const workouts = useSelector((state) => state.fitness.workouts);

  // --- Page state ---
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null); // null = creating a new workout
  const [form, setForm] = useState(emptyForm);

  // --- Functions ---

  // Update one field when the admin types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // "+ Add Workout": open an empty form
  const handleAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  // "Edit": open the form with the workout's data
  const handleEdit = (workout) => {
    setEditId(workout.id);
    setForm({ ...emptyForm, ...workout });
    setShowForm(true);
  };

  // "Save": CREATE or UPDATE
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await dispatch(updateItem({ type: 'workouts', id: editId, data: form })).unwrap();
      } else {
        await dispatch(addItem({ type: 'workouts', data: form })).unwrap();
      }
      setShowForm(false);
      dispatch(addToast('Workout saved'));
    } catch (message) {
      dispatch(addToast(`Error: ${message}`));
    }
  };

  // "Delete": DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout?')) return;

    try {
      await dispatch(deleteItem({ type: 'workouts', id })).unwrap();
      dispatch(addToast('Workout deleted'));
    } catch (message) {
      dispatch(addToast(`Error: ${message}`));
    }
  };

  // --- Render ---
  return (
    <section className="space-y-4">
      {/* ---------------- READ: workouts table ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">Workouts ({workouts.length})</span>
          <button onClick={handleAdd} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs flat-btn cursor-pointer">
            + Add Workout
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 text-slate-500">
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
              <tr key={workout.id}>
                <td className="px-4 py-2 font-medium">{workout.title}</td>
                <td className="px-4 py-2">{workout.category}</td>
                <td className="px-4 py-2">{workout.difficulty}</td>
                <td className="px-4 py-2">{workout.duration}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button onClick={() => handleEdit(workout)} className="text-slate-600 hover:text-black cursor-pointer">Edit</button>
                  <button onClick={() => handleDelete(workout.id)} className="text-red-600 hover:text-red-800 cursor-pointer">Delete</button>
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
            <h3 className="font-bold text-sm">{editId ? 'Edit Workout' : 'Add Workout'}</h3>

            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className={inputClass} />

            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              <option value="Upper Body">Upper Body</option>
              <option value="Lower Body">Lower Body</option>
              <option value="Cardio">Cardio</option>
            </select>

            <select name="difficulty" value={form.difficulty} onChange={handleChange} className={inputClass}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration" className={inputClass} />
            <textarea name="exercises" value={form.exercises} onChange={handleChange} placeholder="Exercises" rows="3" required className={inputClass} />

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

export default WorkoutsAdmin;
