import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, toggleCartDrawer } from '../features/CartSlice';
import { addToast } from '../features/FitnessSlice';

const Store = () => {
  const dispatch = useDispatch();
  const tshirts = useSelector((state) => state.fitness.tshirts);

  const handleAddToCart = (shirt) => {
    dispatch(addToCart(shirt));
    dispatch(addToast(`Added ${shirt.title}`));
  };

  return (
    <section id="page-store" className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">T-Shirt Store</h2>
          <p className="text-xs text-slate-500">Training t-shirts designed for workouts.</p>
        </div>
        <button
          onClick={() => dispatch(toggleCartDrawer(true))}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
        >
          View Cart
        </button>
      </div>

      <div id="tshirtGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tshirts.map((shirt) => (
          <div
            key={shirt.id || shirt._id}
            className="flat-box overflow-hidden flex flex-col justify-between"
          >
            <div className="bg-slate-100 h-52 overflow-hidden border-b border-slate-200">
              <img
                src={shirt.image}
                alt={shirt.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x400/f1f5f9/475569?text=T-Shirt';
                }}
              />
            </div>
            <div className="p-3 space-y-1">
              <div className="text-[11px] text-slate-400 uppercase font-mono">{shirt.color}</div>
              <div className="font-bold text-xs text-slate-900 leading-tight">{shirt.title}</div>
              <div className="text-xs text-slate-500">{shirt.desc}</div>
            </div>
            <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-white">
              <span className="font-bold text-sm text-slate-900">
                ${parseFloat(shirt.price).toFixed(2)}
              </span>
              <button
                onClick={() => handleAddToCart(shirt)}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Store;

