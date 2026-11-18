import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { fetchAll } from './features/FitnessSlice';

import Header from './components/Header';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import CartDrawer from './components/CartDrawer';

import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import ResetPassword from './pages/reset-password';

import CalculatorsMember from './pages/calculators-member';
import StoreMember from './pages/store-member';
import WorkoutsMember from './pages/workouts-member';
import AccessDeniedMember from './pages/access-denied-member';

import DashboardAdmin from './pages/dashboard-admin';
import BillsAdmin from './pages/bills-admin';
import UsersAdmin from './pages/users-admin';
import WorkoutsAdmin from './pages/workouts-admin';
import TshirtsAdmin from './pages/tshirts-admin';
import RecordsAdmin from './pages/records-admin';

const guestRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </>
);

const memberRoutes = (
  <>
    <Route path="/calculators" element={<CalculatorsMember />} />
    <Route path="/store" element={<StoreMember />} />
    <Route path="/workouts" element={<WorkoutsMember />} />
    <Route path="/admin/*" element={<AccessDeniedMember />} />
    <Route path="*" element={<Navigate to="/calculators" replace />} />
  </>
);

const adminRoutes = (
  <>
    <Route path="/admin" element={<DashboardAdmin />} />
    <Route path="/admin/bills" element={<BillsAdmin />} />
    <Route path="/admin/users" element={<UsersAdmin />} />
    <Route path="/admin/workouts" element={<WorkoutsAdmin />} />
    <Route path="/admin/tshirts" element={<TshirtsAdmin />} />
    <Route path="/admin/records" element={<RecordsAdmin />} />
    <Route path="*" element={<Navigate to="/admin" replace />} />
  </>
);

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (user) dispatch(fetchAll(user));
  }, [dispatch, user]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <ToastContainer />
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
          <Routes>{!user ? guestRoutes : isAdmin ? adminRoutes : memberRoutes}</Routes>
        </main>
        {user && !isAdmin && <CartDrawer />}
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
