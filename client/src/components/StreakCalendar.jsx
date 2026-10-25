import React from 'react';

export default function StreakCalendar({ records, year, month }) {
  const today       = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Present dates ka set banao quick lookup ke liye
  const presentDates = new Set(
    (records || []).map(r => {
      const d = new Date(r.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const isPresent = (day) => presentDates.has(`${year}-${month}-${day}`);
  const isToday   = (day) => today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  const isPast    = (day) => new Date(year, month, day) < today && !isToday(day);

  const days   = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs text-gray-500 font-semibold py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, b) => <div key={`blank-${b}`} />)}
        {days.map(day => {
          const present = isPresent(day);
          const today_  = isToday(day);
          const past    = isPast(day);

          let cls = 'w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-semibold transition-all ';
          if (today_ && present) cls += 'bg-green-500 border-2 border-accent text-white';
          else if (today_)       cls += 'border-2 border-accent text-accent';
          else if (present)      cls += 'bg-green-500 text-white';
          else if (past)         cls += 'bg-red-500/30 text-red-400';
          else                   cls += 'text-gray-600';

          return (
            <div key={day} className="flex flex-col items-center py-0.5">
              <div className={cls}>{day}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 flex-wrap justify-center text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Present</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500/40 inline-block" /> Absent</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-accent inline-block" /> Today</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-700 inline-block" /> Upcoming</span>
      </div>
    </div>
  );
}