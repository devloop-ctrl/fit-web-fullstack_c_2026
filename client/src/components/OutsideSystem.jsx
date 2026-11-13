import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openAuthModal, setMode, setActivePage, addToast, fetchRecords, fetchAllFitnessData } from '../features/FitnessSlice';
import { login } from '../features/UserSlice';

const OutsideSystem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleQuickLogin = async (username, password) => {
    try {
      const result = await dispatch(login({ username, password })).unwrap();
      const authenticatedUser = result.user;

      if (authenticatedUser?.role === 'Admin') {
        dispatch(setMode('admin'));
        dispatch(fetchAllFitnessData({ role: 'Admin', id: authenticatedUser.id }));
        dispatch(addToast(`Welcome Administrator, ${authenticatedUser.name || authenticatedUser.username}!`));
        navigate('/admin');
      } else {
        dispatch(setMode('user'));
        dispatch(setActivePage('calculators'));
        dispatch(fetchRecords({ userId: authenticatedUser.id }));
        dispatch(addToast(`Welcome, ${authenticatedUser.name || authenticatedUser.username}! Services are now available.`));
        navigate('/calculators');
      }
    } catch (err) {
      dispatch(addToast('Quick login failed: ' + (typeof err === 'string' ? err : 'Invalid credentials')));
    }
  };

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Outside System Notification Bar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2">
          <span className="bg-amber-500 text-black px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
            Outside System
          </span>
          <span className="text-slate-300">
            Authentication Required: Internal services (Calculators, Store, Workouts) are locked until you sign in.
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => dispatch(openAuthModal('login'))}
            className="text-white hover:text-amber-400 font-semibold underline cursor-pointer"
          >
            Sign In
          </button>
          <span className="text-slate-500">|</span>
          <button
            onClick={() => dispatch(openAuthModal('register'))}
            className="text-white hover:text-amber-400 font-semibold underline cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Hero Welcome Section */}
      <div className="flat-box p-8 sm:p-12 text-center bg-white border border-slate-200 space-y-6">
        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-sm">
          <i className="fa-solid fa-bolt"></i>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            FitPulse Health & Fitness Platform
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to the entry portal. FitPulse provides personal health and weight tracking,
            workout routines, and training apparel under strictly separated user and administrator environments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => dispatch(openAuthModal('login'))}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded flat-btn cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
          >
            <i className="fa-solid fa-right-to-bracket text-xs"></i>
            <span>Sign In to Access Services</span>
          </button>
          <button
            onClick={() => dispatch(openAuthModal('register'))}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded flat-btn cursor-pointer flex items-center justify-center space-x-2"
          >
            <i className="fa-solid fa-user-plus text-xs"></i>
            <span>Register New Account</span>
          </button>
        </div>
      </div>

      {/* Platform Services Overview */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Protected Services (Available After Login)</h2>
          <p className="text-xs text-slate-500">Sign in with an individual account to access these features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Service 1 */}
          <div className="flat-box p-5 bg-white border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center text-lg">
              <i className="fa-solid fa-weight-scale"></i>
            </div>
            <h3 className="font-bold text-sm text-slate-900">Personal Health & Weight Management</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculate BMI, daily calorie targets, and activity steps. Every record is privately stored under your individual account.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                <i className="fa-solid fa-lock text-[10px]"></i>
                <span>Private & account-scoped</span>
              </span>
            </div>
          </div>

          {/* Service 2 */}
          <div className="flat-box p-5 bg-white border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center text-lg">
              <i className="fa-solid fa-dumbbell"></i>
            </div>
            <h3 className="font-bold text-sm text-slate-900">Targeted Workout Programs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse structured workout routines categorized into Upper Body, Lower Body, and Cardio with detailed exercise guides.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-blue-700 flex items-center space-x-1">
                <i className="fa-solid fa-lock text-[10px]"></i>
                <span>Available to Members</span>
              </span>
            </div>
          </div>

          {/* Service 3 */}
          <div className="flat-box p-5 bg-white border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center text-lg">
              <i className="fa-solid fa-shirt"></i>
            </div>
            <h3 className="font-bold text-sm text-slate-900">Training T-Shirt Store & Cart</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore premium workout apparel, manage your cart, and complete orders with verified user invoice tracking.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-purple-700 flex items-center space-x-1">
                <i className="fa-solid fa-lock text-[10px]"></i>
                <span>Requires User Sign In</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Types & Fast Testing Access */}
      <div className="flat-box p-6 bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Account Role Architecture & Fast Access</h3>
            <p className="text-xs text-slate-500">Test the two separated user flows immediately</p>
          </div>
          <span className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-600">
            2 Distinct Roles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Member Role Card */}
          <div className="bg-white p-4 rounded border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">1. Regular Member Account</span>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                  Member
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Sees Calculators, Store, Workouts & Cart. Manages personal weight history with complete data isolation.
              </p>
              <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded">
                User: <b>alexsmith</b> | Pass: <b>password123</b>
              </div>
            </div>
            <button
              onClick={() => handleQuickLogin('alexsmith', 'password123')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded flat-btn cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <i className="fa-solid fa-user text-xs"></i>
              <span>Enter as Regular Member</span>
            </button>
          </div>

          {/* Admin Role Card */}
          <div className="bg-white p-4 rounded border border-amber-200 bg-amber-50/20 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">2. Administrator Account</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Has dedicated Admin navigation (No cart, no user store/calculators tabs). Read-only billing audit, manages users, workouts, inventory, and all member weight records.
              </p>
              <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded">
                User: <b>admin</b> | Pass: <b>password123</b>
              </div>
            </div>
            <button
              onClick={() => handleQuickLogin('admin', 'password123')}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded flat-btn cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <i className="fa-solid fa-shield-halved text-xs"></i>
              <span>Enter as Administrator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutsideSystem;
