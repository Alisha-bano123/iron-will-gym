import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import StreakCalendar from '../../components/StreakCalendar';
import api from '../../utils/api';

const MONTHS = ['January','February','March','April','May','June','July',
                'August','September','October','November','December'];

export default function AttendanceOwner() {
  const [members,  setMembers]  = useState([]);
  const [selected, setSelected] = useState('');
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [marking,  setMarking]  = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year,  setYear]  = useState(new Date().getFullYear());

  // All members fetch
  useEffect(() => {
    api.get('/owner/members').then(r => setMembers(r.data)).catch(() => {});
  }, []);

  // Selected member ki attendance fetch
  const fetchAttendance = (uid) => {
    if (!uid) { setRecords([]); return; }
    setLoading(true);
    api.get(`/owner/attendance/${uid}`)
      .then(r => setRecords(r.data))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAttendance(selected); }, [selected]);

  // Owner manually aaj ki attendance mark kare
  const markToday = async () => {
    if (!selected) return toast.error('Please select a member first');
    setMarking(true);
    try {
      await api.post('/owner/attendance/mark', { userId: selected });
      toast.success('✅ Attendance marked for today!');
      fetchAttendance(selected);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking attendance');
    }
    setMarking(false);
  };

  // Owner custom date ki attendance mark kare
  const markDate = async (dateStr) => {
    if (!selected) return toast.error('Please select a member first');
    setMarking(true);
    try {
      await api.post('/owner/attendance/mark', { userId: selected, date: dateStr });
      toast.success(`✅ Attendance marked for ${new Date(dateStr).toLocaleDateString('en-IN')}`);
      fetchAttendance(selected);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already marked for this date');
    }
    setMarking(false);
  };

  const selectedMember = members.find(m => m._id === selected);
  const daysInMonth    = new Date(year, month + 1, 0).getDate();
  const monthRecords   = records.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const pct       = daysInMonth ? Math.round((monthRecords.length / daysInMonth) * 100) : 0;
  const isRegular = pct >= 75;

  // Current streak
  let currentStreak = 0;
  const dateSet   = new Set(records.map(r => new Date(r.date).toDateString()));
  const checkDate = new Date(); checkDate.setHours(0, 0, 0, 0);
  while (dateSet.has(checkDate.toDateString())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Aaj marked hai ya nahi
  const todayStr    = new Date().toDateString();
  const markedToday = dateSet.has(todayStr);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">Attendance Tracker 📅</h1>
        <p className="text-gray-400 text-sm mt-1">View and manually mark attendance for any member</p>
      </div>

      {/* Member Selector */}
      <div className="bg-card border border-gray-700 rounded-2xl p-5">
        <label className="text-gray-400 text-xs mb-2 block font-semibold uppercase tracking-wide">Select Member</label>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          className="w-full sm:w-96 bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none">
          <option value="">— Choose a member —</option>
          {members.map(m => (
            <option key={m._id} value={m._id}>{m.name} — {m.phone}</option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          {/* Member info + Manual Marking */}
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Member card */}
            <div className="bg-card border border-gray-700 rounded-2xl p-5">
              <p className="text-gray-400 text-xs mb-1 font-semibold uppercase tracking-wide">Member</p>
              <p className="font-heading font-bold text-white text-lg">{selectedMember?.name}</p>
              <p className="text-gray-500 text-sm">{selectedMember?.email}</p>
              <p className="text-gray-500 text-sm">{selectedMember?.phone}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className={`text-xs px-3 py-1 rounded-full border font-semibold
                  ${isRegular
                    ? 'bg-green-600/20 text-green-400 border-green-600/30'
                    : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                  {isRegular ? '🏆 Regular' : '📊 Irregular'}
                </span>
                <span className="bg-primary/20 text-primary border border-primary/30 text-xs px-3 py-1 rounded-full font-semibold">
                  🔥 {currentStreak} Day Streak
                </span>
              </div>
            </div>

            {/* Manual Mark Attendance */}
            <div className="bg-card border border-gray-700 rounded-2xl p-5 space-y-3">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Mark Attendance</p>

              {/* Mark Today button */}
              {markedToday ? (
                <div className="bg-green-600/20 border border-green-600/30 rounded-xl py-3 text-center">
                  <p className="text-green-400 text-sm font-semibold">✅ Today's attendance already marked!</p>
                </div>
              ) : (
                <button onClick={markToday} disabled={marking}
                  className="w-full bg-primary hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                  {marking ? 'Marking…' : '✅ Mark Today\'s Attendance'}
                </button>
              )}

              {/* Mark specific date */}
              <div>
                <p className="text-gray-500 text-xs mb-2">Or mark a specific past date:</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className="flex-1 bg-dark border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-primary focus:outline-none"
                    onChange={e => {
                      if (e.target.value) markDate(e.target.value);
                      e.target.value = '';
                    }}
                  />
                </div>
                <p className="text-gray-600 text-xs mt-1">Select a date to mark attendance for that day</p>
              </div>
            </div>
          </div>

          {/* Month picker */}
          <div className="bg-card border border-gray-700 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">View Month:</p>
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="bg-dark border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-primary focus:outline-none">
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="bg-dark border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-primary focus:outline-none">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['This Month',     `${monthRecords.length}/${daysInMonth}`, 'days present'],
              ['Attendance %',   `${pct}%`,           pct >= 75 ? '✅ Regular' : '📉 Low'],
              ['Current Streak', `${currentStreak}`,  'days in a row'],
              ['Total Sessions', `${records.length}`, 'all time'],
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
              <p className="text-white font-semibold">{MONTHS[month]} {year}</p>
              <span className="text-xs text-gray-500">{monthRecords.length} / {daysInMonth} days present</span>
            </div>
            {loading
              ? <p className="text-gray-400 text-center py-8">Loading calendar…</p>
              : <StreakCalendar records={records} year={year} month={month} />}
          </div>

          {/* Today's attendance list */}
          {records.length > 0 && (
            <div className="bg-card border border-gray-700 rounded-2xl p-5">
              <p className="text-white font-semibold mb-3">Recent Attendance (Last 10)</p>
              <div className="space-y-2">
                {[...records].reverse().slice(0, 10).map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-dark rounded-xl px-4 py-2">
                    <span className="text-white text-sm">
                      {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-600/30 font-semibold">✅ Present</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}