import React from 'react';
import { motion } from 'framer-motion';

export default function PlanCard({ plan, popular }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`relative rounded-2xl p-6 flex flex-col gap-4 border transition-all duration-300
        ${popular
          ? 'bg-primary border-primary shadow-xl shadow-primary/30'
          : 'bg-card border-gray-700 hover:border-primary/60'}`}>

      {/* Popular badge */}
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-secondary text-xs font-heading font-black px-4 py-1 rounded-full tracking-wide">
          ⭐ MOST POPULAR
        </span>
      )}

      {/* Price */}
      <div>
        <h3 className="font-heading font-bold text-xl text-white">{plan.duration}</h3>
        <p className="text-3xl font-heading font-black text-white mt-1">
          {plan.price}
          <span className="text-sm font-normal text-gray-300"> /plan</span>
        </p>
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-2 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-white/90">
            <span className="text-accent font-bold">✓</span> {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a href="#join"
        className={`text-center py-2.5 rounded-xl font-semibold text-sm transition-colors
          ${popular
            ? 'bg-white text-primary hover:bg-gray-100'
            : 'bg-primary hover:bg-orange-600 text-white'}`}>
        Choose This Plan
      </a>
    </motion.div>
  );
}