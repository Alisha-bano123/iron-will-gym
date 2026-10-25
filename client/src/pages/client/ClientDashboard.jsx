import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const quotes = [
  "Push yourself because no one else is going to do it for you.",
  "Success starts with self-discipline.",
  "The body achieves what the mind believes.",
  "Don't stop when you're tired. Stop when you're done.",
  "Train insane or remain the same.",
  "Wake up. Work out. Be happy.",
  "Results happen over time, not overnight.",
  "Be stronger than your excuses.",
];

const BADGES = [
  { streak:7,  icon:'🥉', label:'Getting Started', color:'text-orange-400' },
  { streak:15, icon:'🥈', label:'Consistent',      color:'text-gray-300'  },
  { streak:21, icon:'🥇', label:'Dedicated',       color:'text-yellow-400'},
  { streak:30, icon:'💎', label:'Iron Will',       color:'text-cyan-400'  },
];

const levelLabel = { beginner:'🌱 Beginner', average:'⚡ Average', expert:'🔥 Expert' };
const goalLabel  = { weight_gain:'💪 Weight Gain', weight_loss:'🔥 Weight Loss' };

export default function ClientDashboard() {
  const { user, refreshUser }           = useAuth();
  const [streakData, setStreakData]     = useState(null);
  const [marking,    setMarking]        = useState(false);
  const [water,      setWater]          = useState(0);
  const [loadingStreak, setLoadingStreak] = useState(true);

  useEffect(() => {
    // Streak data fetch
    api.get('/client/streak')
      .then(r => setStreakData(r.data))
      .catch(() => {})
      .finally(() => setLoadingStreak(false));

    // Water tracker (daily reset)
    const saved     = localStorage.getItem('waterIntake');
    const savedDate = localStorage.getItem('waterDate');
    const today     = new Date().toDateString();
    if (savedDate === today && saved) {
      setWater(Number(saved));
    } else {
      localStorage.setItem('waterDate', today);
      localStorage.setItem('waterIntake', '0');
      setWater(0);
    }

    // Refresh user so fitnessLevel is always fresh from server
    refreshUser().catch(() => {});
  }, []);

  const markAttendance = async () => {
    setMarking(true);
    try {
      await api.post('/client/attendance');
      toast.success('🔥 Attendance marked! Keep the streak going!');
      const r = await api.get('/client/streak');
      setStreakData(r.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already marked today!');
    }
    setMarking(false);
  };

  const addWater = () => {
    if (water >= 8) return;
    const next = water + 1;
    setWater(next);
    localStorage.setItem('waterIntake', String(next));
    if (next === 8) toast.success('💧 8 glasses done! Great hydration!');
  };

  // Plan helpers
  const planDays  = { '1_month': 30, '3_month': 90, '6_month': 180 };
  const totalDays = planDays[user?.selectedPlan] || 30;
  const daysLeft  = user?.planEndDate
    ? Math.max(0, Math.ceil((new Date(user.planEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;
  const planPct   = daysLeft !== null ? Math.round((daysLeft / totalDays) * 100) : 0;
  const planNames = { '1_month': '1 Month', '3_month': '3 Months', '6_month': '6 Months' };
  const fmtDate   = d => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '–';
  const quote = quotes[new Date().getDate() % quotes.length];
  const badge = streakData ? [...BADGES].reverse().find(b => streakData.currentStreak >= b.streak) : null;

  // ── Profile completeness check ──────────────────────────────────────────────
  // user object mein fitnessLevel hona chahiye — agar nahi hai toh buttons nahi dikhenge
  const profileComplete = !!(user?.gender && user?.goal && user?.fitnessLevel);

  return (
    <div className="space-y-5">

      {/* Welcome */}
      <div>
        <h1 className="font-heading font-black text-2xl text-white">
          Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>! 💪
        </h1>
        <p className="text-gray-400 text-sm mt-1 italic">"{quote}"</p>
      </div>

      {/* Plan expiry warning */}
      {daysLeft !== null && daysLeft <= 7 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/40 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-yellow-300 text-sm font-medium">
            Your plan expires in <strong>{daysLeft} days</strong>! Visit the gym counter to renew.
          </p>
        </motion.div>
      )}

      {/* Profile tags */}
      <div className="bg-card border border-gray-700 rounded-2xl p-4">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Your Profile</p>
        <div className="flex flex-wrap gap-2">
          {user?.gender && (
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-3 py-1 rounded-full capitalize">
              {user.gender === 'male' ? '👨 Male' : '👩 Female'}
            </span>
          )}
          {user?.goal && (
            <span className="bg-primary/20 text-primary border border-primary/30 text-xs px-3 py-1 rounded-full">
              {goalLabel[user.goal] || user.goal}
            </span>
          )}
          {user?.fitnessLevel && (
            <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs px-3 py-1 rounded-full">
              {levelLabel[user.fitnessLevel] || user.fitnessLevel}
            </span>
          )}
          {user?.weight && (
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-full">
              ⚖️ {user.weight} kg
            </span>
          )}
          {user?.age && (
            <span className="bg-gray-700 text-gray-300 border border-gray-600 text-xs px-3 py-1 rounded-full">
              🎂 {user.age} yrs
            </span>
          )}
        </div>
      </div>

      {/* Plan card + Streak card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Active Plan */}
        <div className="bg-card border border-gray-700 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Active Plan</p>
            <span className="bg-green-600/20 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-600/30">
              Active
            </span>
          </div>
          <p className="font-heading font-black text-2xl text-white">{planNames[user?.selectedPlan] || '–'}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500">Start</p>
              <p className="text-white font-medium mt-0.5">{fmtDate(user?.planStartDate)}</p>
            </div>
            <div>
              <p className="text-gray-500">End</p>
              <p className="text-white font-medium mt-0.5">{fmtDate(user?.planEndDate)}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Days Remaining</span>
              <span className={daysLeft !== null && daysLeft <= 7 ? 'text-yellow-400 font-semibold' : 'text-white'}>
                {daysLeft !== null ? `${daysLeft} days` : '–'}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${planPct}%` }} transition={{ duration: 1 }}
                className={`h-full rounded-full ${planPct > 30 ? 'bg-primary' : 'bg-yellow-500'}`} />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-card border border-gray-700 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Today's Workout</p>
            {badge && (
              <span className={`text-xs font-semibold ${badge.color}`}>{badge.icon} {badge.label}</span>
            )}
          </div>
          <div className="text-center my-2">
            <p className="text-5xl font-heading font-black text-primary">
              🔥 {streakData?.currentStreak ?? 0}
            </p>
            <p className="text-gray-400 text-sm mt-1">Day Streak</p>
          </div>
          {loadingStreak ? (
            <div className="bg-dark rounded-xl py-3 text-center animate-pulse">
              <p className="text-gray-600 text-sm">Loading…</p>
            </div>
          ) : streakData?.markedToday ? (
            <div className="bg-green-600/20 border border-green-600/30 rounded-xl py-2.5 text-center">
              <p className="text-green-400 text-sm font-semibold">✅ Attendance marked today!</p>
            </div>
          ) : (
            <button onClick={markAttendance} disabled={marking}
              className="w-full bg-primary hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {marking ? 'Marking…' : "💪 Mark Today's Attendance"}
            </button>
          )}
        </div>
      </div>

      {/* ── DIET & WORKOUT PLAN BUTTONS ─────────────────────────────────────── */}
      <div className="bg-card border border-gray-700 rounded-2xl p-5">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">
          Your Personalized Plans
        </p>
        <p className="text-gray-500 text-xs mb-4">
          Customized for:
          <span className="text-white mx-1 capitalize">{user?.gender || '–'}</span>·
          <span className="text-white mx-1">{goalLabel[user?.goal] || '–'}</span>·
          <span className="text-white mx-1">{levelLabel[user?.fitnessLevel] || '–'}</span>
        </p>

        {profileComplete ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Diet Plan Button */}
            <Link to="/client/diet"
              className="group relative overflow-hidden bg-gradient-to-br from-green-800/40 to-green-900/20 border border-green-600/50 hover:border-green-400 rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] block">
              <div className="flex items-start justify-between mb-3">
                <span className="text-5xl">🥗</span>
                <span className="bg-green-600/30 text-green-300 text-xs px-2 py-1 rounded-full border border-green-600/40 font-semibold">
                  Personalized ✓
                </span>
              </div>
              <p className="font-heading font-bold text-white text-xl mb-1">Diet Plan</p>
              <p className="text-gray-400 text-xs">
                {user?.gender === 'male' ? 'Male' : 'Female'} ·{' '}
                {user?.goal === 'weight_gain' ? 'Weight Gain' : 'Weight Loss'} ·{' '}
                {levelLabel[user?.fitnessLevel]}
              </p>
              <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-semibold group-hover:gap-3 transition-all">
                View Meal Plan <span>→</span>
              </div>
            </Link>

            {/* Workout Plan Button */}
            <Link to="/client/workout"
              className="group relative overflow-hidden bg-gradient-to-br from-orange-800/40 to-orange-900/20 border border-orange-600/50 hover:border-orange-400 rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] block">
              <div className="flex items-start justify-between mb-3">
                <span className="text-5xl">🏋️</span>
                <span className="bg-orange-600/30 text-orange-300 text-xs px-2 py-1 rounded-full border border-orange-600/40 font-semibold">
                  Animated ✓
                </span>
              </div>
              <p className="font-heading font-bold text-white text-xl mb-1">Workout Plan</p>
              <p className="text-gray-400 text-xs">
                {user?.gender === 'male' ? 'Male' : 'Female'} ·{' '}
                {user?.goal === 'weight_gain' ? 'Muscle Building' : 'Fat Loss'} ·{' '}
                {levelLabel[user?.fitnessLevel]}
              </p>
              <div className="mt-4 flex items-center gap-2 text-orange-400 text-sm font-semibold group-hover:gap-3 transition-all">
                View Exercises <span>→</span>
              </div>
            </Link>
          </div>
        ) : (
          /* Profile incomplete — show helpful message */
          <div className="bg-dark border border-dashed border-gray-600 rounded-2xl p-6 text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <p className="text-yellow-400 font-semibold mb-2">Profile Incomplete</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your personalized Diet & Workout plans will appear here once your profile is complete.
              <br/><br/>
              <span className="text-white font-medium">Missing fields:</span>{' '}
              {!user?.gender && <span className="text-red-400">Gender </span>}
              {!user?.goal   && <span className="text-red-400">Goal </span>}
              {!user?.fitnessLevel && <span className="text-red-400">Fitness Level </span>}
              <br/><br/>
              <span className="text-gray-500 text-xs">
                These fields are set when you fill the Join Form. If you registered before this update,
                please contact the gym owner to update your profile.
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="bg-card border border-gray-700 rounded-2xl p-5">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-4">More Features</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/client/streak',   icon: '🔥', label: 'My Streak',      sub: `${streakData?.currentStreak ?? 0} day streak` },
            { to: '/client/notes',    icon: '📝', label: 'Progress Notes',  sub: 'Daily journal' },
            { to: '/client/feedback', icon: '⭐', label: 'Give Feedback',   sub: 'Rate your experience' },
            { to: '/client/diet',     icon: '🥗', label: 'Diet Plan',       sub: profileComplete ? 'View your plan' : 'Complete profile first' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className="bg-dark hover:bg-secondary border border-gray-700 hover:border-primary/50 rounded-xl p-4 text-center transition-all group">
              <span className="text-3xl block mb-1">{item.icon}</span>
              <p className="text-white text-sm font-semibold group-hover:text-primary transition-colors">{item.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{item.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Water Tracker */}
      <div className="bg-card border border-gray-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-semibold">💧 Water Intake Tracker</p>
            <p className="text-gray-500 text-xs">Daily goal: 8 glasses · Resets every day</p>
          </div>
          <span className={`text-sm font-bold ${water >= 8 ? 'text-blue-400' : 'text-gray-400'}`}>
            {water}/8
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <button key={i} onClick={addWater}
              title={i < water ? 'Glass completed' : 'Click to add a glass'}
              className={`w-10 h-12 rounded-xl border-2 transition-all text-xl flex items-center justify-center
                ${i < water
                  ? 'bg-blue-500/30 border-blue-500 text-blue-300'
                  : 'bg-dark border-gray-700 text-gray-600 hover:border-blue-500/50 hover:text-blue-500'}`}>
              💧
            </button>
          ))}
        </div>
        {water >= 8 && (
          <p className="text-blue-400 text-xs mt-3 font-semibold">🎉 Daily water goal achieved! Great work!</p>
        )}
        {water > 0 && water < 8 && (
          <p className="text-gray-500 text-xs mt-2">{8 - water} more glasses to reach your goal</p>
        )}
      </div>

      {/* Monthly stats */}
      {streakData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['This Month',     `${streakData.thisMonthCount}/${streakData.daysInMonth}`, 'days present'],
            ['Attendance %',   `${streakData.attendancePercent}%`, streakData.attendancePercent >= 75 ? '🏆 Regular' : '📉 Low'],
            ['Best Streak',    `${streakData.longestStreak}`,       'days in a row'],
            ['Current Streak', `${streakData.currentStreak}`,       '🔥 keep going!'],
          ].map(([label, val, sub]) => (
            <div key={label} className="bg-card border border-gray-700 rounded-2xl p-4 text-center">
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="font-heading font-black text-2xl text-white mt-1">{val}</p>
              <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}