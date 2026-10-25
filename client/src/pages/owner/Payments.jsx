import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const planLabel  = p => ({ '1_month':'1 Month', '3_month':'3 Months', '6_month':'6 Months' })[p] || '–';
const modeIcon   = m => ({ cash:'💵', upi:'📱', card:'💳', other:'🔖' })[m] || '💵';
const planAmount = p => ({ '1_month': 999, '3_month': 2499, '6_month': 4499 })[p] || 0;

export default function Payments() {
  const [members,  setMembers]  = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState('add');   // 'add' | 'history'
  const [deleting, setDeleting] = useState(null);

  const [form, setForm] = useState({
    userId: '', amount: '', plan: '', paymentMode: 'cash', note: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/owner/members'),
      api.get('/payments'),
      api.get('/payments/stats'),
    ]).then(([m, p, s]) => {
      setMembers(m.data);
      setPayments(p.data);
      setStats(s.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-fill amount when plan selected
  const handlePlanChange = (plan) => {
    setForm(f => ({ ...f, plan, amount: planAmount(plan) || f.amount }));
  };

  // Auto-fill plan when member selected
  const handleMemberChange = (userId) => {
    const member = members.find(m => m._id === userId);
    const plan   = member?.selectedPlan || '';
    setForm(f => ({ ...f, userId, plan, amount: planAmount(plan) || f.amount }));
  };

  const submitPayment = async () => {
    if (!form.userId) return toast.error('Please select a member');
    if (!form.amount || isNaN(form.amount)) return toast.error('Enter a valid amount');

    setSaving(true);
    try {
      const r = await api.post('/payments', {
        userId:      form.userId,
        amount:      Number(form.amount),
        plan:        form.plan || undefined,
        paymentMode: form.paymentMode,
        note:        form.note,
      });
      toast.success('✅ Payment recorded! Plan updated automatically.');
      setForm({ userId: '', amount: '', plan: '', paymentMode: 'cash', note: '' });

      // Refresh
      const [p, s] = await Promise.all([api.get('/payments'), api.get('/payments/stats')]);
      setPayments(p.data);
      setStats(s.data);
      setTab('history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
    setSaving(false);
  };

  const deletePayment = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    setDeleting(id);
    try {
      await api.delete(`/payments/${id}`);
      setPayments(prev => prev.filter(p => p._id !== id));
      const s = await api.get('/payments/stats');
      setStats(s.data);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
    setDeleting(null);
  };

  const fmtDate = d =>
    new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  const exportCSV = () => {
    const headers = ['Member','Amount','Plan','Mode','Note','Date'];
    const rows    = payments.map(p => [
      p.memberName, `₹${p.amount}`, planLabel(p.plan),
      p.paymentMode, p.note || '–', fmtDate(p.paidAt)
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'payments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const inp = "w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">💰 Payment Records</h1>
        <p className="text-gray-400 text-sm mt-1">Record physical payments and manage billing</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Total Revenue',    `₹${stats.totalRevenue?.toLocaleString('en-IN')}`, 'all time'],
            ['This Month',       `₹${stats.thisMonthRevenue?.toLocaleString('en-IN')}`, new Date().toLocaleString('default',{month:'long'})],
            ['Total Payments',   stats.totalPayments, 'transactions'],
          ].map(([label, val, sub]) => (
            <div key={label} className="bg-card border border-gray-700 rounded-2xl p-4 text-center">
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="font-heading font-black text-xl text-white mt-1">{val}</p>
              <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-card border border-gray-700 rounded-2xl p-1">
        {[
          { key: 'add',     label: '➕ Add Payment' },
          { key: 'history', label: `📋 History (${payments.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors
              ${tab === t.key ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ADD PAYMENT ── */}
      {tab === 'add' && (
        <div className="bg-card border border-gray-700 rounded-2xl p-6 space-y-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Payment Details</p>

          {/* Member */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Select Member *</label>
            <select className={inp} value={form.userId} onChange={e => handleMemberChange(e.target.value)}>
              <option value="">— Choose a member —</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name} — {m.phone}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Plan */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Plan</label>
              <select className={inp} value={form.plan} onChange={e => handlePlanChange(e.target.value)}>
                <option value="">— Select plan —</option>
                <option value="1_month">1 Month — ₹999</option>
                <option value="3_month">3 Months — ₹2,499</option>
                <option value="6_month">6 Months — ₹4,499</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Amount (₹) *</label>
              <input type="number" placeholder="e.g. 2499" className={inp}
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}/>
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Payment Mode *</label>
            <div className="flex gap-2">
              {[
                { val: 'cash',  icon: '💵', label: 'Cash' },
                { val: 'upi',   icon: '📱', label: 'UPI'  },
                { val: 'card',  icon: '💳', label: 'Card' },
                { val: 'other', icon: '🔖', label: 'Other'},
              ].map(m => (
                <button key={m.val} onClick={() => setForm({ ...form, paymentMode: m.val })}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all
                    ${form.paymentMode === m.val
                      ? 'bg-primary border-primary text-white'
                      : 'bg-dark border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                  <span className="block text-xl">{m.icon}</span>
                  <span className="text-xs">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Note (Optional)</label>
            <input type="text" placeholder="e.g. Renewal, advance payment, etc."
              className={inp} value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}/>
          </div>

          {/* Info box */}
          {form.plan && (
            <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-3 text-xs text-green-300">
              ✅ Saving this will automatically extend {members.find(m=>m._id===form.userId)?.name || 'the member'}'s plan
              by <strong>{planLabel(form.plan)}</strong> from today.
            </div>
          )}

          <button onClick={submitPayment} disabled={saving || !form.userId || !form.amount}
            className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 text-white font-heading font-bold py-4 rounded-xl text-base transition-colors">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                Recording…
              </span>
            ) : '💾 Record Payment'}
          </button>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <div className="space-y-3">
          {payments.length > 0 && (
            <div className="flex justify-end">
              <button onClick={exportCSV}
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                ⬇ Export CSV
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-gray-700"/>)}
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-card border border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">💳</p>
              <p className="text-white font-semibold">No payments recorded yet</p>
              <p className="text-gray-500 text-sm mt-1">Add your first payment using the form above</p>
            </div>
          ) : (
            payments.map((p, i) => (
              <motion.div key={p._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card border border-gray-700 rounded-2xl p-5 flex items-center gap-4 group">

                {/* Mode icon */}
                <div className="w-12 h-12 bg-dark border border-gray-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {modeIcon(p.paymentMode)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{p.memberName}</p>
                    {p.plan && (
                      <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/30">
                        {planLabel(p.plan)}
                      </span>
                    )}
                    <span className="bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full capitalize">
                      {p.paymentMode}
                    </span>
                  </div>
                  {p.note && <p className="text-gray-500 text-xs mt-0.5 italic">{p.note}</p>}
                  <p className="text-gray-600 text-xs mt-1">{fmtDate(p.paidAt)}</p>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className="font-heading font-black text-xl text-green-400">
                    ₹{p.amount?.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Delete */}
                <button onClick={() => deletePayment(p._id)} disabled={deleting === p._id}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0">
                  {deleting === p._id ? '…' : '🗑'}
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}