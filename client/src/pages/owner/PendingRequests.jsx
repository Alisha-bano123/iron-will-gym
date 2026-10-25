import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const planLabel = p => ({ '1_month': '1 Month', '3_month': '3 Months', '6_month': '6 Months' })[p] || p;
const goalLabel = g => g === 'weight_gain' ? '💪 Weight Gain' : '🔥 Weight Loss';

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(null);

  const fetchRequests = () =>
    api.get('/owner/pending').then(r => setRequests(r.data)).finally(() => setLoading(false));

  useEffect(() => { fetchRequests(); }, []);

  const approve = async (req) => {
    if (!window.confirm(`Approve ${req.name}'s ${planLabel(req.selectedPlan)} plan?`)) return;
    setActing(req.userId);
    try {
      await api.put(`/owner/approve/${req.userId}`);
      toast.success(`✅ ${req.name} approved!`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving');
    }
    setActing(null);
  };

  const reject = async (req) => {
    if (!window.confirm(`Reject ${req.name}'s request?`)) return;
    setActing(req.userId);
    try {
      await api.put(`/owner/reject/${req.userId}`);
      toast.success(`Rejected ${req.name}'s request`);
      fetchRequests();
    } catch {
      toast.error('Error rejecting');
    }
    setActing(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">Pending Requests 🔔</h1>
        <p className="text-gray-400 text-sm mt-1">{requests.length} request{requests.length !== 1 ? 's' : ''} awaiting approval</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-2xl h-24 animate-pulse border border-gray-700" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-card border border-gray-700 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-white font-semibold">All caught up! No pending requests.</p>
          <p className="text-gray-500 text-sm mt-1">New join requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req, i) => (
            <motion.div key={req._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-gray-700 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                {/* Avatar + name */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center font-heading font-bold text-primary text-lg">
                    {req.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{req.name}</p>
                    <p className="text-gray-500 text-xs">{new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div><p className="text-gray-500">Email</p><p className="text-white truncate">{req.email}</p></div>
                  <div><p className="text-gray-500">Phone</p><p className="text-white">{req.phone}</p></div>
                  <div><p className="text-gray-500">Age / Gender</p><p className="text-white capitalize">{req.age} / {req.gender}</p></div>
                  <div><p className="text-gray-500">Goal</p><p className="text-white">{goalLabel(req.goal)}</p></div>
                  <div><p className="text-gray-500">Selected Plan</p><p className="text-primary font-semibold">{planLabel(req.selectedPlan)}</p></div>
                  {req.message && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Message</p>
                      <p className="text-gray-300 italic">"{req.message}"</p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-shrink-0 sm:flex-col">
                  <button onClick={() => approve(req)} disabled={acting === req.userId}
                    className="flex-1 sm:flex-none bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                    {acting === req.userId ? '…' : '✅ Approve'}
                  </button>
                  <button onClick={() => reject(req)} disabled={acting === req.userId}
                    className="flex-1 sm:flex-none bg-red-800/60 hover:bg-red-700 disabled:opacity-50 text-red-300 hover:text-white px-4 py-2 rounded-xl text-sm transition-colors">
                    {acting === req.userId ? '…' : '❌ Reject'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}