import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../features/FitnessSlice';

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 2500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded shadow border border-slate-700 pointer-events-auto transition-all duration-200">
      {toast.message}
    </div>
  );
};

const ToastContainer = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.fitness.toasts);

  const handleDismiss = (id) => {
    dispatch(removeToast(id));
  };

  return (
    <div
      id="toastContainer"
      className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;

