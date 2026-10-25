import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

// Simple SVG line chart
function WeightChart({ logs, goal }) {
  if (logs.length < 2) return (
    <div className="h-40 flex items-center justify-center text-gray-600 text-sm">
      Add at least 2 entries to see the chart
    </div>
  );

  const W = 500, H = 160, PAD = 30;
  const weights = logs.map(l => l.weight);
  const minW    = Math.min(...weights) - 2;
  const maxW    = Math.max(...weights) + 2;
  const range   = maxW - minW || 1;

  const toX = i  => PAD + (i / (logs.length - 1)) * (W - PAD * 2);
  const toY = w  => H - PAD - ((w - minW) / range) * (H - PAD * 2);

  const points = logs.map((l, i) => `${toX(i)},${toY(l.weight)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = PAD + pct * (H - PAD * 2);
        const w = maxW - pct * range;
        return (
          <g key={pct}>
            <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#374151" strokeWidth="1" strokeDasharray="4,4"/>
            <text x={PAD - 5} y={y + 4} textAnchor="end" fill="#6B7280" fontSize="10">{w.toFixed(1)}</text>
          </g>
        );
      })}

      {/* Goal line */}
      {goal && goal >= minW && goal <= maxW && (
        <>
          <line x1={PAD} y1={toY(goal)} x2={W - PAD} y2={toY(goal)}
            stroke="#FFD700" strokeWidth="1.5" strokeDasharray="6,3"/>
          <text x={W - PAD + 5} y={toY(goal) + 4} fill="#FFD700" fontSize="10">Goal</text>
        </>
      )}

      {/* Area fill */}
      <polyline points={points} fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Dots */}
      {logs.map((l, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(l.weight)} r="4" fill="#FF6B35" stroke="#0F0F1A" strokeWidth="2"/>
          <text x={toX(i)} y={toY(l.weight) - 10} textAnchor="middle" fill="#FF6B35" fontSize="10" fontWeight="bold">
            {l.weight}
          </text>
        </g>
      ))}

      {/* X axis labels */}
      {logs.map((l, i) => (
        i % Math.max(1, Math.floor(logs.length / 5)) === 0 && (
          <text key={i} x={toX(i)} y={H - 5} textAnchor="middle" fill="#6B7280" fontSize="9">
            {new Date(l.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
          </text>
        )
      ))}
    </svg>
  );
}

export default function WeightTracker() {
  const { user }                    = useAuth();
  const [logs,    setLogs]          = useState([]);
  const [loading, setLoading]       = useState(true);
  const [weight,  setWeight]        = useState('');
  const [note,    setNote]          = useState('');
  const [saving,  setSaving]        = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [goalWeight, setGoalWeight] = useState('');

  useEffect(() => {
    api.get('/weight')
      .then(r => setLogs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    const saved = localStorage.getItem(`goalWeight_${user?._id}`);
    if (saved) setGoalWeight(saved);
  }, [user]);

  const saveGoal = () => {
    if (!goalWeight) return;
    localStorage.setItem(`goalWeight_${user?._id}`, goalWeight);
    toast.success('🎯 Goal weight saved!');
  };

  const addWeight = async () => {
    if (!weight || isNaN(weight)) return toast.error('Enter a valid weight');
    if (weight < 20 || weight > 300) return toast.error('Weight must be between 20–300 kg');
    setSaving(true);
    try {
      const r = await api.post('/weight', { weight: Number(weight), note });
      setLogs(prev => [...prev, r.data]);
      setWeight(''); setNote('');
      toast.success('✅ Weight logged!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log weight');
    }
    setSaving(false);
  };

  const deleteLog = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    setDeleting(id);
    try {
      await api.delete(`/weight/${id}`);
      setLogs(prev => prev.filter(l => l._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
    setDeleting(null);
  };

  // Stats
  const firstWeight   = logs[0]?.weight;
  const latestWeight  = logs[logs.length - 1]?.weight;
  const totalChange   = firstWeight && latestWeight ? (latestWeight - firstWeight).toFixed(1) : null;
  const isGaining     = totalChange > 0;
  const goal          = parseFloat(goalWeight) || null;
  const toGoal        = goal && latestWeight ? (goal - latestWeight).toFixed(1) : null;

  const inp = "bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">📈 Weight Tracker</h1>
        <p className="text-gray-400 text-sm mt-1">Log your weight weekly to track progress</p>
      </div>

      {/* Stats */}
      {logs.length >= 2 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Starting', `${firstWeight} kg`, 'when you joined'],
            ['Current',  `${latestWeight} kg`, 'latest entry'],
            ['Change',   totalChange !== null ? `${totalChange > 0 ? '+' : ''}${totalChange} kg` : '–',
              user?.goal === 'weight_gain'
                ? (isGaining ? '✅ On track' : '📉 Behind goal')
                : (!isGaining ? '✅ On track' : '📈 Above goal')],
            ['To Goal',  toGoal ? `${toGoal > 0 ? '+' : ''}${toGoal} kg` : '–', 'remaining'],
          ].map(([label, val, sub]) => (
            <div key={label} className="bg-card border border-gray-700 rounded-2xl p-4 text-center">
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="font-heading font-black text-xl text-white mt-1">{val}</p>
              <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {logs.length >= 2 && (
        <div className="bg-card border border-gray-700 rounded-2xl p-5">
          <p className="text-white font-semibold mb-3">Weight Progress Chart</p>
          <WeightChart logs={logs} goal={goal} />
        </div>
      )}

      {/* Goal + Add Weight */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Set Goal */}
        <div className="bg-card border border-gray-700 rounded-2xl p-5 space-y-3">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">🎯 Set Goal Weight</p>
          <div className="flex gap-2">
            <input type="number" placeholder="e.g. 70" value={goalWeight}
              onChange={e => setGoalWeight(e.target.value)}
              className={`flex-1 ${inp}`}/>
            <span className="flex items-center text-gray-500 text-sm">kg</span>
          </div>
          <button onClick={saveGoal}
            className="w-full bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent font-semibold py-2.5 rounded-xl text-sm transition-colors">
            Save Goal
          </button>
        </div>

        {/* Log Weight */}
        <div className="bg-card border border-gray-700 rounded-2xl p-5 space-y-3">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">➕ Log Today's Weight</p>
          <input type="number" placeholder="Your weight in kg" value={weight}
            onChange={e => setWeight(e.target.value)}
            className={`w-full ${inp}`}/>
          <input type="text" placeholder="Note (optional)" value={note}
            onChange={e => setNote(e.target.value)}
            className={`w-full ${inp}`}/>
          <button onClick={addWeight} disabled={saving || !weight}
            className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
            {saving ? 'Saving…' : '💾 Log Weight'}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-card border border-gray-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-semibold">Weight History</p>
          <span className="text-gray-600 text-xs">{logs.length} entries</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-dark rounded-xl animate-pulse"/>)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">⚖️</p>
            <p className="text-gray-500 text-sm">No entries yet — log your first weight above!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {[...logs].reverse().map((log, i) => {
              const prev   = logs[logs.length - 2 - i];
              const diff   = prev ? (log.weight - prev.weight).toFixed(1) : null;
              return (
                <div key={log._id}
                  className="flex items-center justify-between bg-dark rounded-xl px-4 py-3 group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"/>
                    <div>
                      <p className="text-white text-sm font-semibold">{log.weight} kg</p>
                      {log.note && <p className="text-gray-500 text-xs italic">{log.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {diff !== null && (
                        <p className={`text-xs font-semibold ${parseFloat(diff) > 0 ? 'text-green-400' : parseFloat(diff) < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                          {parseFloat(diff) > 0 ? '+' : ''}{diff} kg
                        </p>
                      )}
                      <p className="text-gray-600 text-xs">
                        {new Date(log.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
                    </div>
                    <button onClick={() => deleteLog(log._id)} disabled={deleting === log._id}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-lg">
                      {deleting === log._id ? '…' : '×'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}