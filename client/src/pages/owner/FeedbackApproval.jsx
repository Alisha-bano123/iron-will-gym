import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={s <= rating ? 'text-accent text-base' : 'text-gray-700 text-base'}>★</span>
    ))}
  </div>
);

export default function FeedbackApproval() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchFeedbacks = () =>
    api.get('/owner/feedbacks').then(r => setFeedbacks(r.data)).finally(() => setLoading(false));

  useEffect(() => { fetchFeedbacks(); }, []);

  const approve = async (id, name) => {
    try {
      await api.put(`/owner/feedback/approve/${id}`);
      toast.success(`✅ ${name}'s feedback published on home page!`);
      fetchFeedbacks();
    } catch { toast.error('Error approving feedback'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this feedback permanently?')) return;
    try {
      await api.delete(`/owner/feedback/${id}`);
      toast.success('Feedback deleted');
      fetchFeedbacks();
    } catch { toast.error('Error deleting'); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">Feedback Approval ⭐</h1>
        <p className="text-gray-400 text-sm mt-1">Approve feedbacks to publish them on the home page</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-2xl h-24 animate-pulse border border-gray-700" />)}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-card border border-gray-700 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-white font-semibold">No pending feedbacks</p>
          <p className="text-gray-500 text-sm mt-1">All feedbacks have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map(f => (
            <div key={f._id} className="bg-card border border-gray-700 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 sm:items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {f.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{f.name}</p>
                    <p className="text-gray-500 text-xs">{new Date(f.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <Stars rating={f.rating} />
                </div>
                <p className="text-gray-300 text-sm italic">"{f.comment}"</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => approve(f._id, f.name)}
                  className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                  ✅ Publish
                </button>
                <button onClick={() => remove(f._id)}
                  className="bg-red-800/60 hover:bg-red-700 text-red-300 hover:text-white px-4 py-2 rounded-xl text-sm transition-colors">
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}