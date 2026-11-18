import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveItem, deleteItem, addToast } from '../features/FitnessSlice';

const EMPTY = { title: '', price: '', stock: '', color: '', image: '', desc: '' };

const TshirtsAdmin = () => {
  const dispatch = useDispatch();
  const tshirts = useSelector((state) => state.fitness.tshirts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const openNew = () => { setEditId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (t) => {
    setEditId(t.id);
    setForm({ title: t.title, price: t.price, stock: t.stock, color: t.color, image: t.image, desc: t.desc || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await dispatch(saveItem({ type: 'tshirts', id: editId, data: { ...form, price: +form.price, stock: +form.stock } })).unwrap();
      setModalOpen(false);
      dispatch(addToast('T-Shirt saved'));
    } catch (msg) {
      dispatch(addToast(`Error saving t-shirt: ${msg}`));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this t-shirt?')) return;
    try {
      await dispatch(deleteItem({ type: 'tshirts', id })).unwrap();
      dispatch(addToast('T-Shirt deleted'));
    } catch (msg) {
      dispatch(addToast(`Error deleting t-shirt: ${msg}`));
    }
  };

  const bind = (name) => ({ value: form[name], onChange: (e) => setForm({ ...form, [name]: e.target.value }), className: 'w-full px-3 py-1.5 text-xs flat-input' });

  return (
    <section className="space-y-4">
      <div className="flat-box overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-xs text-slate-800">T-Shirt Inventory ({tshirts.length})</span>
          <button onClick={openNew} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">
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
              {tshirts.length === 0 && <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-400">No t-shirts found.</td></tr>}
              {tshirts.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{t.title}</td>
                  <td className="px-4 py-2 font-mono">${Number(t.price).toFixed(2)}</td>
                  <td className="px-4 py-2">{t.stock}</td>
                  <td className="px-4 py-2">{t.color}</td>
                  <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => openEdit(t)} className="text-slate-600 hover:text-black font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="font-bold text-xs text-slate-900">{editId ? 'Edit T-Shirt' : 'Add T-Shirt'}</span>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-black cursor-pointer"><i className="fa-solid fa-xmark text-xs"></i></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div><label className="block text-xs text-slate-600 mb-1">Shirt Title</label><input type="text" required {...bind('title')} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="block text-xs text-slate-600 mb-1">Price ($)</label><input type="number" step="0.01" required {...bind('price')} /></div>
                <div><label className="block text-xs text-slate-600 mb-1">Stock</label><input type="number" required {...bind('stock')} /></div>
                <div><label className="block text-xs text-slate-600 mb-1">Color</label><input type="text" required {...bind('color')} /></div>
              </div>
              <div><label className="block text-xs text-slate-600 mb-1">Photo URL</label><input type="url" required {...bind('image')} /></div>
              <div><label className="block text-xs text-slate-600 mb-1">Description</label><input type="text" {...bind('desc')} /></div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 border border-slate-200 text-xs font-medium flat-btn hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default TshirtsAdmin;

