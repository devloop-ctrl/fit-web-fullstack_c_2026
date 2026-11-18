// ============================================================
// CartDrawer: the sliding shopping cart (members only)
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { useSelector, useDispatch } from 'react-redux';
import { toggleCartDrawer, updateCartQty, checkout, cartTotals } from '../features/CartSlice';
import { addToast } from '../features/FitnessSlice';

// ------------------------------------------------------------
// 2. Constants
// ------------------------------------------------------------
const QTY_BUTTON_STYLE =
  'w-5 h-5 border border-slate-200 flex items-center justify-center flat-btn text-slate-600 hover:bg-slate-100 cursor-pointer';

// ------------------------------------------------------------
// 3. CartDrawer component
// ------------------------------------------------------------
const CartDrawer = () => {
  // --- Data from Redux ---
  const dispatch = useDispatch();
  const { items, isDrawerOpen } = useSelector((state) => state.cart);

  // --- Calculated values ---
  const { subtotal, tax, total } = cartTotals(items);

  // --- Functions ---

  // Close the drawer
  const handleClose = () => {
    dispatch(toggleCartDrawer(false));
  };

  // Send the order to the server and create a bill
  const handleCheckout = async () => {
    try {
      const bill = await dispatch(checkout()).unwrap();
      dispatch(addToast(`Bill ${bill.id} created & order paid!`));
    } catch (msg) {
      dispatch(addToast(`Checkout error: ${msg}`));
    }
  };

  // --- Render ---
  return (
    <>
      {/* ---------------- Dark background (click to close) ---------------- */}
      {isDrawerOpen && <div onClick={handleClose} className="fixed inset-0 bg-black/40 z-40" />}

      {/* ---------------- Drawer ---------------- */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l border-slate-200 z-50 transition-transform duration-200 flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ---------------- Title ---------------- */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="font-bold text-sm text-slate-900">Shopping Cart</span>
          <button onClick={handleClose} className="text-slate-500 hover:text-black cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* ---------------- Cart items ---------------- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && <div className="text-center text-xs text-slate-400 py-10">Cart is empty.</div>}

          {items.map((item) => (
            <div key={item.id} className="p-2 border border-slate-200 rounded flex justify-between items-center text-xs">
              <div className="flex-1 pr-2">
                <div className="font-bold text-slate-900">{item.title}</div>
                <div className="text-slate-500 font-mono">${(item.price * item.qty).toFixed(2)}</div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button onClick={() => dispatch(updateCartQty({ id: item.id, delta: -1 }))} className={QTY_BUTTON_STYLE}>-</button>
                <span className="w-4 text-center font-mono">{item.qty}</span>
                <button onClick={() => dispatch(updateCartQty({ id: item.id, delta: 1 }))} className={QTY_BUTTON_STYLE}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* ---------------- Totals + checkout button ---------------- */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax (5%)</span>
            <span className="font-medium text-slate-900">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full py-2.5 text-white font-medium text-xs flat-btn mt-2 cursor-pointer bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Complete Order & Generate Bill
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
