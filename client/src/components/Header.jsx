// ============================================================
// Header: the top bar. It changes depending on who is signed in
//   Admin  -> admin links
//   Member -> member links + cart button
//   Guest  -> sign in / register buttons
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { addToast } from '../features/FitnessSlice';
import { toggleCartDrawer } from '../features/CartSlice';
import { logout } from '../features/UserSlice';

// ------------------------------------------------------------
// 2. Constants: navigation links [url, label, icon]
// ------------------------------------------------------------
const ADMIN_LINKS = [
  ['/admin', 'Dashboard', 'fa-gauge'],
  ['/admin/bills', 'Invoices', 'fa-file-invoice-dollar'],
  ['/admin/users', 'Users', 'fa-users'],
  ['/admin/workouts', 'Workouts', 'fa-dumbbell'],
  ['/admin/tshirts', 'Inventory', 'fa-shirt'],
  ['/admin/records', 'Records', 'fa-notes-medical']
];

const MEMBER_LINKS = [
  ['/calculators', 'Calculators', 'fa-weight-scale'],
  ['/store', 'T-Shirts', 'fa-shirt'],
  ['/workouts', 'Workouts', 'fa-dumbbell']
];

// ------------------------------------------------------------
// 3. Small part: the logo (used by member and guest headers)
// ------------------------------------------------------------
const Logo = ({ subtitle, to }) => (
  <Link to={to} className="flex items-center space-x-2 select-none">
    <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded">
      <i className="fa-solid fa-bolt text-sm"></i>
    </div>
    <div>
      <span className="text-lg font-bold tracking-tight text-slate-900">FitPulse</span>
      <span className="hidden sm:block text-[10px] text-slate-400 -mt-1 font-mono">{subtitle}</span>
    </div>
  </Link>
);

// ------------------------------------------------------------
// 4. Header component
// ------------------------------------------------------------
const Header = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.qty, 0));

  // --- Functions ---

  // Sign out and go back to the home page
  const handleLogout = () => {
    dispatch(logout());
    dispatch(addToast('You have signed out.'));
    navigate('/');
  };

  // --- Render: ADMIN header ---
  if (user?.role === 'Admin') {
    return (
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* ---------------- Logo ---------------- */}
          <Link to="/admin" className="flex items-center space-x-2.5 select-none">
            <div className="w-8 h-8 bg-amber-500 text-black flex items-center justify-center rounded">
              <i className="fa-solid fa-shield-halved text-sm"></i>
            </div>
            <div className="text-base font-extrabold tracking-tight text-white">
              FitPulse <span className="text-amber-400 font-semibold text-xs uppercase ml-1">Admin</span>
            </div>
          </Link>

          {/* ---------------- Admin links ---------------- */}
          <nav className="hidden lg:flex items-center space-x-1">
            {ADMIN_LINKS.map(([to, label, icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-xs font-semibold flat-btn ${
                    isActive ? 'bg-amber-500 text-black' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <i className={`fa-solid ${icon} mr-1.5 text-[11px]`}></i>{label}
              </NavLink>
            ))}
          </nav>

          {/* ---------------- User name + sign out ---------------- */}
          <div className="flex items-center space-x-2">
            <span className="border border-amber-600/40 text-amber-300 text-xs px-2.5 py-1 rounded-md font-semibold">
              {user.name || user.username}
            </span>
            <button onClick={handleLogout} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flat-btn cursor-pointer">
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="hidden sm:inline ml-1.5">Sign Out</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // --- Render: MEMBER header ---
  if (user) {
    return (
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* ---------------- Logo ---------------- */}
          <Logo subtitle="Member Dashboard" to="/calculators" />

          {/* ---------------- Member links ---------------- */}
          <nav className="flex items-center space-x-1">
            {MEMBER_LINKS.map(([to, label, icon]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-xs sm:text-sm font-medium flat-btn ${
                    isActive ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <i className={`fa-solid ${icon} mr-1 text-xs`}></i>{label}
              </NavLink>
            ))}
          </nav>

          {/* ---------------- Cart + user name + sign out ---------------- */}
          <div className="flex items-center space-x-2">
            <button onClick={() => dispatch(toggleCartDrawer(true))} className="px-3 py-1.5 flat-box hover:bg-slate-50 text-xs sm:text-sm font-medium flex items-center space-x-2 cursor-pointer">
              <i className="fa-solid fa-cart-shopping text-xs"></i>
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-slate-900 text-white text-xs px-1.5 rounded font-mono">{cartCount}</span>
            </button>
            <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 text-xs font-semibold max-w-[120px] truncate">
              <i className="fa-regular fa-user mr-1.5"></i>{user.name || user.username}
            </span>
            <button onClick={handleLogout} title="Sign Out" className="text-xs text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 cursor-pointer">
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // --- Render: GUEST header ---
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* ---------------- Logo ---------------- */}
        <Logo subtitle="Health & Fitness Platform" to="/" />

        {/* ---------------- Sign in / Register ---------------- */}
        <div className="flex items-center space-x-2">
          <Link to="/login" className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flat-btn">
            <i className="fa-solid fa-right-to-bracket mr-1.5"></i>Sign In
          </Link>
          <Link to="/register" className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn">
            <i className="fa-solid fa-user-plus mr-1.5"></i>Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
