import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCartDrawer, updateCartQty, clearCart } from '../features/CartSlice';
import { addToast, fetchBills } from '../features/FitnessSlice';
import { apiCreateBill } from '../services/api';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { items, isDrawerOpen } = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user.user);

  const subtotal = items.reduce((acc, c) => acc + (c.price * c.qty), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleClose = () => {
    dispatch(toggleCartDrawer(false));
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      dispatch(addToast('Cart is empty'));
      return;
    }

    const itemsSummary = items.map((c) => `${c.title} (x${c.qty})`).join(', ');
    const newBill = {
      customerName: user ? (user.name || user.username) : 'Alex Smith',
      email: user ? user.email : 'alex@fitpulse.io',
      items: itemsSummary,
      total: parseFloat(total.toFixed(2)),
      date: new Date().toISOString().split('T')[0],
      status: 'Paid'
    };

    try {
      const created = await apiCreateBill(newBill);
      dispatch(clearCart());
      dispatch(fetchBills());
      dispatch(toggleCartDrawer(false));
      dispatch(addToast(`Bill ${created.id || 'INV-New'} created & order paid!`));
    } catch (err) {
      dispatch(addToast('Checkout error: ' + (err.message || 'Server error')));
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          id="cartBackdrop"
          onClick={handleClose}
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        />
      )}

      {/* Drawer */}
      <div
        id="cartDrawer"
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l border-slate-200 z-50 transform transition-transform duration-200 flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-sm text-slate-900">Shopping Cart</span>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-black cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Cart items list */}
        <div id="cartItemsList" className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-10">Cart is empty.</div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-2 border border-slate-200 rounded flex justify-between items-center text-xs"
              >
                <div className="flex-1 pr-2">
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <div className="text-slate-500 font-mono">
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => dispatch(updateCartQty({ id: item.id, delta: -1 }))}
                    className="w-5 h-5 border border-slate-200 flex items-center justify-center flat-btn text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-mono">{item.qty}</span>
                  <button
                    onClick={() => dispatch(updateCartQty({ id: item.id, delta: 1 }))}
                    className="w-5 h-5 border border-slate-200 flex items-center justify-center flat-btn text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & checkout button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span id="cartSubtotal" className="font-medium text-slate-900">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax (5%)</span>
            <span id="cartTax" className="font-medium text-slate-900">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
            <span>Total</span>
            <span id="cartTotal">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className={`w-full py-2.5 text-white font-medium text-xs flat-btn mt-2 cursor-pointer ${
              items.length === 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            Complete Order & Generate Bill
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;

