import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const feelingOptions = [
  { val: 'great', icon: '🔥', label: 'Great' },
  { val: 'good',  icon: '💪', label: 'Good'  },
  { val: 'okay',  icon: '😐', label: 'Okay'  },
  { val: 'bad',   icon: '😴', label: 'Tired' },
];

export default function WorkoutLogPage() {
  const [plan,      setPlan]      = useState(null);
  const [logs,      setLogs]      = useState([]);
  const [prs,       setPRs]       = useState({});
  const [activeDay, setActiveDay] = useState(0);
  const [feeling,   setFeeling]   = useState('good');
  const [sessionNote, setSessionNote] = useState('');
  const [exerciseData, setExerciseData] = useState({});
  const [saving,    setSaving]    = useState(false);
  const [tab,       setTab]       = useState('log');  // 'log' | 'history' | 'prs'

  useEffect(() => {
    api.get('/client/workout-plan').then(r => setPlan(r.data)).catch(() => {});
    api.get('/workoutlog').then(r => setLogs(r.data)).catch(() => {});
    api.get('/workoutlog/prs').then(r => setPRs(r.data)).catch(() => {});
  }, []);

  const today = plan?.days?.[activeDay];

  const updateExercise = (exName, field, value) => {
    setExerciseData(prev => ({
      ...prev,
      [exName]: { ...prev[exName], [field]: value }
    }));
  };

  const toggleComplete = (exName) => {
    setExerciseData(prev => ({
      ...prev,
      [exName]: { ...prev[exName], completed: !prev[exName]?.completed }
    }));
  };

  const saveWorkout = async () => {
    if (!today || !today.exercises?.length) return toast.error('No exercises to log');

    const exercises = today.exercises.map(ex => ({
      name:       ex.name,
      targetSets: ex.sets,
      targetReps: ex.reps,
      actualSets: Number(exerciseData[ex.name]?.sets)   || 0,
      actualReps: Number(exerciseData[ex.name]?.reps)   || 0,
      weight:     Number(exerciseData[ex.name]?.weight) || 0,
      completed:  exerciseData[ex.name]?.completed || false,
    }));

    setSaving(true);
    try {
      const r = await api.post('/workoutlog', {
        dayName: today.day,
        focus:   today.focus,
        exercises,
        notes:   sessionNote,
        feeling,
      });

      // Check for PRs
      const newPRs = r.data.exercises.filter(e => e.isPR);
      if (newPRs.length > 0) {
        newPRs.forEach(pr => toast.success(`🎉 New PR! ${pr.name}: ${pr.weight}kg`));
      }

      toast.success('✅ Workout logged!');
      setExerciseData({});
      setSessionNote('');

      // Refresh
      const [logsRes, prsRes] = await Promise.all([
        api.get('/workoutlog'),
        api.get('/workoutlog/prs'),
      ]);
      setLogs(logsRes.data);
      setPRs(prsRes.data);
      setTab('history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save workout');
    }
    setSaving(false);
  };

  const fmtDate = d =>
    new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const todayAbbr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  const inp = "bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:outline-none w-full";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">📓 Workout Log</h1>
        <p className="text-gray-400 text-sm mt-1">Track your actual weights and reps</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-card border border-gray-700 rounded-2xl p-1">
        {[
          { key: 'log',     label: '📝 Log Workout' },
          { key: 'history', label: '📅 History' },
          { key: 'prs',     label: '🏆 Personal Records' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors
              ${tab === t.key ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LOG TAB ── */}
      {tab === 'log' && (
        <div className="space-y-4">
          {/* Day tabs */}
          {plan && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {plan.days.map((day, i) => {
                const abbr    = day.day.substring(0,3);
                const isToday = abbr === todayAbbr;
                return (
                  <button key={i} onClick={() => setActiveDay(i)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all border
                      ${activeDay === i ? 'bg-primary border-primary text-white'
                      : isToday       ? 'bg-primary/20 border-primary/50 text-primary'
                      :                 'bg-card border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    {abbr}{isToday && <span className="ml-1 text-accent">•</span>}
                  </button>
                );
              })}
            </div>
          )}

          {today && (
            <div className="space-y-3">
              <div className="bg-card border border-gray-700 rounded-2xl p-4">
                <p className="font-heading font-bold text-white">{today.day}</p>
                <p className="text-primary text-sm">{today.focus}</p>
              </div>

              {/* Feeling */}
              <div className="bg-card border border-gray-700 rounded-2xl p-4">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">How do you feel today?</p>
                <div className="flex gap-2">
                  {feelingOptions.map(f => (
                    <button key={f.val} onClick={() => setFeeling(f.val)}
                      className={`flex-1 py-2 rounded-xl text-center text-sm border transition-all
                        ${feeling === f.val
                          ? 'bg-primary border-primary text-white'
                          : 'bg-dark border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                      <span className="block text-lg">{f.icon}</span>
                      <span className="text-xs">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercises */}
              {today.exercises?.length > 0 && !today.focus?.toLowerCase().includes('rest') ? (
                <div className="space-y-3">
                  {today.exercises.map((ex, i) => {
                    const data  = exerciseData[ex.name] || {};
                    const pr    = prs[ex.name];
                    const isPR  = data.weight && pr && Number(data.weight) > pr.weight;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`bg-card border rounded-2xl p-4 transition-all
                          ${data.completed ? 'border-green-600/50 bg-green-600/5' : 'border-gray-700'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold text-sm">{ex.name}</p>
                            <p className="text-gray-500 text-xs">Target: {ex.sets} sets × {ex.reps}</p>
                            {pr && <p className="text-accent text-xs">🏆 PR: {pr.weight}kg</p>}
                          </div>
                          <button onClick={() => toggleComplete(ex.name)}
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                              ${data.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-600 text-transparent'}`}>
                            ✓
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-gray-500 text-xs mb-1 block">Sets done</label>
                            <input type="number" placeholder={ex.sets} value={data.sets || ''}
                              onChange={e => updateExercise(ex.name, 'sets', e.target.value)}
                              className={inp}/>
                          </div>
                          <div>
                            <label className="text-gray-500 text-xs mb-1 block">Reps done</label>
                            <input type="number" placeholder="reps" value={data.reps || ''}
                              onChange={e => updateExercise(ex.name, 'reps', e.target.value)}
                              className={inp}/>
                          </div>
                          <div>
                            <label className="text-gray-500 text-xs mb-1 block">Weight (kg)</label>
                            <input type="number" placeholder="kg" value={data.weight || ''}
                              onChange={e => updateExercise(ex.name, 'weight', e.target.value)}
                              className={`${inp} ${isPR ? 'border-accent text-accent' : ''}`}/>
                          </div>
                        </div>
                        {isPR && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-accent text-xs font-bold mt-2">
                            🎉 New Personal Record!
                          </motion.p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-gray-700 rounded-2xl p-8 text-center">
                  <p className="text-3xl mb-2">😴</p>
                  <p className="text-gray-400">Rest day — no exercises to log</p>
                </div>
              )}

              {/* Session note */}
              {today.exercises?.length > 0 && !today.focus?.toLowerCase().includes('rest') && (
                <>
                  <div className="bg-card border border-gray-700 rounded-2xl p-4">
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2 block">Session Notes</label>
                    <textarea rows={2} value={sessionNote} onChange={e => setSessionNote(e.target.value)}
                      placeholder="How did the session go? Any notes for next time…"
                      className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none resize-none"/>
                  </div>

                  <button onClick={saveWorkout} disabled={saving}
                    className="w-full bg-primary hover:bg-orange-600 disabled:opacity-60 text-white font-heading font-bold py-4 rounded-xl text-base transition-colors">
                    {saving ? 'Saving…' : '💾 Save Workout Session'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="bg-card border border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-white font-semibold">No workout logs yet</p>
              <p className="text-gray-500 text-sm mt-1">Log your first workout to see history here</p>
            </div>
          ) : (
            logs.map((log, i) => {
              const feelingMap = { great: '🔥', good: '💪', okay: '😐', bad: '😴' };
              const completed  = log.exercises.filter(e => e.completed).length;
              return (
                <div key={log._id} className="bg-card border border-gray-700 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-heading font-bold text-white">{log.dayName}</p>
                      <p className="text-primary text-xs">{log.focus}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">{fmtDate(log.date)}</p>
                      <p className="text-xl mt-1">{feelingMap[log.feeling] || '💪'}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mb-3">
                    {completed}/{log.exercises.length} exercises completed
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {log.exercises.filter(e => e.weight || e.actualReps).map((ex, j) => (
                      <div key={j} className="flex items-center justify-between bg-dark rounded-lg px-3 py-1.5 text-xs">
                        <span className={`${ex.completed ? 'text-green-400' : 'text-gray-400'}`}>
                          {ex.completed ? '✅' : '⬜'} {ex.name}
                        </span>
                        <div className="flex gap-2 text-gray-500">
                          {ex.actualSets > 0 && <span>{ex.actualSets}×{ex.actualReps}</span>}
                          {ex.weight > 0 && <span className={`font-semibold ${ex.isPR ? 'text-accent' : 'text-white'}`}>{ex.weight}kg {ex.isPR && '🏆'}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {log.notes && (
                    <p className="text-gray-500 text-xs italic mt-3 border-t border-gray-800 pt-2">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── PRs TAB ── */}
      {tab === 'prs' && (
        <div className="space-y-3">
          <div className="bg-card border border-gray-700 rounded-2xl p-4 mb-2">
            <p className="text-gray-400 text-sm">Your best performance for each exercise across all sessions</p>
          </div>
          {Object.keys(prs).length === 0 ? (
            <div className="bg-card border border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-white font-semibold">No records yet</p>
              <p className="text-gray-500 text-sm mt-1">Start logging workouts with weights to track your PRs</p>
            </div>
          ) : (
            Object.entries(prs)
              .sort((a, b) => b[1].weight - a[1].weight)
              .map(([name, pr], i) => (
                <motion.div key={name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between bg-card border border-gray-700 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'}
                    </span>
                    <div>
                      <p className="text-white font-semibold text-sm">{name}</p>
                      <p className="text-gray-500 text-xs">{fmtDate(pr.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-black text-xl text-accent">{pr.weight} kg</p>
                  </div>
                </motion.div>
              ))
          )}
        </div>
      )}
    </div>
  );
}