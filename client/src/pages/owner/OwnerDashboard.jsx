import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export default function OwnerDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { icon: '👥', label: 'Total Active Members', value: stats.totalMembers,    color: 'from-blue-600 to-blue-800',     link: '/owner/members' },
    { icon: '🔔', label: 'Pending Requests',     value: stats.pendingRequests, color: 'from-red-600 to-red-800',       link: '/owner/pending' },
    { icon: '⚠️',  label: 'Expiring This Week',   value: stats.expiringCount,   color: 'from-yellow-600 to-yellow-800', link: '/owner/expiring' },
    { icon: '📅', label: "Today's Attendance",   value: stats.todayAttendance, color: 'from-green-600 to-green-800',   link: '/owner/attendance' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">Dashboard 📊</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-card rounded-2xl h-28 animate-pulse border border-gray-700" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={card.link}
                className={`block bg-gradient-to-br ${card.color} rounded-2xl p-5 border border-white/10 hover:scale-105 transition-transform`}>
                <span className="text-3xl">{card.icon}</span>
                <p className="font-heading font-black text-3xl text-white mt-2">{card.value}</p>
                <p className="text-white/70 text-xs mt-1">{card.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-card border border-gray-700 rounded-2xl p-5">
        <h2 className="font-heading font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Review Pending', to: '/owner/pending',    icon: '🔔' },
            { label: 'View Members',   to: '/owner/members',    icon: '👥' },
            { label: 'Expiring Plans', to: '/owner/expiring',   icon: '⚠️' },
            { label: 'Attendance',     to: '/owner/attendance', icon: '📅' },
            { label: 'Feedbacks',      to: '/owner/feedbacks',  icon: '⭐' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="flex items-center gap-2 bg-dark hover:bg-secondary border border-gray-700 hover:border-primary/60 rounded-xl px-3 py-2.5 text-sm text-gray-300 hover:text-white transition-all">
              <span>{a.icon}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}