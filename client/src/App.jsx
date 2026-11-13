import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import OutsideSystem from './components/OutsideSystem';
import Calculators from './components/Calculators';
import Store from './components/Store';
import Workouts from './components/Workouts';
import AdminDashboard from './components/AdminDashboard';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CrudModal from './components/CrudModal';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';

import {
  fetchAllFitnessData,
  fetchRecords,
  setActivePage,
  setMode,
  openAuthModal,
  addToast
} from './features/FitnessSlice';

// Access Denied / 403 Component for Unauthorized Route Access
const AccessDenied = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleReturn = () => {
    dispatch(setMode('user'));
    dispatch(setActivePage('calculators'));
    navigate('/calculators');
  };

  return (
    <div className="flat-box p-12 text-center max-w-lg mx-auto my-12 space-y-4 bg-white border border-slate-200">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
        <i className="fa-solid fa-lock"></i>
      </div>
      <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
      <p className="text-xs text-slate-600 leading-relaxed">
        The Administrator Management Dashboard requires elevated administrator privileges.
        Your current account does not have access to this section.
      </p>
      <div className="pt-2">
        <button
          onClick={handleReturn}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded flat-btn cursor-pointer inline-flex items-center space-x-2"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
          <span>Return to Personal Dashboard</span>
        </button>
      </div>
    </div>
  );
};

// Main FitPulse Platform View
const FitPulseApp = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { activePage, mode } = useSelector((state) => state.fitness);
  const user = useSelector((state) => state.user.user);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    // Only fetch internal system data if authenticated
    if (user) {
      dispatch(fetchAllFitnessData({ role: user?.role, id: user?.id }));
    }
  }, [dispatch, user]);

  // Sync route path with authentication state and enforce strict role separation
  useEffect(() => {
    const path = location.pathname.toLowerCase();

    // 1. UN-AUTHENTICATED VISITOR (OUTSIDE SYSTEM)
    if (!isAuthenticated) {
      if (path === '/login') {
        dispatch(openAuthModal('login'));
      } else if (path === '/register') {
        dispatch(openAuthModal('register'));
      } else if (path !== '/' && path !== '/welcome') {
        // Visitor tried to access an internal service without logging in
        dispatch(addToast('Please sign in or register to access FitPulse services'));
        dispatch(openAuthModal('login'));
        navigate('/', { replace: true });
      }
      return;
    }

    // 2. AUTHENTICATED ADMINISTRATOR
    if (isAdmin) {
      dispatch(setMode('admin'));
      if (path !== '/admin') {
        navigate('/admin', { replace: true });
      }
      return;
    }

    // 3. AUTHENTICATED REGULAR MEMBER
    dispatch(setMode('user'));
    if (path === '/admin') {
      // Forbidden: regular user cannot access admin
      dispatch(addToast('Access denied: Administrator privileges required'));
    } else if (path === '/store') {
      dispatch(setActivePage('store'));
    } else if (path === '/workouts') {
      dispatch(setActivePage('workouts'));
    } else if (path === '/calculators' || path === '/' || path === '/home' || path === '/login' || path === '/register') {
      dispatch(setActivePage('calculators'));
      if (path !== '/calculators') {
        navigate('/calculators', { replace: true });
      }
      if (user?.id) {
        dispatch(fetchRecords({ userId: user.id }));
      }
    }
  }, [location.pathname, isAuthenticated, isAdmin, user, dispatch, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a]">
      {/* Dynamic Toasts Notification */}
      <ToastContainer />

      {/* Main Header with Specialized Navigation (Outside / Member / Admin) */}
      <Header />

      {/* Main Application Content Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
        {!isAuthenticated ? (
          /* OUTSIDE SYSTEM PAGE (Shown before login & registration) */
          <OutsideSystem />
        ) : isAdmin ? (
          /* DEDICATED ADMIN DASHBOARD */
          <AdminDashboard />
        ) : location.pathname.toLowerCase() === '/admin' ? (
          /* REGULAR USER ATTEMPTING TO ACCESS ADMIN */
          <AccessDenied />
        ) : (
          /* REGULAR USER SERVICES (ONLY APPEAR AFTER USER LOGS IN) */
          <>
            {activePage === 'calculators' && <Calculators />}
            {activePage === 'store' && <Store />}
            {activePage === 'workouts' && <Workouts />}
          </>
        )}
      </main>

      {/* Slide-out Cart Drawer (Only for authenticated members, not for Admin or Guests) */}
      {isAuthenticated && !isAdmin && <CartDrawer />}

      {/* Authentication Modal (Login / Register / Reset Password) */}
      <AuthModal />

      {/* Admin CRUD Modal (Only available for Admin) */}
      {isAdmin && <CrudModal />}

      {/* Footer */}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FitPulseApp />} />
        <Route path="/welcome" element={<FitPulseApp />} />
        <Route path="/home" element={<FitPulseApp />} />
        <Route path="/calculators" element={<FitPulseApp />} />
        <Route path="/store" element={<FitPulseApp />} />
        <Route path="/workouts" element={<FitPulseApp />} />
        <Route path="/admin" element={<FitPulseApp />} />
        <Route path="/login" element={<FitPulseApp />} />
        <Route path="/register" element={<FitPulseApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;