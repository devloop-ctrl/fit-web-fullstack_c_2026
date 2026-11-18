import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../features/FitnessSlice';

const Toast = ({ toast }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 2500);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  return <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded shadow border border-slate-700">{toast.message}</div>;
};

const ToastContainer = () => {
  const toasts = useSelector((state) => state.fitness.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => <Toast key={toast.id} toast={toast} />)}
    </div>
  );
};

export default ToastContainer;
