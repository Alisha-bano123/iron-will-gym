import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function ExpiryPopup() {
  const { user }        = useAuth();
  const [show, setShow] = useState(false);
  const [days, setDays] = useState(null);

  useEffect(() => {
    if (!user?.planEndDate) return;

    const daysLeft = Math.ceil(
      (new Date(user.planEndDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    setDays(daysLeft);

    if (daysLeft > 10 || daysLeft <= 0) return;  // only 1–10 days

    // localStorage se check karo — kab last dikha tha
    const key        = `expiry_popup_${user._id}`;
    const lastShown  = localStorage.getItem(key);
    const today      = new Date().toDateString();

    // 3 din se kam bacha hai — har session dikhe
    // 3-10 din — sirf ek baar per day
    if (daysLeft <= 3) {
      setShow(true);
    } else if (lastShown !== today) {
      setShow(true);
    }
  }, [user]);

  const handleRemind = () => {
    // Kal phir dikhao
    const key   = `expiry_popup_${user._id}`;
    const today = new Date().toDateString();
    localStorage.setItem(key, today);
    setShow(false);
  };

  const handleDismiss = () => {
    // Is session mein dobara mat dikho (page refresh tak)
    const key   = `expiry_popup_${user._id}`;
    const today = new Date().toDateString();
    localStorage.setItem(key, today);
    setShow(false);
  };

  const fmtDate = d =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const planLabel = { '1_month': '1 Month', '3_month': '3 Months', '6_month': '6 Months' };

  const urgencyColor = days <= 3
    ? 'border-red-500/60 bg-red-500/5'
    : days <= 7
    ? 'border-orange-500/60 bg-orange-500/5'
    : 'border-yellow-500/60 bg-yellow-500/5';

  const urgencyIcon = days <= 3 ? '🚨' : days <= 7 ? '⚠️' : '📅';

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
            onClick={handleDismiss}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`bg-card border-2 rounded-3xl p-7 w-full max-w-sm text-center relative ${urgencyColor}`}
              onClick={e => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="text-5xl mb-4">{urgencyIcon}</div>

              {/* Title */}
              <h2 className="font-heading font-black text-xl text-white mb-2">
                {days <= 3 ? 'Plan Expiring Very Soon!' : 'Plan Expiring Soon!'}
              </h2>

              {/* Days badge */}
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-4
                ${days <= 3
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : days <= 7
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'}`}>
                ⏰ {days} day{days !== 1 ? 's' : ''} remaining
              </div>

              {/* Details */}
              <div className="bg-dark rounded-2xl p-4 mb-5 text-sm space-y-2 border border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-white font-semibold">{planLabel[user?.selectedPlan] || '–'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expires on</span>
                  <span className="text-white font-semibold">{fmtDate(user?.planEndDate)}</span>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-5">
                Visit the gym counter to renew your membership and continue your fitness journey! 💪
              </p>

              {/* Contact */}
              <div className="bg-dark rounded-xl p-3 mb-5 text-xs text-gray-400 border border-gray-700">
                📞 <span className="text-primary font-semibold">+91 98765 43210</span>
                &nbsp;·&nbsp;
                🕐 Mon–Sat: 5AM–10PM
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRemind}
                  className="flex-1 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white py-2.5 rounded-xl text-sm transition-colors"
                >
                  Remind Tomorrow
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 bg-primary hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  OK, Got It!
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}