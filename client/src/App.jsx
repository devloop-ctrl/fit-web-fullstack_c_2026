// ============================================================
// App.jsx: decides which pages each type of visitor can open
//   Guest  -> public pages
//   Member -> member pages (*-member.jsx)
//   Admin  -> admin pages  (*-admin.jsx)
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { fetchData } from './features/FitnessSlice';

// Shared layout parts
import Header from './components/Header';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import CartDrawer from './components/CartDrawer';

// Public pages
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import ResetPassword from './pages/reset-password';

// Member pages
import CalculatorsMember from './pages/calculators-member';
import StoreMember from './pages/store-member';
import WorkoutsMember from './pages/workouts-member';
import ProfileMember from './pages/profile-member';
import AccessDeniedMember from './pages/access-denied-member';

// Admin pages
import DashboardAdmin from './pages/dashboard-admin';
import BillsAdmin from './pages/bills-admin';
import UsersAdmin from './pages/users-admin';
import WorkoutsAdmin from './pages/workouts-admin';
import TshirtsAdmin from './pages/tshirts-admin';
import RecordsAdmin from './pages/records-admin';

// ------------------------------------------------------------
// 2. Routes for each type of visitor
// ------------------------------------------------------------

// Guest (not signed in)
const guestRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </>
);

// Member (signed in, normal user)
const memberRoutes = (
  <>
    <Route path="/calculators" element={<CalculatorsMember />} />
    <Route path="/store" element={<StoreMember />} />
    <Route path="/workouts" element={<WorkoutsMember />} />
    <Route path="/profile" element={<ProfileMember />} />
    <Route path="/admin/*" element={<AccessDeniedMember />} />
    <Route path="*" element={<Navigate to="/calculators" replace />} />
  </>
);

// Admin (signed in, role = Admin)
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

// ------------------------------------------------------------
// 3. App component
// ------------------------------------------------------------
const App = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isAdmin = user?.role === 'Admin';

  // --- Effects ---
  // Load the database data every time a user signs in
  useEffect(() => {
    if (user) dispatch(fetchData(user));
  }, [dispatch, user]);

  // --- Pick the routes for the current visitor ---
  const routes = !user ? guestRoutes : isAdmin ? adminRoutes : memberRoutes;

  // --- Render ---
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <ToastContainer />
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
          <Routes>{routes}</Routes>
        </main>

        {/* The cart is only for members */}
        {user && !isAdmin && <CartDrawer />}

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
