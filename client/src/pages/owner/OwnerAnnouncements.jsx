import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function OwnerAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(null);
  const [tab,           setTab]           = useState('create');

  const [form, setForm] = useState({
    title: '', message: '', important: false, expiresAt: ''
  });

  const fetchAll = () =>
    api.get('/announcements/all')
      .then(r => setAnnouncements(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchAll(); }, []);

  const submit = async () => {
    if (!form.title.trim())   return toast.error('Title is required');
    if (!form.message.trim()) return toast.error('Message is required');

    setSaving(true);
    try {
      await api.post('/announcements', {
        title:     form.title.trim(),
        message:   form.message.trim(),
        important: form.important,
        expiresAt: form.expiresAt || null,
      });
      toast.success('📢 Announcement posted! All members can see it.');
      setForm({ title: '', message: '', important: false, expiresAt: '' });
      fetchAll();
      setTab('manage');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    }
    setSaving(false);
  };

  const deleteAnn = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    setDeleting(id);
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
    setDeleting(null);
  };

  const fmtDate = d =>
    new Date(d).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });

  const inp = "w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">📢 Announcements</h1>
        <p className="text-gray-400 text-sm mt-1">Post updates for all gym members</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-card border border-gray-700 rounded-2xl p-1">
        {[
          { key: 'create', label: '✏️ Create New'             },
          { key: 'manage', label: `📋 Manage (${announcements.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors
              ${tab === t.key ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CREATE ── */}
      {tab === 'create' && (
        <div className="bg-card border border-gray-700 rounded-2xl p-6 space-y-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">New Announcement</p>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Title *</label>
            <input className={inp} placeholder="e.g. Gym Closed Sunday, New Batch Starting…"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Message *</label>
            <textarea rows={4} className={inp} placeholder="Write your announcement here…"
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              style={{ resize: 'vertical' }}/>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Expires On (Optional)</label>
            <input type="date" className={inp}
              min={new Date().toISOString().split('T')[0]}
              value={form.expiresAt}
              onChange={e => setForm({ ...form, expiresAt: e.target.value })}/>
            <p className="text-gray-600 text-xs mt-1">Leave empty to show indefinitely</p>
          </div>

          {/* Important toggle */}
          <div
            onClick={() => setForm({ ...form, important: !form.important })}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
              ${form.important
                ? 'bg-red-500/10 border-red-500/50'
                : 'bg-dark border-gray-700 hover:border-gray-500'}`}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
              ${form.important ? 'bg-red-500 border-red-500' : 'border-gray-500'}`}>
              {form.important && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <div>
              <p className={`text-sm font-semibold ${form.important ? 'text-red-400' : 'text-gray-300'}`}>
                🚨 Mark as Important
              </p>
              <p className="text-gray-500 text-xs">Will appear with red highlight for all members</p>
            </div>
          </div>

          {/* Preview */}
          {(form.title || form.message) && (
            <div className={`rounded-2xl p-4 border ${form.important ? 'border-red-500/40 bg-red-500/5' : 'border-gray-600 bg-dark/60'}`}>
              <p className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Preview</p>
              <div className="flex items-start gap-2">
                <span className="text-xl">{form.important ? '🚨' : '📢'}</span>
                <div>
                  <p className="font-heading font-bold text-white text-sm">{form.title || 'Title…'}</p>
                  <p className="text-gray-300 text-sm mt-1">{form.message || 'Message…'}</p>
                </div>
              </div>
            </div>
          )}

          <button onClick={submit} disabled={saving || !form.title || !form.message}
            className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 text-white font-heading font-bold py-4 rounded-xl text-base transition-colors">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                Posting…
              </span>
            ) : '📢 Post Announcement'}
          </button>
        </div>
      )}

      {/* ── MANAGE ── */}
      {tab === 'manage' && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-card rounded-2xl animate-pulse border border-gray-700"/>)}
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-card border border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-white font-semibold">No announcements yet</p>
              <p className="text-gray-500 text-sm mt-1">Create your first announcement above</p>
            </div>
          ) : (
            <AnimatePresence>
              {announcements.map((ann, i) => {
                const isExpired = ann.expiresAt && new Date(ann.expiresAt) < new Date();
                return (
                  <motion.div key={ann._id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
                    className={`bg-card border rounded-2xl p-5 group
                      ${ann.important ? 'border-red-500/40' : 'border-gray-700'}
                      ${isExpired ? 'opacity-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{ann.important ? '🚨' : '📢'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-heading font-bold text-white">{ann.title}</p>
                          {ann.important && (
                            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/30 font-semibold">
                              Important
                            </span>
                          )}
                          {isExpired && (
                            <span className="bg-gray-700 text-gray-500 text-xs px-2 py-0.5 rounded-full font-semibold">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{ann.message}</p>
                        <div className="flex gap-3 mt-2 text-xs text-gray-600">
                          <span>Posted: {fmtDate(ann.createdAt)}</span>
                          {ann.expiresAt && <span>· Expires: {fmtDate(ann.expiresAt)}</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteAnn(ann._id)} disabled={deleting === ann._id}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0">
                        {deleting === ann._id ? '…' : '🗑'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}