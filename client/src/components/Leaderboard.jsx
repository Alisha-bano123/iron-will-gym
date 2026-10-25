import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const rankStyle = [
  { bg: 'bg-yellow-500/20 border-yellow-500/40', text: 'text-yellow-300', icon: '🥇' },
  { bg: 'bg-gray-400/20 border-gray-400/40',    text: 'text-gray-300',   icon: '🥈' },
  { bg: 'bg-orange-600/20 border-orange-600/40', text: 'text-orange-400', icon: '🥉' },
];

export default function Leaderboard({ currentUserId }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/leaderboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const month = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-card border border-gray-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-heading font-bold text-white text-base">🏆 Leaderboard</p>
          <p className="text-gray-500 text-xs">{month} — Most Attendance</p>
        </div>
        <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded-full border border-accent/30 font-semibold">
          This Month
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-12 bg-dark rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🏋️</p>
          <p className="text-gray-500 text-sm">No data yet — start marking attendance!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((entry, i) => {
            const isMe  = String(entry._id) === String(currentUserId);
            const style = rankStyle[i] || { bg: 'bg-dark border-gray-700', text: 'text-gray-400', icon: `${i+1}.` };

            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                  ${isMe
                    ? 'bg-primary/15 border-primary/50 ring-1 ring-primary/30'
                    : i < 3
                    ? `${style.bg} border`
                    : 'bg-dark/50 border-gray-800'}`}
              >
                {/* Rank */}
                <span className={`text-lg font-bold w-8 text-center flex-shrink-0 ${style.text}`}>
                  {i < 3 ? style.icon : `${i+1}`}
                </span>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                  ${isMe ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {entry.name?.charAt(0)?.toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isMe ? 'text-primary' : 'text-white'}`}>
                    {entry.name} {isMe && <span className="text-xs font-normal text-primary/70">(You)</span>}
                  </p>
                </div>

                {/* Count */}
                <div className="text-right flex-shrink-0">
                  <p className={`font-heading font-black text-base ${i < 3 ? style.text : 'text-gray-400'}`}>
                    {entry.count}
                  </p>
                  <p className="text-gray-600 text-xs">days</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* My rank if not in top 10 */}
      {data.length > 0 && !data.find(d => String(d._id) === String(currentUserId)) && (
        <div className="mt-3 pt-3 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-xs">You are not in the top 10 yet — keep going! 💪</p>
        </div>
      )}
    </div>
  );
}