// ============================================================
// Route: /admin/* (when a normal member tries to open an admin page)
// Access denied page
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { Link } from 'react-router-dom';

// ------------------------------------------------------------
// 2. AccessDeniedMember component
// ------------------------------------------------------------
const AccessDeniedMember = () => (
  <div className="flat-box p-12 text-center max-w-lg mx-auto my-12 space-y-4">
    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
      <i className="fa-solid fa-lock"></i>
    </div>

    <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
    <p className="text-xs text-slate-600">The Administrator Dashboard requires administrator privileges.</p>

    <Link to="/calculators" className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn">
      <i className="fa-solid fa-arrow-left mr-2"></i>Return to Personal Dashboard
    </Link>
  </div>
);

export default AccessDeniedMember;
