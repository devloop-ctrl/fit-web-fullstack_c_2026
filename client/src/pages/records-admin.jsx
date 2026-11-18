// ============================================================
// Route: /admin/records
// Admin page: Create and Read measurement records of all members (no edit, update, or delete)
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
const emptyForm = { userId: '', userEmail: '', name: '', height: '', weight: '', calories: '', steps: '' };
const inputClass = 'w-full px-3 py-1.5 text-xs flat-input';

// ------------------------------------------------------------
// 3. RecordsAdmin component
// ------------------------------------------------------------
const RecordsAdmin = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const records = useSelector((state) => state.fitness.records);

  // --- Page state ---
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // --- Functions ---

  // Update one field when the admin types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // "+ Add Record": open an empty form
  const handleAdd = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  // "Save": CREATE (the server calculates the BMI)
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await dispatch(addItem({ type: 'records', data: form })).unwrap();
      setShowForm(false);
      dispatch(addToast('Record saved'));
    } catch (message) {
      dispatch(addToast(`Error: ${message}`));
    }
  };

  // --- Render ---
  return (
    <section className="space-y-4">
      {/* ---------------- READ: records table ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">Measurement Records ({records.length})</span>
          <button onClick={handleAdd} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs flat-btn cursor-pointer">
            + Add Record
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-2">Member</th>
              <th className="px-4 py-2">Height / Weight</th>
              <th className="px-4 py-2">BMI</th>
              <th className="px-4 py-2">Calories</th>
              <th className="px-4 py-2">Steps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-slate-400">No records found.</td>
              </tr>
            )}

            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-2 font-medium">
                  {record.name}
                  <span className="block text-[10px] text-slate-400 font-mono">{record.userId}</span>
                </td>
                <td className="px-4 py-2">{record.height} cm / {record.weight} kg</td>
                <td className="px-4 py-2 font-bold">{record.bmi}</td>
                <td className="px-4 py-2">{record.calories} kcal</td>
                <td className="px-4 py-2">{record.steps}</td>
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
            <h3 className="font-bold text-sm">Add Record</h3>

            <input name="userId" value={form.userId} onChange={handleChange} placeholder="User ID (e.g. U-101)" required className={inputClass} />
            <input name="userEmail" type="email" value={form.userEmail} onChange={handleChange} placeholder="User email" className={inputClass} />
            <input name="name" value={form.name} onChange={handleChange} placeholder="Member name" required className={inputClass} />
            <input name="height" type="number" step="any" value={form.height} onChange={handleChange} placeholder="Height (cm)" required className={inputClass} />
            <input name="weight" type="number" step="any" value={form.weight} onChange={handleChange} placeholder="Weight (kg)" required className={inputClass} />
            <input name="calories" type="number" value={form.calories} onChange={handleChange} placeholder="Calories" required className={inputClass} />
            <input name="steps" type="number" value={form.steps} onChange={handleChange} placeholder="Steps" required className={inputClass} />

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

export default RecordsAdmin;
