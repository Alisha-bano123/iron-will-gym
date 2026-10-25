import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const planLabel = p => ({ '1_month': '1 Month', '3_month': '3 Months', '6_month': '6 Months' })[p] || p;
const fmtDate   = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '–';

export default function ExpiringPlans() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/owner/expiring').then(r => setMembers(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">Expiring Plans ⚠️</h1>
        <p className="text-gray-400 text-sm mt-1">Members whose plans expire within 10 days — contact them for renewal</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-2xl h-20 animate-pulse border border-gray-700" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-card border border-gray-700 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-white font-semibold">No expiring plans in the next 10 days!</p>
          <p className="text-gray-500 text-sm mt-1">All members have sufficient plan time remaining.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(m => {
            const days = Math.ceil((new Date(m.planEndDate) - new Date()) / (1000 * 60 * 60 * 24));
            const borderCls = days <= 3 ? 'border-red-700/60' : days <= 7 ? 'border-orange-600/50' : 'border-yellow-600/30';
            const badgeCls  = days <= 3 ? 'bg-red-600 text-white' : days <= 7 ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-secondary';
            return (
              <div key={m._id} className={`bg-card border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${borderCls}`}>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-11 h-11 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-400 font-bold text-lg">
                    {m.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{m.name}</p>
                    <p className="text-gray-400 text-xs">{m.phone} · {m.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Plan</p>
                    <p className="text-white font-medium">{planLabel(m.selectedPlan)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Expiry</p>
                    <p className="text-white font-medium">{fmtDate(m.planEndDate)}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeCls}`}>
                    ⏰ {days} day{days !== 1 ? 's' : ''} left
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}