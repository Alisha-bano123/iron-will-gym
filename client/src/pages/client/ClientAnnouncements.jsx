import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export default function ClientAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    api.get('/announcements')
      .then(r => setAnnouncements(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = d =>
    new Date(d).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">📢 Announcements</h1>
        <p className="text-gray-400 text-sm mt-1">Latest updates from the gym</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-card rounded-2xl animate-pulse border border-gray-700"/>)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-card border border-gray-700 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-white font-semibold">No announcements yet</p>
          <p className="text-gray-500 text-sm mt-1">Check back later for updates from the gym</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann, i) => (
            <motion.div key={ann._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-2xl p-5 border
                ${ann.important
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-gray-700'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{ann.important ? '🚨' : '📢'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-heading font-bold text-white">{ann.title}</p>
                    {ann.important && (
                      <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/30 font-semibold">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{ann.message}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <p className="text-gray-600 text-xs">{fmtDate(ann.createdAt)}</p>
                    {ann.expiresAt && (
                      <p className="text-gray-600 text-xs">
                        · Expires {fmtDate(ann.expiresAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}