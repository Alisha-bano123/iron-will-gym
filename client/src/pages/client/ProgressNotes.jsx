import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const placeholders = [
  "Felt strong today! Hit a new PR on bench press 💪",
  "Skipped legs… will make up tomorrow",
  "Energy was low today but still pushed through",
  "Great session! Cardio felt easy for once",
  "Increased squat weight by 5kg today 🔥",
  "Had a perfect diet day — stuck to the plan!",
  "Rest day. Body needed it after yesterday's session.",
];

export default function ProgressNotes() {
  const [notes,    setNotes]    = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const placeholder = placeholders[new Date().getDate() % placeholders.length];

  useEffect(() => {
    api.get('/client/progress-notes')
      .then(r => setNotes(r.data))
      .catch(() => toast.error('Failed to load notes'))
      .finally(() => setLoading(false));
  }, []);

  const saveNote = async () => {
    if (!text.trim())        return toast.error('Write something first!');
    if (text.trim().length < 3) return toast.error('Note is too short');
    setSaving(true);
    try {
      const r = await api.post('/client/progress-note', { text: text.trim() });
      setNotes(r.data);
      setText('');
      toast.success('📝 Note saved!');
    } catch {
      toast.error('Failed to save note');
    }
    setSaving(false);
  };

  const deleteNote = async (index) => {
    if (!window.confirm('Delete this note?')) return;
    setDeleting(index);
    try {
      const r = await api.delete(`/client/progress-note/${index}`);
      setNotes(r.data);
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete');
    }
    setDeleting(null);
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">📝 Progress Notes</h1>
        <p className="text-gray-400 text-sm mt-1">
          Log your daily workouts, feelings and wins — only you can see these
        </p>
      </div>

      {/* Add Note */}
      <div className="bg-card border border-gray-700 rounded-2xl p-5 space-y-3">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Today's Note</p>
        <textarea
          rows={4}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition-colors resize-none placeholder-gray-600"
        />
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-xs">{text.length} chars</p>
          <button
            onClick={saveNote}
            disabled={saving || !text.trim()}
            className="bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : '💾 Save Note'}
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Your Journal</p>
          <span className="text-gray-600 text-xs">{notes.length} {notes.length === 1 ? 'entry' : 'entries'}</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-gray-700" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-card border border-gray-700 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">📓</p>
            <p className="text-white font-semibold">Your journal is empty</p>
            <p className="text-gray-500 text-sm mt-1">
              Start logging your progress — every entry counts!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {notes.map((note, i) => (
              <motion.div
                key={`${note.date}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-gray-700 hover:border-gray-600 rounded-2xl p-5 group transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1">
                    {/* Note number badge */}
                    <div className="w-8 h-8 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                      {notes.length - i}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm leading-relaxed">{note.text}</p>
                      <p className="text-gray-600 text-xs mt-2">{fmtDate(note.date)}</p>
                    </div>
                  </div>

                  {/* Delete button — shows on hover */}
                  <button
                    onClick={() => deleteNote(i)}
                    disabled={deleting === i}
                    title="Delete note"
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0"
                  >
                    {deleting === i ? (
                      <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : '🗑'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}