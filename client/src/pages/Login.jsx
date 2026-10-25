import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  // Normal login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const data = await login(form.email.trim(), form.password.trim());
      const { user } = data;
      if (user.role === 'owner') {
        toast.success('Welcome back, Owner! 👑');
        navigate('/owner/dashboard', { replace: true });
      } else if (user.status === 'approved') {
        toast.success(`Welcome back, ${user.name}! 💪`);
        navigate('/client/dashboard', { replace: true });
      } else if (user.status === 'pending') {
        toast('⏳ Your request is pending approval.', { icon: '⏳' });
        navigate('/pending', { replace: true });
      } else {
        toast.error('❌ Your request was not approved. Please contact the gym.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  // Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name } = decoded;

      // Check karo ye email registered hai ya nahi
      const data = await login(email, email); // Google users ke liye email hi password hai
      const { user } = data;

      if (user.role === 'owner') {
        toast.success('Welcome back, Owner! 👑');
        navigate('/owner/dashboard', { replace: true });
      } else if (user.status === 'approved') {
        toast.success(`Welcome back, ${user.name}! 💪`);
        navigate('/client/dashboard', { replace: true });
      } else if (user.status === 'pending') {
        navigate('/pending', { replace: true });
      } else {
        toast.error('Account not found. Please fill the Join Form first.');
      }
    } catch (err) {
      // User registered nahi hai — email fill kar do join form mein
      try {
        const decoded = jwtDecode(credentialResponse.credential);
        toast('📝 Please complete the Join Form to register!', { icon: '📝' });
        // Home page pe join form pe le jao with email pre-filled
        navigate(`/?email=${decoded.email}#join`, { replace: true });
      } catch {
        toast.error('Google login failed. Try manual login.');
      }
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  const inp = "w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-heading font-black text-white text-xl">IW</div>
          <div>
            <p className="font-heading font-black text-white text-xl leading-none">IRON WILL GYM</p>
            <p className="text-gray-500 text-xs">Member Portal</p>
          </div>
        </Link>

        <div className="bg-card border border-gray-700 rounded-3xl p-8">
          <h1 className="font-heading font-black text-2xl text-white mb-1">Welcome Back 👋</h1>
          <p className="text-gray-400 text-sm mb-6">Login to access your dashboard</p>

          {/* Google Login Button */}
          <div className="mb-5">
            <p className="text-gray-400 text-xs text-center mb-3">Login with Google</p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_black"
                shape="rectangular"
                size="large"
                width="380"
                text="signin_with"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Email Address</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                name="email"
                autoComplete="email"
                className={inp}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Password</label>
              <input
                type="password"
                placeholder="Your phone number (for members)"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                name="password"
                autoComplete="current-password"
                className={inp}
              />
            </div>

            <div className="bg-dark/60 border border-gray-700/50 rounded-xl p-3 text-xs text-gray-500">
              💡 Members: password = <span className="text-primary font-semibold">your phone number</span>
              <br />
              👑 Owner: custom password set during seed
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 disabled:opacity-60 text-white font-heading font-bold py-3.5 rounded-xl transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in…
                </span>
              ) : 'Login 🚀'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-6">
            Not a member yet?{' '}
            <a href="/#join" className="text-primary hover:underline">Join Iron Will Gym</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}