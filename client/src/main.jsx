// ============================================================
// main.jsx: the first file that runs. It starts the React app.
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import axios from 'axios';
import { store } from './store';
import App from './App.jsx';
import './index.css';

// ------------------------------------------------------------
// 2. Setup: server address (from .env, empty in dev because Vite proxies /api)
// ------------------------------------------------------------
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// ------------------------------------------------------------
// 3. Start the app
// ------------------------------------------------------------
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
