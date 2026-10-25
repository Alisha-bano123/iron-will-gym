import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const timeColors = {
  morning:    'border-l-yellow-400  bg-yellow-400/5',
  midmorning: 'border-l-orange-400  bg-orange-400/5',
  afternoon:  'border-l-green-400   bg-green-400/5',
  evening:    'border-l-blue-400    bg-blue-400/5',
  night:      'border-l-purple-400  bg-purple-400/5',
};

const getSlot = (time) => {
  const h = parseInt(time.split(':')[0]);
  if (h < 10) return 'morning';
  if (h < 12) return 'midmorning';
  if (h < 17) return 'afternoon';
  if (h < 20) return 'evening';
  return 'night';
};

export default function DietPlan() {
  const [plan, setPlan]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/client/diet-plan')
      .then(r => setPlan(r.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load diet plan'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-3">
      <div className="h-8 bg-card rounded-xl animate-pulse w-48" />
      {[1,2,3,4].map(i => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-gray-700" />)}
    </div>
  );

  if (error) return (
    <div className="bg-card border border-gray-700 rounded-2xl p-8 text-center">
      <p className="text-red-400">{error}</p>
    </div>
  );

  const totalCal = plan?.meals?.reduce((s, m) => s + (m.calories || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">🥗 Your Diet Plan</h1>
        <p className="text-gray-400 text-sm mt-1">Personalized nutrition based on your goal</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/10 border border-orange-600/30 rounded-2xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Daily Target</p>
          <p className="font-heading font-bold text-orange-400 text-sm">{plan?.calories}</p>
        </div>
        <div className="bg-card border border-gray-700 rounded-2xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Total Meals</p>
          <p className="font-heading font-black text-xl text-white">{plan?.meals?.length}</p>
        </div>
        <div className="bg-card border border-gray-700 rounded-2xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Est. Calories</p>
          <p className="font-heading font-black text-xl text-white">{totalCal}</p>
        </div>
      </div>

      {/* Meal Timeline */}
      <div className="space-y-2">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Meal Timeline — tap to expand</p>
        {plan?.meals?.map((meal, i) => {
          const slot  = getSlot(meal.time);
          const color = timeColors[slot];
          const open  = expanded === i;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-card border border-gray-700 border-l-4 rounded-2xl overflow-hidden cursor-pointer ${color}`}
              onClick={() => setExpanded(open ? null : i)}>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <p className="text-primary font-semibold text-sm w-16 flex-shrink-0">{meal.time}</p>
                  <div>
                    <p className="text-white font-semibold text-sm">{meal.meal}</p>
                    <p className="text-gray-500 text-xs">{meal.items?.length} items · ~{meal.calories} kcal</p>
                  </div>
                </div>
                <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
              </div>
              <AnimatePresence>
                {open && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-gray-700/50">
                    <div className="px-5 py-4 space-y-1.5">
                      {meal.items?.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                      <div className="mt-2 pt-2 border-t border-gray-700/50 flex justify-between text-xs">
                        <span className="text-gray-500">Estimated calories</span>
                        <span className="text-primary font-semibold">{meal.calories} kcal</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Tips */}
      {plan?.tips?.length > 0 && (
        <div className="bg-card border border-gray-700 rounded-2xl p-5">
          <p className="text-white font-semibold mb-3">💡 Nutrition Tips</p>
          <div className="space-y-2">
            {plan.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-primary font-bold mt-0.5">✓</span> {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-gray-600 text-xs">⚠️ General guideline only. Consult a nutritionist for medical conditions.</p>
    </div>
  );
}