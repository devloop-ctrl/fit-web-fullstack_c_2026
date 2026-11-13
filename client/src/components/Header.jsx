import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setActivePage, setMode, setAdminTab, openAuthModal, addToast, clearUserRecords } from '../features/FitnessSlice';
import { toggleCartDrawer } from '../features/CartSlice';
import { logout } from '../features/UserSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activePage, mode, adminTab } = useSelector((state) => state.fitness);
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);

  const isAdmin = user && user.role === 'Admin';
  const isMember = user && user.role !== 'Admin';
  const isGuest = !user;

  const cartCount = cartItems.reduce((acc, item) => acc + (item.qty || 0), 0);

  const handleUserNav = (page) => {
    dispatch(setMode('user'));
    dispatch(setActivePage(page));
    navigate(`/${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminNav = (tabKey) => {
    dispatch(setMode('admin'));
    dispatch(setAdminTab(tabKey));
    navigate('/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUserRecords());
    dispatch(setMode('user'));
    dispatch(setActivePage('outside'));
    dispatch(addToast('You have signed out. Returned to Outside System.'));
    navigate('/');
  };

  // ----------------------------------------------------------------------
  // 1. DEDICATED ADMIN NAVIGATION BAR (NO CALCULATORS, NO T-SHIRTS, NO WORKOUTS, NO CART)
  // ----------------------------------------------------------------------
  if (isAdmin) {
    return (
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Admin Brand Logo */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none"
            onClick={() => handleAdminNav('bills')}
          >
            <div className="w-8 h-8 bg-amber-500 text-black flex items-center justify-center rounded font-bold">
              <i className="fa-solid fa-shield-halved text-sm"></i>
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight leading-none text-white">
                FitPulse <span className="text-amber-400 font-semibold text-xs tracking-normal uppercase ml-1">Admin Portal</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Control & Management Panel</span>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <nav id="adminNav" className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => handleAdminNav('bills')}
              className={`px-3 py-1.5 text-xs font-semibold rounded flat-btn cursor-pointer transition-colors ${
                adminTab === 'bills'
                  ? 'bg-amber-500 text-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <i className="fa-solid fa-file-invoice-dollar mr-1.5 text-[11px]"></i>
              Invoices (Audit)
            </button>
            <button
              onClick={() => handleAdminNav('users')}
              className={`px-3 py-1.5 text-xs font-semibold rounded flat-btn cursor-pointer transition-colors ${
                adminTab === 'users'
                  ? 'bg-amber-500 text-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <i className="fa-solid fa-users mr-1.5 text-[11px]"></i>
              Users
            </button>
            <button
              onClick={() => handleAdminNav('workouts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded flat-btn cursor-pointer transition-colors ${
                adminTab === 'workouts'
                  ? 'bg-amber-500 text-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <i className="fa-solid fa-dumbbell mr-1.5 text-[11px]"></i>
              Workouts
            </button>
            <button
              onClick={() => handleAdminNav('tshirts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded flat-btn cursor-pointer transition-colors ${
                adminTab === 'tshirts'
                  ? 'bg-amber-500 text-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <i className="fa-solid fa-shirt mr-1.5 text-[11px]"></i>
              Inventory
            </button>
            <button
              onClick={() => handleAdminNav('records')}
              className={`px-3 py-1.5 text-xs font-semibold rounded flat-btn cursor-pointer transition-colors ${
                adminTab === 'records'
                  ? 'bg-amber-500 text-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <i className="fa-solid fa-notes-medical mr-1.5 text-[11px]"></i>
              All Records
            </button>
          </nav>

          {/* Admin User Info & Logout */}
          <div className="flex items-center space-x-2">
            <span className="bg-amber-950/80 border border-amber-600/40 text-amber-300 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1.5">
              <i className="fa-solid fa-circle-check text-[10px] text-amber-400"></i>
              <span>{user.name || user.username}</span>
              <span className="text-[10px] bg-amber-500 text-black px-1 py-0.2 rounded font-bold uppercase ml-1">
                Admin
              </span>
            </span>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded flat-btn cursor-pointer flex items-center space-x-1.5 transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket text-xs"></i>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // ----------------------------------------------------------------------
  // 2. REGULAR MEMBER NAVIGATION BAR (SERVICES VISIBLE AFTER LOGIN)
  // ----------------------------------------------------------------------
  if (isMember) {
    return (
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer select-none"
            onClick={() => handleUserNav('calculators')}
          >
            <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded">
              <i className="fa-solid fa-bolt text-sm"></i>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">FitPulse</span>
              <span className="hidden sm:inline text-[10px] text-slate-400 block -mt-1 font-mono">Member Dashboard</span>
            </div>
          </div>

          {/* Member Navigation Tabs */}
          <nav id="userNav" className="flex items-center space-x-1">
            <button
              onClick={() => handleUserNav('calculators')}
              className={`nav-link px-3 py-1.5 text-xs sm:text-sm font-medium rounded flat-btn cursor-pointer ${
                activePage === 'calculators'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fa-solid fa-weight-scale mr-1 text-xs"></i>
              Calculators
            </button>
            <button
              onClick={() => handleUserNav('store')}
              className={`nav-link px-3 py-1.5 text-xs sm:text-sm font-medium rounded flat-btn cursor-pointer ${
                activePage === 'store'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fa-solid fa-shirt mr-1 text-xs"></i>
              T-Shirts
            </button>
            <button
              onClick={() => handleUserNav('workouts')}
              className={`nav-link px-3 py-1.5 text-xs sm:text-sm font-medium rounded flat-btn cursor-pointer ${
                activePage === 'workouts'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fa-solid fa-dumbbell mr-1 text-xs"></i>
              Workouts
            </button>
          </nav>

          {/* Right Header: Cart + User Profile + Logout */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => dispatch(toggleCartDrawer(true))}
              className="px-3 py-1.5 flat-box hover:bg-slate-50 text-xs sm:text-sm font-medium flex items-center space-x-2 cursor-pointer"
            >
              <i className="fa-solid fa-cart-shopping text-xs"></i>
              <span className="hidden sm:inline">Cart</span>
              <span
                id="cartCountBadge"
                className="bg-slate-900 text-white text-xs px-1.5 py-0.2 rounded font-mono"
              >
                {cartCount}
              </span>
            </button>

            <div className="flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded text-slate-800 text-xs font-semibold">
              <i className="fa-regular fa-user text-xs"></i>
              <span className="max-w-[100px] truncate">{user.name || user.username}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="text-xs text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 cursor-pointer"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // ----------------------------------------------------------------------
  // 3. OUTSIDE SYSTEM NAVIGATION BAR (VISITOR NOT LOGGED IN YET)
  // ----------------------------------------------------------------------
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer select-none"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded">
            <i className="fa-solid fa-bolt text-sm"></i>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">FitPulse</span>
            <span className="hidden sm:inline text-[10px] text-slate-400 block -mt-1 font-mono">
              Health & Fitness Platform
            </span>
          </div>
        </div>

        {/* Outside System Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs">
          <i className="fa-solid fa-lock text-[10px] text-amber-600"></i>
          <span className="font-medium">Outside System • Log In to Access Services</span>
        </div>

        {/* Authentication Triggers */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => dispatch(openAuthModal('login'))}
            className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded flat-btn cursor-pointer flex items-center space-x-1.5"
          >
            <i className="fa-solid fa-right-to-bracket text-xs"></i>
            <span>Sign In</span>
          </button>
          <button
            onClick={() => dispatch(openAuthModal('register'))}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded flat-btn cursor-pointer flex items-center space-x-1.5"
          >
            <i className="fa-solid fa-user-plus text-xs"></i>
            <span>Register</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;