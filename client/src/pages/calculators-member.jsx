import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveItem, deleteItem, addToast } from '../features/FitnessSlice';

const calcBmi = (h, w) => +(w / (h / 100) ** 2).toFixed(1);
const bmiCategory = (bmi) => (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese');
const calcCalories = ({ height, weight, age, gender, goal }) =>
  Math.round((10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161)) * 1.4 + +goal);
const calcSteps = ({ fitness, intent }) =>
  ({ sedentary: 7000, moderate: 10000, active: 13000 })[fitness] + (intent === 'fatloss' ? 2000 : 0);

const INITIAL_INPUTS = { height: 175, weight: 70, age: 26, gender: 'male', goal: '0', fitness: 'moderate', intent: 'fatloss' };
const goalLabel = (goal) => (goal < 0 ? 'Deficit' : goal > 0 ? 'Surplus' : 'Maintenance');

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-slate-600 mb-1">{label}</label>
    <input type="number" className="w-full px-3 py-1.5 text-sm flat-input" {...props} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-xs text-slate-600 mb-1">{label}</label>
    <select className="w-full px-2 py-1.5 text-sm flat-input cursor-pointer" {...props}>
      {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
    </select>
  </div>
);

const Card = ({ title, icon, button, onCalculate, rows, children }) => (
  <div className="flat-box p-5 flex flex-col justify-between">
    <div className="space-y-3">
      <div className="flex items-center justify-between font-bold text-sm text-slate-900">
        <span>{title}</span>
        <i className={`fa-solid ${icon} text-slate-400`}></i>
      </div>
      {children}
      <button onClick={onCalculate} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
        {button}
      </button>
    </div>
    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between text-xs">
          <span className="text-slate-500">{label}</span>
          <span className="font-bold text-slate-900">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const CalculatorsMember = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const records = useSelector((state) => state.fitness.records);

  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [results, setResults] = useState({
    bmi: calcBmi(INITIAL_INPUTS.height, INITIAL_INPUTS.weight),
    calories: calcCalories(INITIAL_INPUTS),
    goal: INITIAL_INPUTS.goal,
    steps: calcSteps(INITIAL_INPUTS),
    intent: INITIAL_INPUTS.intent
  });
  const [recordName, setRecordName] = useState(user.name || user.username);

  const bind = (name) => ({ name, value: inputs[name], onChange: (e) => setInputs({ ...inputs, [name]: e.target.value }) });

  const updateResult = (patch, message) => {
    setResults({ ...results, ...patch });
    dispatch(addToast(message));
  };

  const handleBmi = () => {
    const bmi = calcBmi(+inputs.height, +inputs.weight);
    updateResult({ bmi }, `BMI: ${bmi} (${bmiCategory(bmi)})`);
  };

  const handleCalories = () => {
    const calories = calcCalories({ ...inputs, height: +inputs.height, weight: +inputs.weight, age: +inputs.age });
    updateResult({ calories, goal: inputs.goal }, `Calorie Goal: ${calories} kcal`);
  };

  const handleSteps = () => {
    const steps = calcSteps(inputs);
    updateResult({ steps, intent: inputs.intent }, `Steps: ${steps.toLocaleString()}`);
  };

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

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personal Health &amp; Weight Management</h2>
          <p className="text-xs text-slate-500">Calculate your vital metrics and manage your private measurement history.</p>
        </div>
        <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded">
          <i className="fa-solid fa-circle-check text-emerald-600 mr-2"></i>Connected as: <b>{user.name || user.username}</b>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="BMI Calculator" icon="fa-weight-scale" button="Calculate BMI" onCalculate={handleBmi}
          rows={[['Score:', results.bmi], ['Status:', bmiCategory(results.bmi)]]}>
          <Input label="Height (cm)" {...bind('height')} />
          <Input label="Weight (kg)" {...bind('weight')} />
        </Card>

        <Card title="Calorie Calculator" icon="fa-fire-flame-curved" button="Calculate Calories" onCalculate={handleCalories}
          rows={[['Target:', `${results.calories.toLocaleString()} kcal`], ['Plan:', goalLabel(results.goal)]]}>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Age" {...bind('age')} />
            <Select label="Gender" options={[['male', 'Male'], ['female', 'Female']]} {...bind('gender')} />
          </div>
          <Select label="Goal" {...bind('goal')}
            options={[['-400', 'Weight Loss (-400 kcal)'], ['0', 'Maintenance (0 kcal)'], ['350', 'Muscle Gain (+350 kcal)']]} />
        </Card>

        <Card title="Daily Step Target" icon="fa-person-walking" button="Estimate Steps" onCalculate={handleSteps}
          rows={[['Target:', `${results.steps.toLocaleString()} steps`], ['Focus:', results.intent === 'fatloss' ? 'Fat Loss' : 'Health']]}>
          <Select label="Activity Level" {...bind('fitness')}
            options={[['sedentary', 'Low Activity'], ['moderate', 'Moderate Activity'], ['active', 'High Activity']]} />
          <Select label="Focus" {...bind('intent')} options={[['health', 'General Health'], ['fatloss', 'Fat Loss']]} />
        </Card>
      </div>

      <div className="flat-box p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="font-bold text-sm text-slate-900">Save Your Personal Metrics</div>
          <p className="text-xs text-slate-500">Recording measurements under your account ({user.email || user.username}).</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input type="text" placeholder="Your Name" value={recordName} onChange={(e) => setRecordName(e.target.value)} className="px-3 py-1.5 text-sm flat-input w-full sm:w-48" />
          <button onClick={handleSave} className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn whitespace-nowrap cursor-pointer">
            <i className="fa-solid fa-floppy-disk mr-1.5"></i>Save Record
          </button>
        </div>
      </div>

      <div className="flat-box overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">My Personal Measurement History</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500">
              <tr>
                {['Name', 'Height / Weight', 'BMI', 'Calories', 'Steps', 'Date', ''].map((h) => <th key={h} className="px-4 py-2">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-slate-400">No saved measurement records yet.</td>
                </tr>
              ) : (
                records.slice(0, 8).map((r) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default CalculatorsMember;

