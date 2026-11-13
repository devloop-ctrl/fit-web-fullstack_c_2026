import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  closeAuthModal,
  switchAuthView,
  addToast,
  fetchUsers,
  fetchRecords,
  fetchAllFitnessData,
  setMode,
  setActivePage
} from '../features/FitnessSlice';
import { login, register } from '../features/UserSlice';
import { apiResetPassword } from '../services/api';

const AuthModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authModal } = useSelector((state) => state.fitness);
  const { isLoading } = useSelector((state) => state.user);

  // Form states
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRepassword, setRegRepassword] = useState('');

  const [resetEmail, setResetEmail] = useState('');
  const [authError, setAuthError] = useState('');

  if (!authModal.isOpen) return null;

  const handleClose = () => {
    setAuthError('');
    dispatch(closeAuthModal());
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!loginInput || !loginPassword) return;

    try {
      const result = await dispatch(
        login({ username: loginInput.trim(), password: loginPassword })
      ).unwrap();

      const authenticatedUser = result.user;
      dispatch(closeAuthModal());
      setLoginInput('');
      setLoginPassword('');

      // Automatic Role-Based Routing
      if (authenticatedUser?.role === 'Admin') {
        dispatch(setMode('admin'));
        dispatch(fetchAllFitnessData({ role: 'Admin', id: authenticatedUser.id }));
        dispatch(addToast(`Welcome Administrator, ${authenticatedUser.name || authenticatedUser.username}!`));
        navigate('/admin');
      } else {
        dispatch(setMode('user'));
        dispatch(setActivePage('calculators'));
        dispatch(fetchRecords({ userId: authenticatedUser.id }));
        dispatch(addToast(`Welcome back, ${authenticatedUser.name || authenticatedUser.username}!`));
        navigate('/calculators');
      }
    } catch (err) {
      setAuthError(typeof err === 'string' ? err : 'Invalid credentials. Please verify your login details.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (regPassword !== regRepassword) {
      setAuthError('Passwords do not match. Please verify your password entry.');
      return;
    }

    try {
      const result = await dispatch(
        register({
          username: regUsername.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword
        })
      ).unwrap();

      const registeredUser = result.user;
      dispatch(fetchUsers());
      dispatch(closeAuthModal());
      setRegUsername('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegRepassword('');

      // Auto-redirect to personal calculators
      dispatch(setMode('user'));
      dispatch(setActivePage('calculators'));
      dispatch(fetchRecords({ userId: registeredUser.id }));
      dispatch(addToast(`Account registered successfully! Welcome, ${registeredUser.name || registeredUser.username}.`));
      navigate('/calculators');
    } catch (err) {
      setAuthError(typeof err === 'string' ? err : 'Registration failed. Username or email may already be registered.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;

    try {
      const res = await apiResetPassword(resetEmail.trim());
      dispatch(closeAuthModal());
      dispatch(addToast(res.message || `Password reset link sent to ${resetEmail}`));
      setResetEmail('');
    } catch {
      dispatch(closeAuthModal());
      dispatch(addToast('If this email exists, instructions were dispatched.'));
    }
  };

  return (
    <div
      id="authModal"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 transition-opacity"
    >
      <div className="bg-white border border-slate-200 rounded-lg max-w-sm w-full overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 id="authModalTitle" className="font-bold text-sm text-slate-900">
              {authModal.view === 'login' && 'Account Login'}
              {authModal.view === 'register' && 'Create New Account'}
              {authModal.view === 'reset' && 'Reset Password'}
            </h3>
            <p id="authModalSubtitle" className="text-[11px] text-slate-500">
              {authModal.view === 'login' && 'Enter username and password to log in'}
              {authModal.view === 'register' && 'Join FitPulse with your personal details'}
              {authModal.view === 'reset' && 'Enter your email to receive a recovery link'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-black cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="p-5">
          {authError && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center space-x-2">
              <i className="fa-solid fa-circle-exclamation text-red-500"></i>
              <span>{authError}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {authModal.view === 'login' && (
            <form id="loginForm" onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Username or Email
                </label>
                <input
                  id="loginUsername"
                  type="text"
                  required
                  placeholder="alexsmith"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs flat-input"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => dispatch(switchAuthView('reset'))}
                    className="text-[11px] text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="loginPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs flat-input"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn cursor-pointer"
              >
                {isLoading ? 'Authenticating...' : 'Log In'}
              </button>
              <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => dispatch(switchAuthView('register'))}
                  className="text-slate-900 font-semibold underline ml-1 cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {authModal.view === 'register' && (
            <form id="registerForm" onSubmit={handleRegisterSubmit} className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-0.5">Username</label>
                <input
                  id="regUsername"
                  type="text"
                  required
                  placeholder="johndoe"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs flat-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-0.5">
                  Email Address
                </label>
                <input
                  id="regEmail"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs flat-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-0.5">
                  Phone Number
                </label>
                <input
                  id="regPhone"
                  type="tel"
                  required
                  placeholder="+1 234 567 8900"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs flat-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">
                    Password
                  </label>
                  <input
                    id="regPassword"
                    type="password"
                    required
                    placeholder="••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs flat-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">
                    Repeat Password
                  </label>
                  <input
                    id="regRepassword"
                    type="password"
                    required
                    placeholder="••••••"
                    value={regRepassword}
                    onChange={(e) => setRegRepassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs flat-input"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn mt-1 cursor-pointer"
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
              <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
                Already have an account?
                <button
                  type="button"
                  onClick={() => dispatch(switchAuthView('login'))}
                  className="text-slate-900 font-semibold underline ml-1 cursor-pointer"
                >
                  Log in
                </button>
              </div>
            </form>
          )}

          {/* 3. RESET PASSWORD FORM */}
          {authModal.view === 'reset' && (
            <form id="resetForm" onSubmit={handleResetSubmit} className="space-y-3">
              <p className="text-xs text-slate-600">
                Enter your registered email address and we will generate a password reset link.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  id="resetEmail"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs flat-input"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flat-btn cursor-pointer"
              >
                Send Reset Instructions
              </button>
              <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
                Remember password?
                <button
                  type="button"
                  onClick={() => dispatch(switchAuthView('login'))}
                  className="text-slate-900 font-semibold underline ml-1 cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

