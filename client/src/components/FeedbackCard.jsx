import React from 'react';

// Star rating display
const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} className={`text-lg ${s <= rating ? 'text-accent' : 'text-gray-600'}`}>★</span>
    ))}
  </div>
);

export default function FeedbackCard({ feedback }) {
  const date = new Date(feedback.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="bg-card border border-gray-700 rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with first letter */}
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-heading font-bold text-primary text-sm">
            {feedback.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{feedback.name}</p>
            <p className="text-gray-500 text-xs">{date}</p>
          </div>
        </div>
        <StarRating rating={feedback.rating} />
      </div>
      <p className="text-gray-300 text-sm leading-relaxed italic">"{feedback.comment}"</p>
    </div>
  );
}