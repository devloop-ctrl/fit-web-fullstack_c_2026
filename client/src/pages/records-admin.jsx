// ============================================================
// Route: /admin/records
// Admin page: list, add, edit, and delete measurement records of ALL members
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
const EMPTY_FORM = { userId: '', userEmail: '', name: '', height: '', weight: '', calories: '', steps: '' };
const INPUT_STYLE = 'w-full px-3 py-1.5 text-xs flat-input';

// ------------------------------------------------------------
// 3. RecordsAdmin component
// ------------------------------------------------------------
const RecordsAdmin = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const records = useSelector((state) => state.fitness.records);

  // --- Page state ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null = adding a new record
  const [form, setForm] = useState(EMPTY_FORM);

  // --- Functions ---

  // Connect an input to the "form" state (value + onChange)
  const bindInput = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    className: INPUT_STYLE
  });

  // "+ Add Record" button: open an empty form
  const handleAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  // "Edit" button: open the form filled with the record's data
  const handleEdit = (record) => {
    setEditId(record.id);
    setForm({
      userId: record.userId,
      userEmail: record.userEmail || '',
      name: record.name,
      height: record.height,
      weight: record.weight,
      calories: record.calories,
      steps: record.steps
    });
    setIsModalOpen(true);
  };

  // "Save" button in the form (the server calculates the BMI)
  const handleSave = async (e) => {
    e.preventDefault();

    // Inputs give text, the database needs numbers
    const data = {
      ...form,
      height: +form.height,
      weight: +form.weight,
      calories: +form.calories,
      steps: +form.steps
    };

    try {
      await dispatch(saveItem({ type: 'records', id: editId, data })).unwrap();
      setIsModalOpen(false);
      dispatch(addToast('Record saved'));
    } catch (message) {
      dispatch(addToast(`Error saving record: ${message}`));
    }
  };

  // "Delete" button
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this measurement record?')) return;

    try {
      await dispatch(deleteItem({ type: 'records', id })).unwrap();
      dispatch(addToast('Record deleted'));
    } catch (message) {
      dispatch(addToast(`Error deleting record: ${message}`));
    }
  };

  // --- Render ---
  return (
    <section className="space-y-4">
      {/* ---------------- Records table ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">Body Measurement Records ({records.length})</span>
          <button onClick={handleAdd} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
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
              {records.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-slate-400">No records found.</td>
                </tr>
              )}

              {records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {record.name}
                    <span className="block text-[10px] text-slate-400 font-mono">{record.userId} &bull; {record.userEmail}</span>
                  </td>
                  <td className="px-4 py-2">{record.height}cm / {record.weight}kg</td>
                  <td className="px-4 py-2 font-bold">{record.bmi}</td>
                  <td className="px-4 py-2">{record.calories} kcal</td>
                  <td className="px-4 py-2">{record.steps}</td>
                  <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleEdit(record)} className="text-slate-600 hover:text-black font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">Delete</button>
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
              <span className="font-bold text-xs text-slate-900">{editId ? 'Edit Record' : 'Add Record'}</span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">User ID</label>
                  <input type="text" required {...bindInput('userId')} />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">User Email</label>
                  <input type="email" {...bindInput('userEmail')} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Member Name</label>
                <input type="text" required {...bindInput('name')} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Height (cm)</label>
                  <input type="number" step="any" required {...bindInput('height')} />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Weight (kg)</label>
                  <input type="number" step="any" required {...bindInput('weight')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Calories</label>
                  <input type="number" required {...bindInput('calories')} />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Steps</label>
                  <input type="number" required {...bindInput('steps')} />
                </div>
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

export default RecordsAdmin;
