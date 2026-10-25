import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import StreakCalendar from '../../components/StreakCalendar';
import api from '../../utils/api';

const BADGES = [
  { streak: 7,  icon: '🥉', label: 'Getting Started', grad: 'from-orange-700 to-orange-900', text: 'text-orange-300' },
  { streak: 15, icon: '🥈', label: 'Consistent',      grad: 'from-gray-500 to-gray-700',     text: 'text-gray-200' },
  { streak: 21, icon: '🥇', label: 'Dedicated',       grad: 'from-yellow-600 to-yellow-800', text: 'text-yellow-300' },
  { streak: 30, icon: '💎', label: 'Iron Will',       grad: 'from-cyan-600 to-cyan-800',     text: 'text-cyan-300' },
];

const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Consistency beats perfection every time.",
  "One day at a time. One rep at a time.",
  "Champions aren't made in comfort zones.",
  "Your future self will thank you for showing up.",
];

function fireConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width, y: -10,
    r: Math.random() * 6 + 3,
    color: ['#FF6B35','#FFD700','#2ECC71','#3498DB','#9B59B6'][Math.floor(Math.random() * 5)],
    vx: (Math.random() - 0.5) * 4, vy: Math.random() * 4 + 2,
    angle: Math.random() * 360, spin: (Math.random() - 0.5) * 6, life: 1,
  }));
  let frame;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.angle += p.spin; p.life -= 0.013;
      if (p.life > 0) alive = true;
      ctx.save(); ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y); ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.r, -p.r, p.r * 2, p.r);
      ctx.restore();
    });
    if (alive) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  draw();
  setTimeout(() => { cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height); }, 3500);
}

export default function Streak() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [popup,   setPopup]   = useState(null);
  const canvasRef             = useRef(null);
  const month = new Date().getMonth();
  const year  = new Date().getFullYear();
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const fetchStreak = async () => {
    const r = await api.get('/client/streak');
    setData(r.data);
    return r.data;
  };

  useEffect(() => { fetchStreak().finally(() => setLoading(false)); }, []);

  const markAttendance = async () => {
    setMarking(true);
    try {
      await api.post('/client/attendance');
      const fresh = await fetchStreak();
      toast.success('🔥 Attendance marked!');
      if (canvasRef.current) fireConfetti(canvasRef.current);
      const earned = BADGES.slice().reverse().find(b => fresh.currentStreak === b.streak);
      if (earned) setTimeout(() => setPopup(earned), 600);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already marked today!');
    }
    setMarking(false);
  };

  const nextBadge    = data ? BADGES.find(b => data.currentStreak < b.streak) : null;
  const earnedBadges = data ? BADGES.filter(b => data.currentStreak >= b.streak) : [];

  return (
    <div className="space-y-5">
      <canvas ref={canvasRef} id="confetti-canvas" />

      {/* Badge popup */}
      <AnimatePresence>
        {popup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setPopup(null)}>
            <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5 }}
              className={`bg-gradient-to-br ${popup.grad} rounded-3xl p-8 text-center max-w-xs mx-4 border border-white/20`}>
              <p className="text-8xl mb-3">{popup.icon}</p>
              <p className="text-white font-heading font-black text-2xl">Badge Unlocked!</p>
              <p className={`font-semibold text-lg mt-1 ${popup.text}`}>{popup.label}</p>
              <p className="text-white/70 text-sm mt-1">{popup.streak} day streak!</p>
              <button onClick={() => setPopup(null)} className="mt-5 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors">
                Awesome! 🎉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="font-heading font-black text-2xl text-white">🔥 My Streak</h1>
        <p className="text-gray-400 text-sm mt-1 italic">"{quote}"</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-card rounded-2xl animate-pulse border border-gray-700" />)}</div>
      ) : (
        <>
          {/* Main streak */}
          <div className="bg-card border border-gray-700 rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at center, #FF6B35 0%, transparent 70%)' }} />
            <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <p className="font-heading font-black text-7xl text-primary">🔥</p>
              <p className="font-heading font-black text-6xl text-white mt-1">{data?.currentStreak}</p>
              <p className="text-gray-400 text-sm mt-1">Day Streak</p>
            </motion.div>
            <div className="mt-5">
              {data?.markedToday ? (
                <div className="bg-green-600/20 border border-green-600/30 rounded-xl py-3">
                  <p className="text-green-400 font-semibold text-sm">✅ Marked today! See you tomorrow.</p>
                </div>
              ) : (
                <button onClick={markAttendance} disabled={marking}
                  className="bg-primary hover:bg-orange-600 disabled:opacity-60 text-white font-heading font-bold px-8 py-3 rounded-xl text-base transition-colors glow">
                  {marking ? 'Marking…' : "💪 Mark Today's Attendance"}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['This Month',    `${data?.thisMonthCount}/${data?.daysInMonth}`, 'days'],
              ['Attendance %',  `${data?.attendancePercent}%`, data?.attendancePercent >= 75 ? '🏆 Regular' : '📉 Low'],
              ['Best Streak',   `${data?.longestStreak}`,      'all time'],
              ['Current',       `${data?.currentStreak}`,      'active'],
            ].map(([label, val, sub]) => (
              <div key={label} className="bg-card border border-gray-700 rounded-2xl p-4 text-center">
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="font-heading font-black text-2xl text-white mt-1">{val}</p>
                <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="bg-card border border-gray-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-semibold">
                {new Date(year, month).toLocaleString('default', { month: 'long' })} {year}
              </p>
              <span className="text-xs text-gray-500">{data?.thisMonthCount}/{data?.daysInMonth} days</span>
            </div>
            <StreakCalendar records={data?.records || []} year={year} month={month} />
          </div>

          {/* Badges */}
          <div className="bg-card border border-gray-700 rounded-2xl p-5">
            <p className="text-white font-semibold mb-4">🏆 Achievement Badges</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BADGES.map(badge => {
                const earned = data?.currentStreak >= badge.streak;
                return (
                  <div key={badge.label}
                    className={`rounded-2xl p-4 text-center border transition-all
                      ${earned ? `bg-gradient-to-br ${badge.grad} border-white/20` : 'bg-dark border-gray-700 opacity-40'}`}>
                    <p className="text-4xl mb-2">{badge.icon}</p>
                    <p className={`text-xs font-bold ${earned ? badge.text : 'text-gray-500'}`}>{badge.label}</p>
                    <p className={`text-xs mt-0.5 ${earned ? 'text-white/70' : 'text-gray-600'}`}>{badge.streak} days</p>
                    {earned && <p className="text-green-400 text-xs mt-1 font-semibold">✓ Earned</p>}
                  </div>
                );
              })}
            </div>

            {/* Next badge progress */}
            {nextBadge && (
              <div className="mt-4 bg-dark border border-gray-700 rounded-xl p-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Next: {nextBadge.icon} {nextBadge.label}</span>
                  <span>{data?.currentStreak}/{nextBadge.streak} days</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (data?.currentStreak / nextBadge.streak) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-primary rounded-full" />
                </div>
                <p className="text-gray-600 text-xs mt-1">{nextBadge.streak - data?.currentStreak} more days to go!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}