// ============================================================
// Route: /calculators
// Member page: BMI, calories, and steps calculators + saved records (Create, Read, Delete)
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, deleteItem, addToast } from '../features/FitnessSlice';

// ------------------------------------------------------------
// 2. Constants
// ------------------------------------------------------------
const inputClass = 'w-full px-3 py-1.5 text-sm flat-input';

// ------------------------------------------------------------
// 3. CalculatorsMember component
// ------------------------------------------------------------
const CalculatorsMember = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const records = useSelector((state) => state.fitness.records);

  // --- Page state (what the user types) ---
  const [form, setForm] = useState({
    height: 175,
    weight: 70,
    age: 26,
    gender: 'male',
    goal: 0,
    activity: 10000,
    fatLoss: false
  });

  // --- Calculations (updated automatically when the form changes) ---
  const height = Number(form.height);
  const weight = Number(form.weight);
  const age = Number(form.age);

  const bmi = height > 0 && weight > 0 ? Number((weight / ((height / 100) * (height / 100))).toFixed(1)) : 0;
  const bmiStatus = bmi === 0 ? '-' : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

  const bmr = 10 * weight + 6.25 * height - 5 * age + (form.gender === 'male' ? 5 : -161);
  const calories = Math.round(bmr * 1.4 + Number(form.goal));

  const steps = Number(form.activity) + (form.fatLoss ? 2000 : 0);

  // --- Functions ---

  // Update one field when the user types
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  // CREATE: save the results as a new record
  const handleSave = async () => {
    if (height <= 0 || weight <= 0) {
      dispatch(addToast('Please enter valid height and weight'));
      return;
    }

    const record = {
      userId: user.id,
      userEmail: user.email,
      name: user.name || user.username,
      height,
      weight,
      calories,
      steps
    };

    try {
      await dispatch(addItem({ type: 'records', data: record })).unwrap();
      dispatch(addToast('Record saved'));
    } catch (message) {
      dispatch(addToast(`Error: ${message}`));
    }
  };

  // DELETE: remove a record
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;

    try {
      await dispatch(deleteItem({ type: 'records', id })).unwrap();
      dispatch(addToast('Record deleted'));
    } catch (message) {
      dispatch(addToast(`Error: ${message}`));
    }
  };

  // --- Render ---
  return (
    <section className="space-y-6">
      {/* ---------------- Page title ---------------- */}
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Personal Health &amp; Weight Management</h2>
        <p className="text-xs text-slate-500">Change the values and the results update automatically.</p>
      </div>

      {/* ---------------- The three calculators ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ---------------- BMI ---------------- */}
        <div className="flat-box p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900">BMI Calculator</h3>

          <label className="block text-xs text-slate-600">Height (cm)</label>
          <input type="number" name="height" value={form.height} onChange={handleChange} className={inputClass} />

          <label className="block text-xs text-slate-600">Weight (kg)</label>
          <input type="number" name="weight" value={form.weight} onChange={handleChange} className={inputClass} />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
            <div className="flex justify-between"><span>Score:</span><b>{bmi}</b></div>
            <div className="flex justify-between"><span>Status:</span><b>{bmiStatus}</b></div>
          </div>
        </div>

        {/* ---------------- Calories ---------------- */}
        <div className="flat-box p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Calorie Calculator</h3>

          <label className="block text-xs text-slate-600">Age</label>
          <input type="number" name="age" value={form.age} onChange={handleChange} className={inputClass} />

          <label className="block text-xs text-slate-600">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label className="block text-xs text-slate-600">Goal</label>
          <select name="goal" value={form.goal} onChange={handleChange} className={inputClass}>
            <option value="-400">Weight Loss (-400 kcal)</option>
            <option value="0">Maintenance</option>
            <option value="350">Muscle Gain (+350 kcal)</option>
          </select>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
            <div className="flex justify-between"><span>Target:</span><b>{calories} kcal</b></div>
          </div>
        </div>

        {/* ---------------- Steps ---------------- */}
        <div className="flat-box p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Daily Step Target</h3>

          <label className="block text-xs text-slate-600">Activity Level</label>
          <select name="activity" value={form.activity} onChange={handleChange} className={inputClass}>
            <option value="7000">Low Activity</option>
            <option value="10000">Moderate Activity</option>
            <option value="13000">High Activity</option>
          </select>

          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" name="fatLoss" checked={form.fatLoss} onChange={handleChange} />
            My focus is fat loss (+2000 steps)
          </label>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
            <div className="flex justify-between"><span>Target:</span><b>{steps} steps</b></div>
          </div>
        </div>
      </div>

      {/* ---------------- Save button ---------------- */}
      <div className="flat-box p-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">Save these results to your account ({user.email}).</p>
        <button onClick={handleSave} className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
          Save Record
        </button>
      </div>

      {/* ---------------- Saved records table ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">My Measurement History</div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-2">Height / Weight</th>
              <th className="px-4 py-2">BMI</th>
              <th className="px-4 py-2">Calories</th>
              <th className="px-4 py-2">Steps</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-slate-400">No saved records yet.</td>
              </tr>
            )}

            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-2">{record.height} cm / {record.weight} kg</td>
                <td className="px-4 py-2 font-bold">{record.bmi}</td>
                <td className="px-4 py-2">{record.calories} kcal</td>
                <td className="px-4 py-2">{record.steps}</td>
                <td className="px-4 py-2 text-slate-400">{record.date}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700 cursor-pointer">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  );
};

export default CalculatorsMember;
