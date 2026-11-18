// ============================================================
// Route: /calculators
// Member page: BMI, calories, and steps calculators + saved measurement history
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveItem, deleteItem, addToast } from '../features/FitnessSlice';

// ------------------------------------------------------------
// 2. Calculation functions (pure math, no React)
// ------------------------------------------------------------

// BMI = weight / (height in meters)^2
const calcBmi = (height, weight) => +(weight / (height / 100) ** 2).toFixed(1);

// Text label for a BMI number
const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Daily calories (Mifflin-St Jeor formula x activity 1.4 + goal adjustment)
const calcCalories = ({ height, weight, age, gender, goal }) => {
  const base = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);
  return Math.round(base * 1.4 + +goal);
};

// Daily steps depending on activity level and focus
const calcSteps = ({ fitness, intent }) => {
  const base = { sedentary: 7000, moderate: 10000, active: 13000 }[fitness];
  return base + (intent === 'fatloss' ? 2000 : 0);
};

// Text label for the calorie goal
const getGoalLabel = (goal) => {
  if (goal < 0) return 'Deficit';
  if (goal > 0) return 'Surplus';
  return 'Maintenance';
};

// ------------------------------------------------------------
// 3. Constants
// ------------------------------------------------------------
const INITIAL_INPUTS = {
  height: 175,
  weight: 70,
  age: 26,
  gender: 'male',
  goal: '0',
  fitness: 'moderate',
  intent: 'fatloss'
};

// ------------------------------------------------------------
// 4. Small parts used by the page
// ------------------------------------------------------------

// A number input with a label
const NumberInput = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-slate-600 mb-1">{label}</label>
    <input type="number" className="w-full px-3 py-1.5 text-sm flat-input" {...props} />
  </div>
);

// A dropdown with a label. options = [[value, text], ...]
const SelectInput = ({ label, options, ...props }) => (
  <div>
    <label className="block text-xs text-slate-600 mb-1">{label}</label>
    <select className="w-full px-2 py-1.5 text-sm flat-input cursor-pointer" {...props}>
      {options.map(([value, text]) => (
        <option key={value} value={value}>{text}</option>
      ))}
    </select>
  </div>
);

