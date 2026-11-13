import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setActivePage, setMode, openAuthModal, addToast, clearUserRecords } from '../features/FitnessSlice';
import { toggleCartDrawer } from '../features/CartSlice';
import { logout } from '../features/UserSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activePage, mode } = useSelector((state) => state.fitness);
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);

  const isAdmin = user?.role === 'Admin';
  const cartCount = cartItems.reduce((acc, item) => acc + (item.qty || 0), 0);

  const handleNav = (page) => {
    dispatch(setMode('user'));
    dispatch(setActivePage(page));
    navigate(`/${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAdminMode = () => {
    if (!isAdmin) {
      dispatch(addToast('Access denied: Administrator privileges required'));
      return;
    }

    if (mode === 'admin') {
      dispatch(setMode('user'));
      dispatch(setActivePage('calculators'));
      navigate('/calculators');
    } else {
      dispatch(setMode('admin'));
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUserRecords());
    dispatch(setMode('user'));
    dispatch(setActivePage('calculators'));
    dispatch(addToast('You have logged out successfully'));
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer select-none"
          onClick={() => handleNav('calculators')}
        >
          <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded">
            <i className="fa-solid fa-bolt text-sm"></i>
          </div>
          <span className="text-lg font-bold tracking-tight">FitPulse</span>
        </div>

        {/* Navigation Tabs (Only active in user view) */}
        <nav
          id="userNav"
          className={`hidden md:flex items-center space-x-1 transition-opacity ${
            mode === 'admin' ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          <button
            onClick={() => handleNav('calculators')}
            className={`nav-link px-3 py-1.5 text-sm font-medium rounded flat-btn cursor-pointer ${
              mode !== 'admin' && activePage === 'calculators'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Calculators
          </button>
          <button
            onClick={() => handleNav('store')}
            className={`nav-link px-3 py-1.5 text-sm font-medium rounded flat-btn cursor-pointer ${
              mode !== 'admin' && activePage === 'store'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            T-Shirts
          </button>
          <button
            onClick={() => handleNav('workouts')}
            className={`nav-link px-3 py-1.5 text-sm font-medium rounded flat-btn cursor-pointer ${
              mode !== 'admin' && activePage === 'workouts'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Workouts
          </button>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-2">
          {/* Cart Drawer Trigger */}
          <button
            onClick={() => dispatch(toggleCartDrawer(true))}
            className="px-3 py-1.5 flat-box hover:bg-slate-50 text-sm font-medium flex items-center space-x-2 cursor-pointer"
          >
            <i className="fa-solid fa-cart-shopping text-xs"></i>
            <span>Cart</span>
            <span
              id="cartCountBadge"
              className="bg-slate-900 text-white text-xs px-1.5 py-0.2 rounded font-mono"
            >
              {cartCount}
            </span>
          </button>

          {/* Admin Panel Toggle - STRICTLY VISIBLE ONLY TO ADMINS */}
          {isAdmin && (
            <button
              id="modeToggleBtn"
              onClick={handleToggleAdminMode}
              className={`px-3 py-1.5 text-white text-xs font-semibold rounded flat-btn flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                mode === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <i className="fa-solid fa-shield-halved text-xs"></i>
              <span>{mode === 'admin' ? 'Exit Admin' : 'Admin Dashboard'}</span>
            </button>
          )}

          {/* Dynamic Auth Button / User Profile */}
          <div id="authHeaderContainer">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded text-slate-800">
                  <i className="fa-regular fa-user text-xs"></i>
                  <span className="text-xs font-semibold max-w-[120px] truncate">
                    {user.name || user.username}
                  </span>
                  {isAdmin ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                      Admin
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 text-[10px] px-1 py-0.2 rounded font-medium">
                      Member
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="text-xs text-red-600 hover:text-red-800 px-1.5 py-1 rounded hover:bg-red-50 cursor-pointer"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => dispatch(openAuthModal('login'))}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium rounded flat-btn cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => dispatch(openAuthModal('register'))}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded flat-btn cursor-pointer hidden sm:inline-block"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
