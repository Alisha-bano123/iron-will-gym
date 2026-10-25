import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function FeedbackClient() {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [comment,   setComment]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ratingLabels = ['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent 🤩'];

  const handleSubmit = async () => {
    if (!rating)           return toast.error('Please select a star rating');
    if (!comment.trim())   return toast.error('Please write a comment');
    if (comment.length < 10) return toast.error('Comment must be at least 10 characters');

    setLoading(true);
    try {
      await api.post('/client/feedback', { rating, comment: comment.trim() });
      setSubmitted(true);
      toast.success('⭐ Feedback submitted! It will appear after owner approval.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
    setLoading(false);
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-gray-700 rounded-3xl p-10 text-center max-w-md w-full"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="text-6xl mb-5"
          >
            ⭐
          </motion.div>
          <h2 className="font-heading font-black text-2xl text-white mb-2">Thank You!</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Your feedback has been submitted successfully. The owner will review and publish it on the home page.
          </p>
          <div className="flex justify-center gap-1 mb-6">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-2xl ${s <= rating ? 'text-accent' : 'text-gray-700'}`}>★</span>
            ))}
          </div>
          <button
            onClick={() => { setSubmitted(false); setRating(0); setComment(''); }}
            className="border border-gray-700 hover:border-primary text-gray-300 hover:text-primary px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Submit Another Feedback
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Feedback form ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">⭐ Give Feedback</h1>
        <p className="text-gray-400 text-sm mt-1">Share your experience at Iron Will Gym</p>
      </div>

      <div className="bg-card border border-gray-700 rounded-2xl p-6 space-y-6">

        {/* Star Rating */}
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-4">
            Your Rating *
          </p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="transition-all hover:scale-110 focus:outline-none"
              >
                <span className={`text-5xl transition-colors duration-150
                  ${star <= (hovered || rating) ? 'text-accent drop-shadow-lg' : 'text-gray-700'}`}>
                  ★
                </span>
              </button>
            ))}
          </div>

          {/* Rating label */}
          <div className="text-center mt-3 h-6">
            {(hovered || rating) > 0 && (
              <motion.p
                key={hovered || rating}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-accent font-semibold text-sm"
              >
                {ratingLabels[hovered || rating]}
              </motion.p>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Your Comment *</p>
            <span className={`text-xs ${comment.length > 280 ? 'text-red-400' : 'text-gray-600'}`}>
              {comment.length}/300
            </span>
          </div>
          <textarea
            rows={5}
            value={comment}
            onChange={e => setComment(e.target.value.slice(0, 300))}
            placeholder="Tell us about your experience — the trainers, equipment, atmosphere, results you achieved…"
            className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition-colors resize-none placeholder-gray-600"
          />
        </div>

        {/* Note */}
        <div className="bg-dark/60 border border-gray-700 rounded-xl p-3 text-xs text-gray-500 flex items-start gap-2">
          <span className="text-base">📋</span>
          <span>Your feedback will be visible on the home page after the owner reviews and approves it.</span>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !rating || !comment.trim()}
          className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            '⭐ Submit Feedback'
          )}
        </button>
      </div>
    </div>
  );
}