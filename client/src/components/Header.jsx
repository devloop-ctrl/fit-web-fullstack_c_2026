import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActivePage, toggleMode, openAuthModal, addToast } from '../features/FitnessSlice';
import { toggleCartDrawer } from '../features/CartSlice';
import { logout } from '../features/UserSlice';

const Header = () => {
  const dispatch = useDispatch();
  const { activePage, mode } = useSelector((state) => state.fitness);
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);

  const cartCount = cartItems.reduce((acc, item) => acc + (item.qty || 0), 0);

  const handleNav = (page) => {
    dispatch(setActivePage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModeToggle = () => {
    dispatch(toggleMode());
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(addToast('You have logged out'));
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
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

        {/* Navigation Tabs */}
        <nav
          id="userNav"
          className={`hidden md:flex items-center space-x-1 transition-opacity ${
            mode === 'admin' ? 'opacity-30 pointer-events-none' : ''
          }`}
        >
          <button
            onClick={() => handleNav('calculators')}
            className={`nav-link px-3 py-1.5 text-sm font-medium rounded flat-btn ${
              mode !== 'admin' && activePage === 'calculators'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Calculators
          </button>
          <button
            onClick={() => handleNav('store')}
            className={`nav-link px-3 py-1.5 text-sm font-medium rounded flat-btn ${
              mode !== 'admin' && activePage === 'store'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            T-Shirts
          </button>
          <button
            onClick={() => handleNav('workouts')}
            className={`nav-link px-3 py-1.5 text-sm font-medium rounded flat-btn ${
              mode !== 'admin' && activePage === 'workouts'
                ? 'bg-slate-100 text-slate-900'
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

          {/* Admin Panel Toggle */}
          <button
            id="modeToggleBtn"
            onClick={handleModeToggle}
            className={`px-3 py-1.5 text-white text-sm font-medium rounded flat-btn flex items-center space-x-1.5 cursor-pointer ${
              mode === 'admin'
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-sliders text-xs"></i>
            <span>{mode === 'admin' ? 'Exit Admin' : 'Admin Panel'}</span>
          </button>

          {/* Dynamic Auth Button / User Profile */}
          <div id="authHeaderContainer">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-800">
                  <i className="fa-regular fa-user mr-1"></i>
                  {user.username || user.name}
                </span>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="text-xs text-red-600 hover:text-red-800 px-1 py-1 cursor-pointer"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <button
                onClick={() => dispatch(openAuthModal('login'))}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-medium rounded flat-btn cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