// One calculator box: inputs on top, button, then the results at the bottom
const CalculatorCard = ({ title, icon, buttonText, onCalculate, results, children }) => (
  <div className="flat-box p-5 flex flex-col justify-between">
    <div className="space-y-3">
      <div className="flex items-center justify-between font-bold text-sm text-slate-900">
        <span>{title}</span>
        <i className={`fa-solid ${icon} text-slate-400`}></i>
      </div>

      {children}

      <button onClick={onCalculate} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
        {buttonText}
      </button>
    </div>

    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
      {results.map(([label, value]) => (
        <div key={label} className="flex justify-between text-xs">
          <span className="text-slate-500">{label}</span>
          <span className="font-bold text-slate-900">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

// ------------------------------------------------------------
// 5. CalculatorsMember component
// ------------------------------------------------------------
const CalculatorsMember = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const records = useSelector((state) => state.fitness.records);

  // --- Page state ---
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [results, setResults] = useState({
    bmi: calcBmi(INITIAL_INPUTS.height, INITIAL_INPUTS.weight),
    calories: calcCalories(INITIAL_INPUTS),
    goal: INITIAL_INPUTS.goal,
    steps: calcSteps(INITIAL_INPUTS),
    intent: INITIAL_INPUTS.intent
  });
  const [recordName, setRecordName] = useState(user.name || user.username);

  // --- Functions ---

  // Connect an input to the "inputs" state (value + onChange)
  const bindInput = (name) => ({
    name,
    value: inputs[name],
    onChange: (e) => setInputs({ ...inputs, [name]: e.target.value })
  });

  // Save new results and show a message
  const showResult = (newResults, message) => {
    setResults({ ...results, ...newResults });
    dispatch(addToast(message));
  };

  // BMI button
  const handleBmi = () => {
    const bmi = calcBmi(+inputs.height, +inputs.weight);
    showResult({ bmi }, `BMI: ${bmi} (${getBmiCategory(bmi)})`);
  };

  // Calories button
  const handleCalories = () => {
    const calories = calcCalories({
      ...inputs,
      height: +inputs.height,
      weight: +inputs.weight,
      age: +inputs.age
    });
    showResult({ calories, goal: inputs.goal }, `Calorie Goal: ${calories} kcal`);
  };

  // Steps button
  const handleSteps = () => {
    const steps = calcSteps(inputs);
    showResult({ steps, intent: inputs.intent }, `Steps: ${steps.toLocaleString()}`);
  };

  // Save the current results in the database
  const handleSave = async () => {
    const record = {
      userId: user.id,
      userEmail: user.email,
      name: recordName.trim() || user.name || user.username,
      height: +inputs.height,
      weight: +inputs.weight,
      bmi: results.bmi,
      calories: results.calories,
      steps: results.steps
    };

    try {
      await dispatch(saveItem({ type: 'records', data: record })).unwrap();
      dispatch(addToast(`Saved metrics for ${record.name}`));
    } catch (message) {
      dispatch(addToast(`Error saving record: ${message}`));
    }
  };

  // Delete one saved record
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
    <section className="space-y-6">
      {/* ---------------- Page title ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personal Health &amp; Weight Management</h2>
          <p className="text-xs text-slate-500">Calculate your vital metrics and manage your private measurement history.</p>
        </div>
        <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded">
          <i className="fa-solid fa-circle-check text-emerald-600 mr-2"></i>Connected as: <b>{user.name || user.username}</b>
        </div>
      </div>

      {/* ---------------- The three calculators ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CalculatorCard
          title="BMI Calculator"
          icon="fa-weight-scale"
          buttonText="Calculate BMI"
          onCalculate={handleBmi}
          results={[['Score:', results.bmi], ['Status:', getBmiCategory(results.bmi)]]}
        >
          <NumberInput label="Height (cm)" {...bindInput('height')} />
          <NumberInput label="Weight (kg)" {...bindInput('weight')} />
        </CalculatorCard>

        <CalculatorCard
          title="Calorie Calculator"
          icon="fa-fire-flame-curved"
          buttonText="Calculate Calories"
          onCalculate={handleCalories}
          results={[['Target:', `${results.calories.toLocaleString()} kcal`], ['Plan:', getGoalLabel(results.goal)]]}
        >
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="Age" {...bindInput('age')} />
            <SelectInput label="Gender" options={[['male', 'Male'], ['female', 'Female']]} {...bindInput('gender')} />
          </div>
          <SelectInput
            label="Goal"
            options={[['-400', 'Weight Loss (-400 kcal)'], ['0', 'Maintenance (0 kcal)'], ['350', 'Muscle Gain (+350 kcal)']]}
            {...bindInput('goal')}
          />
        </CalculatorCard>

        <CalculatorCard
          title="Daily Step Target"
          icon="fa-person-walking"
          buttonText="Estimate Steps"
          onCalculate={handleSteps}
          results={[['Target:', `${results.steps.toLocaleString()} steps`], ['Focus:', results.intent === 'fatloss' ? 'Fat Loss' : 'Health']]}
        >
          <SelectInput
            label="Activity Level"
            options={[['sedentary', 'Low Activity'], ['moderate', 'Moderate Activity'], ['active', 'High Activity']]}
            {...bindInput('fitness')}
          />
          <SelectInput label="Focus" options={[['health', 'General Health'], ['fatloss', 'Fat Loss']]} {...bindInput('intent')} />
        </CalculatorCard>
      </div>

      {/* ---------------- Save box ---------------- */}
      <div className="flat-box p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="font-bold text-sm text-slate-900">Save Your Personal Metrics</div>
          <p className="text-xs text-slate-500">Recording measurements under your account ({user.email || user.username}).</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Your Name"
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
            className="px-3 py-1.5 text-sm flat-input w-full sm:w-48"
          />
          <button onClick={handleSave} className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn whitespace-nowrap cursor-pointer">
            <i className="fa-solid fa-floppy-disk mr-1.5"></i>Save Record
          </button>
        </div>
      </div>

      {/* ---------------- History table ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">My Personal Measurement History</div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
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
                  <td colSpan="7" className="px-4 py-6 text-center text-slate-400">No saved measurement records yet.</td>
                </tr>
              )}

              {records.slice(0, 8).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{r.name}</td>
                  <td className="px-4 py-2 font-mono">{r.height} cm / {r.weight} kg</td>
                  <td className="px-4 py-2 font-bold">{r.bmi}</td>
                  <td className="px-4 py-2">{r.calories} kcal</td>
                  <td className="px-4 py-2">{r.steps.toLocaleString()}</td>
                  <td className="px-4 py-2 text-slate-400">{r.date}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleDelete(r.id)} title="Delete record" className="text-red-500 hover:text-red-700 cursor-pointer">
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
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
