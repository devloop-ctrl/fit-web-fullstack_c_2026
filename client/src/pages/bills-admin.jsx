// ============================================================
// Route: /admin/bills
// Admin page: read-only list of invoices created by member checkouts
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useSelector } from 'react-redux';

// ------------------------------------------------------------
// 2. BillsAdmin component
// ------------------------------------------------------------
const BillsAdmin = () => {
  // --- Data from Redux ---
  const bills = useSelector((state) => state.fitness.bills);

  // --- Render ---
  return (
    <section className="space-y-4">
      <div className="flat-box overflow-hidden">
        {/* ---------------- Title ---------------- */}
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <span className="font-bold text-xs text-slate-800">Billing &amp; Invoices ({bills.length})</span>
            <p className="text-[11px] text-slate-500">System-generated order invoices (read-only audit).</p>
          </div>
          <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-mono rounded">
            <i className="fa-solid fa-lock text-[10px] mr-1"></i>Read-Only Audit
          </span>
        </div>

        {/* ---------------- Table ---------------- */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2">Invoice #</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-slate-400">No invoices found.</td>
                </tr>
              )}

              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono font-bold text-slate-900">{bill.id}</td>
                  <td className="px-4 py-2">
                    {bill.customerName}
                    <span className="block text-[10px] text-slate-400">{bill.email}</span>
                  </td>
                  <td className="px-4 py-2 max-w-xs truncate text-slate-600">{bill.items}</td>
                  <td className="px-4 py-2 font-mono font-semibold">${Number(bill.total).toFixed(2)}</td>
                  <td className="px-4 py-2 text-slate-500">{bill.date}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default BillsAdmin;
