import { Link } from 'react-router-dom';

const SERVICES = [
  ['fa-weight-scale', 'emerald', 'Personal Health & Weight Management', 'Calculate BMI, daily calorie targets, and activity steps. Every record is privately stored under your account.'],
  ['fa-dumbbell', 'blue', 'Targeted Workout Programs', 'Browse structured workout routines for Upper Body, Lower Body, and Cardio with exercise guides.'],
  ['fa-shirt', 'purple', 'Training T-Shirt Store & Cart', 'Explore workout apparel, manage your cart, and complete orders with invoice tracking.']
];

const Home = () => (
  <div className="space-y-10 py-4 max-w-5xl mx-auto">
    <div className="flat-box p-8 sm:p-12 text-center space-y-6">
      <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl">
        <i className="fa-solid fa-bolt"></i>
      </div>
      <div className="max-w-2xl mx-auto space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">FitPulse Health &amp; Fitness Platform</h1>
        <p className="text-sm text-slate-600">
          Personal health and weight tracking, workout routines, and training apparel. Sign in to access the services.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link to="/login" className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flat-btn">
          <i className="fa-solid fa-right-to-bracket text-xs mr-2"></i>Sign In to Access Services
        </Link>
        <Link to="/register" className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold flat-btn">
          <i className="fa-solid fa-user-plus text-xs mr-2"></i>Register New Account
        </Link>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {SERVICES.map(([icon, color, title, text]) => (
        <div key={title} className="flat-box p-5 space-y-3">
          <div className={`w-10 h-10 bg-${color}-50 text-${color}-700 rounded-lg flex items-center justify-center text-lg`}>
            <i className={`fa-solid ${icon}`}></i>
          </div>
          <h3 className="font-bold text-sm text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600">{text}</p>
          <span className={`text-[11px] font-semibold text-${color}-700`}>
            <i className="fa-solid fa-lock text-[10px] mr-1"></i>Available after sign in
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default Home;

