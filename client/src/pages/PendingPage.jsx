import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function PendingPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border border-gray-700 rounded-3xl p-8 text-center">

        <div className="w-20 h-20 bg-yellow-500/20 border border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">⏳</span>
        </div>

        <h1 className="font-heading font-black text-2xl text-white mb-2">Request Under Review</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          Hi <span className="text-white font-semibold">{user?.name || 'there'}</span>! Your membership request is submitted.
          Please visit the <strong className="text-primary">gym counter</strong> to complete payment.
        </p>

        {/* Steps */}
        <div className="bg-dark rounded-2xl p-4 border border-gray-700 mb-5 text-left space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Next Steps</p>
          {[
            'Visit gym and pay for your selected plan',
            'Show this account email at the counter',
            'Owner will approve your account',
            'Login again to access full dashboard'
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="bg-primary/20 text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 bg-dark/60 rounded-xl p-3 border border-gray-700 mb-5">
          📞 <span className="text-primary">+91 98765 43210</span> &nbsp;|&nbsp; ✉️ ironwillgym@email.com
        </div>

        <div className="flex gap-3">
          <button onClick={logout}
            className="flex-1 border border-gray-700 hover:border-primary text-gray-300 hover:text-primary py-2.5 rounded-xl text-sm transition-colors">
            Logout
          </button>
          <Link to="/"
            className="flex-1 bg-primary hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors text-center">
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}