// ============================================================
// Route: /admin/tshirts
// Admin page: list, add, edit, and delete t-shirts (store inventory)
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveItem, deleteItem, addToast } from '../features/FitnessSlice';

// ------------------------------------------------------------
// 2. Constants
// ------------------------------------------------------------
const EMPTY_FORM = { title: '', price: '', stock: '', color: '', image: '', desc: '' };
const INPUT_STYLE = 'w-full px-3 py-1.5 text-xs flat-input';

// ------------------------------------------------------------
// 3. TshirtsAdmin component
// ------------------------------------------------------------
const TshirtsAdmin = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const tshirts = useSelector((state) => state.fitness.tshirts);

  // --- Page state ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null = adding a new t-shirt
  const [form, setForm] = useState(EMPTY_FORM);

  // --- Functions ---

  // Connect an input to the "form" state (value + onChange)
  const bindInput = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    className: INPUT_STYLE
  });

  // "+ Add T-Shirt" button: open an empty form
  const handleAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  // "Edit" button: open the form filled with the t-shirt's data
  const handleEdit = (tshirt) => {
    setEditId(tshirt.id);
    setForm({
      title: tshirt.title,
      price: tshirt.price,
      stock: tshirt.stock,
      color: tshirt.color,
      image: tshirt.image,
      desc: tshirt.desc || ''
    });
    setIsModalOpen(true);
  };

  // "Save" button in the form
  const handleSave = async (e) => {
    e.preventDefault();

    // Inputs give text, the database needs numbers for price and stock
    const data = { ...form, price: +form.price, stock: +form.stock };

    try {
      await dispatch(saveItem({ type: 'tshirts', id: editId, data })).unwrap();
      setIsModalOpen(false);
      dispatch(addToast('T-Shirt saved'));
    } catch (message) {
      dispatch(addToast(`Error saving t-shirt: ${message}`));
    }
  };

  // "Delete" button
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this t-shirt?')) return;

    try {
      await dispatch(deleteItem({ type: 'tshirts', id })).unwrap();
      dispatch(addToast('T-Shirt deleted'));
    } catch (message) {
      dispatch(addToast(`Error deleting t-shirt: ${message}`));
    }
  };

  // --- Render ---
  return (
    <section className="space-y-4">
      {/* ---------------- T-shirts table ---------------- */}
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">T-Shirt Inventory ({tshirts.length})</span>
          <button onClick={handleAdd} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
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
            <tbody className="divide-y divide-slate-100">
              {tshirts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-400">No t-shirts found.</td>
                </tr>
              )}

              {tshirts.map((tshirt) => (
                <tr key={tshirt.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{tshirt.title}</td>
                  <td className="px-4 py-2 font-mono">${Number(tshirt.price).toFixed(2)}</td>
                  <td className="px-4 py-2">{tshirt.stock}</td>
                  <td className="px-4 py-2">{tshirt.color}</td>
                  <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleEdit(tshirt)} className="text-slate-600 hover:text-black font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(tshirt.id)} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- Add / Edit form (popup) ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="font-bold text-xs text-slate-900">{editId ? 'Edit T-Shirt' : 'Add T-Shirt'}</span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Shirt Title</label>
                <input type="text" required {...bindInput('title')} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Price ($)</label>
                  <input type="number" step="0.01" required {...bindInput('price')} />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Stock</label>
                  <input type="number" required {...bindInput('stock')} />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Color</label>
                  <input type="text" required {...bindInput('color')} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Photo URL</label>
                <input type="url" required {...bindInput('image')} />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Description</label>
                <input type="text" {...bindInput('desc')} />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border border-slate-200 text-xs font-medium flat-btn hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default TshirtsAdmin;
