import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const planLabel = p => ({ '1_month':'1 Month', '3_month':'3 Months', '6_month':'6 Months' })[p] || '–';
const fmtDate   = d => d ? new Date(d).toLocaleDateString('en-IN') : '–';
const daysLeft  = endDate => {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
};

const DaysLeftBadge = ({ days }) => {
  if (days === null) return <span className="text-gray-500 text-xs">N/A</span>;
  const cls = days > 15 ? 'bg-green-600/20 text-green-400 border-green-600/30'
            : days > 7  ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
            :              'bg-red-600/20 text-red-400 border-red-600/30';
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cls}`}>{days}d left</span>;
};

// Edit Profile Modal
function EditModal({ member, onClose, onSaved }) {
  const [form, setForm] = useState({
    gender:       member.gender       || '',
    goal:         member.goal         || '',
    fitnessLevel: member.fitnessLevel || '',
    weight:       member.weight       || '',
    age:          member.age          || '',
    selectedPlan: member.selectedPlan || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/owner/member/update/${member._id}`, form);
      toast.success(`✅ ${member.name}'s profile updated!`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const inp = "w-full bg-dark border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-card border border-gray-700 rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-white text-lg">Edit — {member.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Gender</label>
            <select className={inp} value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
              <option value="">–</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Fitness Level</label>
            <select className={inp} value={form.fitnessLevel} onChange={e => setForm({...form, fitnessLevel: e.target.value})}>
              <option value="">–</option>
              <option value="beginner">🌱 Beginner</option>
              <option value="average">⚡ Average</option>
              <option value="expert">🔥 Expert</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Goal</label>
            <select className={inp} value={form.goal} onChange={e => setForm({...form, goal: e.target.value})}>
              <option value="">–</option>
              <option value="weight_gain">Weight Gain 💪</option>
              <option value="weight_loss">Weight Loss 🔥</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Plan</label>
            <select className={inp} value={form.selectedPlan} onChange={e => setForm({...form, selectedPlan: e.target.value})}>
              <option value="">–</option>
              <option value="1_month">1 Month</option>
              <option value="3_month">3 Months</option>
              <option value="6_month">6 Months</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Weight (kg)</label>
            <input type="number" className={inp} placeholder="kg" value={form.weight}
              onChange={e => setForm({...form, weight: e.target.value})}/>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Age</label>
            <input type="number" className={inp} placeholder="age" value={form.age}
              onChange={e => setForm({...form, age: e.target.value})}/>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-xl text-sm">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Members() {
  const [members,    setMembers]    = useState([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [editMember, setEditMember] = useState(null);

  const fetchMembers = () =>
    api.get('/owner/members').then(r => setMembers(r.data)).finally(() => setLoading(false));

  useEffect(() => { fetchMembers(); }, []);

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  const exportCSV = () => {
    const headers = ['Name','Email','Phone','Gender','Goal','Fitness Level','Plan','Start','End','Days Left'];
    const rows    = filtered.map(m => [
      m.name, m.email, m.phone, m.gender || '–',
      m.goal?.replace('_',' ') || '–',
      m.fitnessLevel || '–',
      planLabel(m.selectedPlan),
      fmtDate(m.planStartDate), fmtDate(m.planEndDate),
      daysLeft(m.planEndDate) ?? 'N/A'
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'members.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const levelBadge = l => {
    if (!l) return <span className="text-gray-600 text-xs">–</span>;
    const map = { beginner: 'text-green-400', average: 'text-yellow-400', expert: 'text-red-400' };
    const icon = { beginner: '🌱', average: '⚡', expert: '🔥' };
    return <span className={`text-xs font-semibold capitalize ${map[l]}`}>{icon[l]} {l}</span>;
  };

  return (
    <div className="space-y-5">
      {editMember && (
        <EditModal member={editMember} onClose={() => setEditMember(null)} onSaved={fetchMembers} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl text-white">All Members 👥</h1>
          <p className="text-gray-400 text-sm mt-1">{members.length} active members</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name / email / phone…"
            className="bg-card border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:border-primary focus:outline-none w-56"/>
          <button onClick={exportCSV}
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="bg-card rounded-xl h-12 animate-pulse border border-gray-700"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-gray-700 rounded-2xl p-12 text-center">
          <p className="text-gray-400">{search ? 'No members match your search.' : 'No approved members yet.'}</p>
        </div>
      ) : (
        <div className="bg-card border border-gray-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-dark/40">
                  {['Name','Email','Phone','Gender','Goal','Level','Plan','Start','End','Days Left','Edit'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m._id} className={`border-b border-gray-800 hover:bg-dark/30 transition-colors ${i%2===0?'':'bg-dark/10'}`}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                          {m.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-white font-medium whitespace-nowrap">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-400 max-w-[140px] truncate">{m.email}</td>
                    <td className="px-3 py-3 text-gray-300 whitespace-nowrap">{m.phone}</td>
                    <td className="px-3 py-3 text-gray-400 capitalize">{m.gender || '–'}</td>
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{m.goal==='weight_gain'?'💪 Gain':'🔥 Loss'}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{levelBadge(m.fitnessLevel)}</td>
                    <td className="px-3 py-3 text-primary font-semibold whitespace-nowrap">{planLabel(m.selectedPlan)}</td>
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{fmtDate(m.planStartDate)}</td>
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{fmtDate(m.planEndDate)}</td>
                    <td className="px-3 py-3"><DaysLeftBadge days={daysLeft(m.planEndDate)}/></td>
                    <td className="px-3 py-3">
                      <button onClick={() => setEditMember(m)}
                        className="bg-secondary hover:bg-primary/20 border border-gray-700 hover:border-primary text-gray-300 hover:text-primary text-xs px-3 py-1.5 rounded-lg transition-colors">
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}