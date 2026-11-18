// ============================================================
// Route: /admin
// Admin page: overview with a card and a count for each section
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// ------------------------------------------------------------
// 2. Constants: sections [data key, url, title, description, icon]
// ------------------------------------------------------------
const SECTIONS = [
  ['bills', '/admin/bills', 'Billing & Invoices', 'Read-only audit log of customer checkout invoices', 'fa-file-invoice-dollar'],
  ['users', '/admin/users', 'Users', 'Create, edit, and manage member and trainer accounts', 'fa-users'],
  ['workouts', '/admin/workouts', 'Workouts', 'Manage workout routines and exercise plans', 'fa-dumbbell'],
  ['tshirts', '/admin/tshirts', 'T-Shirts Inventory', 'Manage store apparel, pricing, and stock', 'fa-shirt'],
  ['records', '/admin/records', 'Measurement Records', 'View and manage member body measurement logs', 'fa-notes-medical']
];

// ------------------------------------------------------------
// 3. DashboardAdmin component
// ------------------------------------------------------------
const DashboardAdmin = () => {
  // --- Data from Redux ---
  const fitness = useSelector((state) => state.fitness);

  // --- Render ---
  return (
    <section className="space-y-6">
      {/* ---------------- Top banner with counts ---------------- */}
      <div className="flat-box p-4 bg-slate-900 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold">Admin Management Dashboard</h2>
          <p className="text-xs text-slate-400">Select a section below to manage database records.</p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-mono">
          {SECTIONS.map(([key, , title]) => (
            <span key={key}>{title}: <b>{fitness[key].length}</b></span>
          ))}
        </div>
      </div>

      {/* ---------------- Section cards ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map(([key, url, title, description, icon]) => (
          <Link key={key} to={url} className="flat-box p-5 hover:border-slate-400 transition-colors flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-base">
                <i className={`fa-solid ${icon}`}></i>
              </div>
              <span className="text-xl font-bold font-mono text-slate-900">{fitness[key].length}</span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default DashboardAdmin;
