import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setAdminTab,
  openCrudModal,
  toggleInvoiceStatus,
  deleteFitnessItem,
  fetchRecords,
  fetchBills,
  fetchUsers,
  addToast
} from '../features/FitnessSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { adminTab, bills, users, workouts, tshirts, records } = useSelector(
    (state) => state.fitness
  );

  useEffect(() => {
    dispatch(fetchRecords({ isAdmin: true }));
    dispatch(fetchBills());
    dispatch(fetchUsers());
  }, [dispatch]);

  const tabs = [
    { key: 'bills', label: 'Billing & Invoices Table' },
    { key: 'users', label: 'Users Table' },
    { key: 'workouts', label: 'Workouts Table' },
    { key: 'tshirts', label: 'T-Shirts Table' },
    { key: 'records', label: 'Measurement Records' }
  ];

  const handleToggleBillStatus = async (id) => {
    try {
      const res = await dispatch(toggleInvoiceStatus(id)).unwrap();
      dispatch(addToast(`Invoice ${id} updated to ${res.status}`));
    } catch {
      dispatch(addToast('Error updating invoice status'));
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
      try {
        await dispatch(deleteFitnessItem({ type, id })).unwrap();
        dispatch(addToast('Item deleted successfully'));
      } catch {
        dispatch(addToast('Error deleting item'));
      }
    }
  };

  return (
    <section id="page-admin" className="space-y-6">
      {/* Top Banner */}
      <div className="flat-box p-4 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold">Admin Management Dashboard</h2>
          <p className="text-xs text-slate-400">
            Manage Billing, Users, Workouts, T-Shirts, and Records.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-mono">
          <span>
            Bills: <b id="statTotalBills" className="text-white">{bills.length}</b>
          </span>
          <span>
            Users: <b id="statTotalUsers" className="text-white">{users.length}</b>
          </span>
          <span>
            Workouts: <b id="statTotalWorkouts" className="text-white">{workouts.length}</b>
          </span>
          <span>
            Shirts: <b id="statTotalTshirts" className="text-white">{tshirts.length}</b>
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => dispatch(setAdminTab(tab.key))}
            className={`admin-tab-btn px-3 py-2 text-xs font-semibold whitespace-nowrap cursor-pointer ${
              adminTab === tab.key
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABLE 0: BILLING / ORDERS */}
      {adminTab === 'bills' && (
        <div id="adminTabBills" className="admin-subview flat-box overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <span className="font-bold text-xs text-slate-800">Invoices & Customer Billing</span>
            <button
              onClick={() => dispatch(openCrudModal({ type: 'bills' }))}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
            >
              + Create Bill
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-2">Invoice #</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Items Summary</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="adminBillsTbody" className="divide-y divide-slate-100">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-slate-400">
                      No invoices found. Click "+ Create Bill" to add one.
                    </td>
                  </tr>
                ) : (
                  bills.map((b) => (
                    <tr key={b.id || b._id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {b.customerName}
                        <span className="text-[10px] text-slate-400 block">{b.email}</span>
                      </td>
                      <td className="px-4 py-2 max-w-xs truncate text-slate-600">{b.items}</td>
                      <td className="px-4 py-2 font-mono font-semibold">
                        ${parseFloat(b.total || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-slate-500">{b.date}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            b.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleBillStatus(b.id)}
                          className="text-slate-600 hover:text-black font-medium cursor-pointer"
                        >
                          {b.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                        </button>
                        <button
                          onClick={() => handleDelete('bills', b.id)}
                          className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 1: USERS */}
      {adminTab === 'users' && (
        <div id="adminTabUsers" className="admin-subview flat-box overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <span className="font-bold text-xs text-slate-800">User Accounts</span>
            <button
              onClick={() => dispatch(openCrudModal({ type: 'users' }))}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
            >
              + Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-2">User ID</th>
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="adminUsersTbody" className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-slate-400">
                      No user accounts found. Click "+ Add User" to create one.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id || u._id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-slate-400">{u.id}</td>
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {u.username || u.name}
                      </td>
                      <td className="px-4 py-2 text-slate-500">{u.email}</td>
                      <td className="px-4 py-2 font-mono text-slate-600">{u.phone || 'N/A'}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                          {u.role || 'Member'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => dispatch(openCrudModal({ type: 'users', item: u }))}
                          className="text-slate-600 hover:text-black font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('users', u.id)}
                          className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 2: WORKOUTS */}
      {adminTab === 'workouts' && (
        <div id="adminTabWorkouts" className="admin-subview flat-box overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <span className="font-bold text-xs text-slate-800">Workouts</span>
            <button
              onClick={() => dispatch(openCrudModal({ type: 'workouts' }))}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
            >
              + Add Workout
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Difficulty</th>
                  <th className="px-4 py-2">Duration</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="adminWorkoutsTbody" className="divide-y divide-slate-100">
                {workouts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-slate-400">
                      No workouts available. Click "+ Add Workout" to create one.
                    </td>
                  </tr>
                ) : (
                  workouts.map((w) => (
                    <tr key={w.id || w._id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-900">{w.title}</td>
                      <td className="px-4 py-2">{w.category}</td>
                      <td className="px-4 py-2">{w.difficulty}</td>
                      <td className="px-4 py-2 text-slate-500">{w.duration}</td>
                      <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => dispatch(openCrudModal({ type: 'workouts', item: w }))}
                          className="text-slate-600 hover:text-black font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('workouts', w.id)}
                          className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 3: T-SHIRTS */}
      {adminTab === 'tshirts' && (
        <div id="adminTabTshirts" className="admin-subview flat-box overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <span className="font-bold text-xs text-slate-800">T-Shirt Inventory</span>
            <button
              onClick={() => dispatch(openCrudModal({ type: 'tshirts' }))}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
            >
              + Add T-Shirt
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-2">Shirt</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Color</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="adminTshirtsTbody" className="divide-y divide-slate-100">
                {tshirts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-slate-400">
                      No t-shirts in inventory. Click "+ Add T-Shirt" to add one.
                    </td>
                  </tr>
                ) : (
                  tshirts.map((t) => (
                    <tr key={t.id || t._id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-900">{t.title}</td>
                      <td className="px-4 py-2 font-mono">${parseFloat(t.price).toFixed(2)}</td>
                      <td className="px-4 py-2">{t.stock}</td>
                      <td className="px-4 py-2">{t.color}</td>
                      <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => dispatch(openCrudModal({ type: 'tshirts', item: t }))}
                          className="text-slate-600 hover:text-black font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('tshirts', t.id)}
                          className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 4: MEASUREMENT RECORDS */}
      {adminTab === 'records' && (
        <div id="adminTabRecords" className="admin-subview flat-box overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <span className="font-bold text-xs text-slate-800">Body Measurement Records</span>
            <button
              onClick={() => dispatch(openCrudModal({ type: 'records' }))}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
            >
              + Add Record
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-2">Member</th>
                  <th className="px-4 py-2">H / W</th>
                  <th className="px-4 py-2">BMI</th>
                  <th className="px-4 py-2">Calories</th>
                  <th className="px-4 py-2">Steps</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="adminRecordsTbody" className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-slate-400">
                      No measurement records found.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id || r._id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {r.name}
                        <span className="block text-[10px] text-slate-400 font-mono">
                          ID: {r.userId || 'N/A'} {r.userEmail ? `• ${r.userEmail}` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {r.height}cm / {r.weight}kg
                      </td>
                      <td className="px-4 py-2 font-bold">{r.bmi}</td>
                      <td className="px-4 py-2">{r.calories} kcal</td>
                      <td className="px-4 py-2">{r.steps}</td>
                      <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => dispatch(openCrudModal({ type: 'records', item: r }))}
                          className="text-slate-600 hover:text-black font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('records', r.id)}
                          className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;

