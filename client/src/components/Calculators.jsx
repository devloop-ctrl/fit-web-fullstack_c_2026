import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveMeasurementRecord, deleteFitnessItem, fetchRecords, openAuthModal, addToast } from '../features/FitnessSlice';

const Calculators = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const records = useSelector((state) => state.fitness.records);

  // BMI state
  const [bmiHeight, setBmiHeight] = useState(175);
  const [bmiWeight, setBmiWeight] = useState(70);
  const [bmiScore, setBmiScore] = useState('22.9');
  const [bmiCategory, setBmiCategory] = useState('Normal');

  // Calorie state
  const [calAge, setCalAge] = useState(26);
  const [calGender, setCalGender] = useState('male');
  const [calGoal, setCalGoal] = useState('0');
  const [calScore, setCalScore] = useState('2,320 kcal');
  const [calGoalLabel, setCalGoalLabel] = useState('Maintenance');
  const [rawCalories, setRawCalories] = useState(2320);

  // Step state
  const [stepFitness, setStepFitness] = useState('moderate');
  const [stepIntent, setStepIntent] = useState('fatloss');
  const [stepScore, setStepScore] = useState('10,000 steps');
  const [stepLabel, setStepLabel] = useState('Active');
  const [rawSteps, setRawSteps] = useState(10000);

  // Record name state
  const [userName, setUserName] = useState('');

  // Sync user name and refresh private records when user changes
  useEffect(() => {
    if (user) {
      setUserName(user.name || user.username || '');
      dispatch(fetchRecords({ userId: user.id }));
    } else {
      setUserName('');
    }
  }, [user, dispatch]);

  // BMI calculation
  const calculateBMI = () => {
    const h = parseFloat(bmiHeight);
    const w = parseFloat(bmiWeight);
    if (!h || !w) return;

    const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
    let cat = 'Normal';
    if (bmi < 18.5) cat = 'Underweight';
    else if (bmi >= 25 && bmi < 30) cat = 'Overweight';
    else if (bmi >= 30) cat = 'Obese';

    setBmiScore(bmi);
    setBmiCategory(cat);
    dispatch(addToast(`BMI: ${bmi} (${cat})`));
  };

  // Calorie calculation
  const calculateCalories = () => {
    const age = parseInt(calAge, 10) || 25;
    const goal = parseFloat(calGoal);
    const w = parseFloat(bmiWeight) || 70;
    const h = parseFloat(bmiHeight) || 175;

    const bmr = 10 * w + 6.25 * h - 5 * age + (calGender === 'male' ? 5 : -161);
    const tdee = Math.round(bmr * 1.4 + goal);

    setCalScore(`${tdee.toLocaleString()} kcal`);
    setRawCalories(tdee);
    const label = goal < 0 ? 'Deficit' : goal > 0 ? 'Surplus' : 'Maintenance';
    setCalGoalLabel(label);
    dispatch(addToast(`Calorie Goal: ${tdee} kcal`));
  };

  // Step target calculation
  const calculateSteps = () => {
    let steps = stepFitness === 'sedentary' ? 7000 : stepFitness === 'moderate' ? 10000 : 13000;
    if (stepIntent === 'fatloss') steps += 2000;

    setStepScore(`${steps.toLocaleString()} steps`);
    setRawSteps(steps);
    const label = stepIntent === 'fatloss' ? 'Fat Loss' : 'Health';
    setStepLabel(label);
    dispatch(addToast(`Steps: ${steps.toLocaleString()}`));
  };

  // Save calculation to backend strictly linked to logged-in user
  const handleSaveCalculations = async () => {
    if (!user) {
      dispatch(addToast('Please sign in or register to record your weight metrics'));
      dispatch(openAuthModal('login'));
      return;
    }

    const nameToSave = userName.trim() || user.name || user.username;
    const newRecord = {
      userId: user.id,
      userEmail: user.email,
      name: nameToSave,
      height: parseFloat(bmiHeight),
      weight: parseFloat(bmiWeight),
      bmi: parseFloat(bmiScore),
      calories: rawCalories,
      steps: rawSteps,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await dispatch(saveMeasurementRecord(newRecord)).unwrap();
      dispatch(addToast(`Saved metrics for ${nameToSave}`));
      dispatch(fetchRecords({ userId: user.id }));
    } catch (err) {
      dispatch(addToast('Error saving record: ' + (err.message || 'Server error')));
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this measurement record?')) {
      try {
        await dispatch(deleteFitnessItem({ type: 'records', id: recordId })).unwrap();
        dispatch(addToast('Record deleted'));
      } catch {
        dispatch(addToast('Error deleting record'));
      }
    }
  };

  // Filter records strictly belonging to the active user (prevents mixing)
  const userRecords = user
    ? records.filter((r) => r.userId === user.id || (user.email && r.userEmail === user.email))
    : [];
  const recentRecords = userRecords.slice(0, 8);

  return (
    <section id="page-calculators" className="space-y-6">
      {/* Top Welcome / Auth Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personal Health & Weight Management</h2>
          <p className="text-xs text-slate-500">
            Calculate your vital metrics and manage your private body measurement history.
          </p>
        </div>
        {user ? (
          <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded flex items-center space-x-2">
            <i className="fa-solid fa-circle-check text-emerald-600"></i>
            <span>
              Connected as: <b>{user.name || user.username}</b>
            </span>
          </div>
        ) : (
          <button
            onClick={() => dispatch(openAuthModal('login'))}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded flat-btn cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <i className="fa-regular fa-user text-xs"></i>
            <span>Sign In to Save History</span>
          </button>
        )}
      </div>

      {!user && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start space-x-3">
          <i className="fa-solid fa-circle-info text-amber-600 text-base mt-0.5"></i>
          <div>
            <span className="font-semibold block mb-0.5">Guest Mode Active</span>
            You can use the calculators freely. To store your personal weight records securely under your own private account, please{' '}
            <button
              onClick={() => dispatch(openAuthModal('login'))}
              className="font-bold underline hover:text-amber-700 cursor-pointer"
            >
              Log In
            </button>{' '}
            or{' '}
            <button
              onClick={() => dispatch(openAuthModal('register'))}
              className="font-bold underline hover:text-amber-700 cursor-pointer"
            >
              Create an Account
            </button>.
          </div>
        </div>
      )}

      {/* 3 Calculators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. BMI Calculator */}
        <div className="flat-box p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900">
              <span>BMI Calculator</span>
              <i className="fa-solid fa-weight-scale text-slate-400"></i>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Height (cm)</label>
              <input
                id="bmiHeight"
                type="number"
                value={bmiHeight}
                onChange={(e) => setBmiHeight(e.target.value)}
                className="w-full px-3 py-1.5 text-sm flat-input"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Weight (kg)</label>
              <input
                id="bmiWeight"
                type="number"
                value={bmiWeight}
                onChange={(e) => setBmiWeight(e.target.value)}
                className="w-full px-3 py-1.5 text-sm flat-input"
              />
            </div>
            <button
              onClick={calculateBMI}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
            >
              Calculate BMI
            </button>
          </div>
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Score:</span>
              <span id="bmiScore" className="font-bold text-slate-900">
                {bmiScore}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-slate-500">Status:</span>
              <span
                id="bmiCategory"
                className={`font-medium ${
                  bmiCategory === 'Normal' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {bmiCategory}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Calorie Calculator */}
        <div className="flat-box p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900">
              <span>Calorie Calculator</span>
              <i className="fa-solid fa-fire-flame-curved text-slate-400"></i>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Age</label>
                <input
                  id="calAge"
                  type="number"
                  value={calAge}
                  onChange={(e) => setCalAge(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm flat-input"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Gender</label>
                <select
                  id="calGender"
                  value={calGender}
                  onChange={(e) => setCalGender(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm flat-input cursor-pointer"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Goal</label>
              <select
                id="calGoal"
                value={calGoal}
                onChange={(e) => setCalGoal(e.target.value)}
                className="w-full px-2 py-1.5 text-sm flat-input cursor-pointer"
              >
                <option value="-400">Weight Loss (-400 kcal)</option>
                <option value="0">Maintenance (0 kcal)</option>
                <option value="350">Muscle Gain (+350 kcal)</option>
              </select>
            </div>
            <button
              onClick={calculateCalories}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
            >
              Calculate Calories
            </button>
          </div>
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Target:</span>
              <span id="calScore" className="font-bold text-slate-900">
                {calScore}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-slate-500">Plan:</span>
              <span id="calGoalLabel" className="font-medium text-slate-800">
                {calGoalLabel}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Daily Step Target */}
        <div className="flat-box p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900">
              <span>Daily Step Target</span>
              <i className="fa-solid fa-person-walking text-slate-400"></i>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Activity Level</label>
              <select
                id="stepFitness"
                value={stepFitness}
                onChange={(e) => setStepFitness(e.target.value)}
                className="w-full px-2 py-1.5 text-sm flat-input cursor-pointer"
              >
                <option value="sedentary">Low Activity</option>
                <option value="moderate">Moderate Activity</option>
                <option value="active">High Activity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Focus</label>
              <select
                id="stepIntent"
                value={stepIntent}
                onChange={(e) => setStepIntent(e.target.value)}
                className="w-full px-2 py-1.5 text-sm flat-input cursor-pointer"
              >
                <option value="health">General Health</option>
                <option value="fatloss">Fat Loss</option>
              </select>
            </div>
            <button
              onClick={calculateSteps}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
            >
              Estimate Steps
            </button>
          </div>
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Target:</span>
              <span id="stepScore" className="font-bold text-slate-900">
                {stepScore}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-slate-500">Focus:</span>
              <span id="stepLabel" className="font-medium text-slate-800">
                {stepLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Results Form (Linked to Account) */}
      <div className="flat-box p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <div>
          <div className="font-bold text-sm text-slate-900">Save Your Personal Metrics</div>
          <p className="text-xs text-slate-500">
            {user
              ? `Recording measurements under your private account (${user.email || user.username}).`
              : 'Sign in to record and save these calculations to your account history.'}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {user && (
            <input
              id="userNameForRecord"
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="px-3 py-1.5 text-sm flat-input w-full sm:w-48"
            />
          )}
          <button
            onClick={handleSaveCalculations}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn whitespace-nowrap cursor-pointer flex items-center space-x-1.5"
          >
            <i className="fa-solid fa-floppy-disk text-xs"></i>
            <span>{user ? 'Save Record' : 'Sign In & Save'}</span>
          </button>
        </div>
      </div>

      {/* Personal Measurement Table */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
          <span>My Personal Measurement History</span>
          {user && (
            <span className="text-[11px] font-normal text-slate-500">
              Showing records for {user.name || user.username}
            </span>
          )}
        </div>
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
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="userRecentHistoryTable" className="divide-y divide-slate-100">
              {!user ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    <i className="fa-solid fa-lock block text-xl mb-2 text-slate-300"></i>
                    Please{' '}
                    <button
                      onClick={() => dispatch(openAuthModal('login'))}
                      className="text-slate-900 font-semibold underline cursor-pointer"
                    >
                      sign in
                    </button>{' '}
                    to view your private measurement history.
                  </td>
                </tr>
              ) : recentRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-slate-400">
                    You have no saved measurement records yet. Calculate your metrics and click "Save Record" above!
                  </td>
                </tr>
              ) : (
                recentRecords.map((r) => (
                  <tr key={r.id || r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-900">{r.name}</td>
                    <td className="px-4 py-2 font-mono">
                      {r.height} cm / {r.weight} kg
                    </td>
                    <td className="px-4 py-2 font-bold">{r.bmi}</td>
                    <td className="px-4 py-2">{r.calories} kcal</td>
                    <td className="px-4 py-2">{r.steps?.toLocaleString()}</td>
                    <td className="px-4 py-2 text-slate-400">{r.date}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDeleteRecord(r.id)}
                        className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                        title="Delete record"
                      >
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

export default Calculators;

