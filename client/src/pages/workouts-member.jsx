import { useSelector, useDispatch } from 'react-redux';
import { setWorkoutCategory, addToast } from '../features/FitnessSlice';

const CATEGORIES = ['all', 'Upper Body', 'Lower Body', 'Cardio'];

const WorkoutsMember = () => {
  const dispatch = useDispatch();
  const { workouts, workoutCategory } = useSelector((state) => state.fitness);
  const visible = workoutCategory === 'all' ? workouts : workouts.filter((w) => w.category === workoutCategory);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Workout Routines</h2>
          <p className="text-xs text-slate-500">Select a muscle group to view the exercise routine.</p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => dispatch(setWorkoutCategory(cat))}
              className={`px-3 py-1 text-xs font-medium flat-btn cursor-pointer ${
                workoutCategory === cat ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && <p className="text-center text-xs text-slate-400 py-10">No workouts in this category.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visible.map((w) => (
          <div key={w.id} className="flat-box p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">{w.category}</span>
                <span className="text-slate-400 font-mono">{w.duration}</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{w.title}</h3>
              <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 font-mono">{w.exercises}</div>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-500">Level: <strong className="text-slate-800">{w.difficulty}</strong></span>
              <button
                onClick={() => dispatch(addToast(`Workout plan queued: ${w.title}`))}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs flat-btn cursor-pointer"
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkoutsMember;

