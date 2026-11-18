// ============================================================
// Route: /admin/tshirts
// Admin page: CRUD for t-shirts (Create, Read, Update, Delete)
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, updateItem, deleteItem, addToast } from '../features/FitnessSlice';

// ------------------------------------------------------------
// 2. Constants
// ------------------------------------------------------------
const emptyForm = { title: '', price: '', stock: '', color: '', image: '', desc: '' };
const inputClass = 'w-full px-3 py-1.5 text-xs flat-input';

// ------------------------------------------------------------
// 3. TshirtsAdmin component
// ------------------------------------------------------------
const TshirtsAdmin = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const tshirts = useSelector((state) => state.fitness.tshirts);

  // --- Page state ---
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null); // null = creating a new t-shirt
  const [form, setForm] = useState(emptyForm);

  // --- Functions ---

  // Update one field when the admin types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // "+ Add T-Shirt": open an empty form
  const handleAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  // "Edit": open the form with the t-shirt's data
  const handleEdit = (tshirt) => {
    setEditId(tshirt.id);
    setForm({ ...emptyForm, ...tshirt });
    setShowForm(true);
  };

  // "Save": CREATE or UPDATE
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await dispatch(updateItem({ type: 'tshirts', id: editId, data: form })).unwrap();
      } else {
        await dispatch(addItem({ type: 'tshirts', data: form })).unwrap();
      }
      setShowForm(false);
      dispatch(addToast('T-Shirt saved'));
    } catch (message) {
      dispatch(addToast(`Error: ${message}`));
    }
  };

  // "Delete": DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this t-shirt?')) return;

    try {
      await dispatch(deleteItem({ type: 'tshirts', id })).unwrap();
      dispatch(addToast('T-Shirt deleted'));
    } catch (message) {
      dispatch(addToast(`Error: ${message}`));
    }
  };

  // --- Render ---
  return (
    <section className="space-y-4">
      {/* ---------------- READ: t-shirts table ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">T-Shirts ({tshirts.length})</span>
          <button onClick={handleAdd} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs flat-btn cursor-pointer">
            + Add T-Shirt
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-2">Shirt</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Color</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tshirts.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-slate-400">No t-shirts found.</td>
              </tr>
            )}

            {tshirts.map((tshirt) => (
              <tr key={tshirt.id}>
                <td className="px-4 py-2 font-medium">{tshirt.title}</td>
                <td className="px-4 py-2">${tshirt.price}</td>
                <td className="px-4 py-2">{tshirt.stock}</td>
                <td className="px-4 py-2">{tshirt.color}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button onClick={() => handleEdit(tshirt)} className="text-slate-600 hover:text-black cursor-pointer">Edit</button>
                  <button onClick={() => handleDelete(tshirt.id)} className="text-red-600 hover:text-red-800 cursor-pointer">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* ---------------- CREATE / UPDATE form ---------------- */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-lg max-w-md w-full p-4 space-y-3 shadow-xl">
            <h3 className="font-bold text-sm">{editId ? 'Edit T-Shirt' : 'Add T-Shirt'}</h3>

            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className={inputClass} />
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} placeholder="Price" required className={inputClass} />
            <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Stock" required className={inputClass} />
            <input name="color" value={form.color} onChange={handleChange} placeholder="Color" required className={inputClass} />
            <input name="image" type="url" value={form.image} onChange={handleChange} placeholder="Photo URL" required className={inputClass} />
            <input name="desc" value={form.desc} onChange={handleChange} placeholder="Description" className={inputClass} />

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 border border-slate-200 text-xs cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white text-xs cursor-pointer">Save</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default TshirtsAdmin;
