import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import Calculators from './components/Calculators';
import Store from './components/Store';
import Workouts from './components/Workouts';
import AdminDashboard from './components/AdminDashboard';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CrudModal from './components/CrudModal';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';

import { fetchAllFitnessData, setActivePage, setMode, openAuthModal } from './features/FitnessSlice';

// Main FitPulse Platform View
const FitPulseApp = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { activePage, mode } = useSelector((state) => state.fitness);

  useEffect(() => {
    // Fetch initial fitness data from MongoDB backend
    dispatch(fetchAllFitnessData());
  }, [dispatch]);

  // Sync route path with Redux active page
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path === '/admin') {
      dispatch(setMode('admin'));
    } else if (path === '/store') {
      dispatch(setMode('user'));
      dispatch(setActivePage('store'));
    } else if (path === '/workouts') {
      dispatch(setMode('user'));
      dispatch(setActivePage('workouts'));
    } else if (path === '/calculators' || path === '/' || path === '/home') {
      dispatch(setMode('user'));
      dispatch(setActivePage('calculators'));
    } else if (path === '/login') {
      dispatch(setMode('user'));
      dispatch(setActivePage('calculators'));
      dispatch(openAuthModal('login'));
    } else if (path === '/register') {
      dispatch(setMode('user'));
      dispatch(setActivePage('calculators'));
      dispatch(openAuthModal('register'));
    }
  }, [location.pathname, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a]">
      {/* Dynamic Toasts Notification */}
      <ToastContainer />

      {/* Main Header */}
      <Header />

      {/* Main Application Content Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
        {mode === 'admin' ? (
          <AdminDashboard />
        ) : (
          <>
            {activePage === 'calculators' && <Calculators />}
            {activePage === 'store' && <Store />}
            {activePage === 'workouts' && <Workouts />}
          </>
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Authentication Modal (Login / Register / Reset Password) */}
      <AuthModal />

      {/* Admin CRUD Modal */}
      <CrudModal />

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
