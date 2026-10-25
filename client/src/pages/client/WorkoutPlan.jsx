import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

// ── ANIMATED EXERCISE FIGURES ────────────────────────────────────────────────
const ExerciseAnimation = ({ type }) => {
  const animations = {
    squat: (
      <svg viewBox="0 0 100 120" className="w-full h-full">
        <motion.g animate={{ scaleY:[1,0.75,1], originY:'bottom' }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          {/* Head */}
          <circle cx="50" cy="12" r="9" fill="#FF6B35"/>
          {/* Body */}
          <motion.rect x="42" y="22" width="16" height="28" rx="4" fill="#FF6B35"
            animate={{ scaleY:[1,0.8,1] }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}/>
          {/* Left arm */}
          <motion.line x1="42" y1="28" x2="28" y2="45" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[-10,20,-10] }} style={{ originX:'42px', originY:'28px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          {/* Right arm */}
          <motion.line x1="58" y1="28" x2="72" y2="45" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[10,-20,10] }} style={{ originX:'58px', originY:'28px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          {/* Left leg */}
          <motion.g animate={{ rotate:[0,35,0] }} style={{ originX:'46px', originY:'50px' }} transition={{ repeat:Infinity, duration:1.8 }}>
            <line x1="46" y1="50" x2="38" y2="75" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
            <motion.line x1="38" y1="75" x2="30" y2="90" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
              animate={{ rotate:[0,-40,0] }} style={{ originX:'38px', originY:'75px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          </motion.g>
          {/* Right leg */}
          <motion.g animate={{ rotate:[0,-35,0] }} style={{ originX:'54px', originY:'50px' }} transition={{ repeat:Infinity, duration:1.8 }}>
            <line x1="54" y1="50" x2="62" y2="75" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
            <motion.line x1="62" y1="75" x2="70" y2="90" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
              animate={{ rotate:[0,40,0] }} style={{ originX:'62px', originY:'75px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          </motion.g>
        </motion.g>
        {/* Floor */}
        <line x1="15" y1="100" x2="85" y2="100" stroke="#374151" strokeWidth="3" strokeLinecap="round"/>
        <text x="50" y="116" textAnchor="middle" fill="#9CA3AF" fontSize="8">SQUAT</text>
      </svg>
    ),
    pushup: (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        <motion.g animate={{ y:[0,-12,0] }} transition={{ repeat:Infinity, duration:1.6, ease:'easeInOut' }}>
          <circle cx="25" cy="38" r="8" fill="#FF6B35"/>
          <line x1="25" y1="46" x2="60" y2="55" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="60" y1="55" x2="95" y2="62" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <motion.line x1="35" y1="50" x2="35" y2="75" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"
            animate={{ rotate:[0,15,0] }} style={{ originX:'35px', originY:'50px' }} transition={{ repeat:Infinity, duration:1.6 }}/>
          <motion.line x1="55" y1="55" x2="55" y2="78" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"
            animate={{ rotate:[0,15,0] }} style={{ originX:'55px', originY:'55px' }} transition={{ repeat:Infinity, duration:1.6 }}/>
          <motion.line x1="75" y1="60" x2="75" y2="80" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"
            animate={{ rotate:[0,15,0] }} style={{ originX:'75px', originY:'60px' }} transition={{ repeat:Infinity, duration:1.6 }}/>
          <motion.line x1="90" y1="63" x2="90" y2="80" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"
            animate={{ rotate:[0,15,0] }} style={{ originX:'90px', originY:'63px' }} transition={{ repeat:Infinity, duration:1.6 }}/>
        </motion.g>
        <line x1="10" y1="82" x2="110" y2="82" stroke="#374151" strokeWidth="3"/>
        <text x="60" y="96" textAnchor="middle" fill="#9CA3AF" fontSize="8">PUSH-UP</text>
      </svg>
    ),
    curl: (
      <svg viewBox="0 0 100 130" className="w-full h-full">
        <circle cx="50" cy="12" r="9" fill="#FF6B35"/>
        <rect x="42" y="22" width="16" height="32" rx="4" fill="#FF6B35"/>
        <line x1="42" y1="26" x2="28" y2="42" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <motion.g animate={{ rotate:[0,-70,0] }} style={{ originX:'62px', originY:'26px' }} transition={{ repeat:Infinity, duration:1.5, ease:'easeInOut' }}>
          <line x1="62" y1="26" x2="75" y2="50" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <rect x="70" y="52" width="14" height="6" rx="2" fill="#FFD700"/>
        </motion.g>
        <line x1="44" y1="54" x2="36" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="56" y1="54" x2="64" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="36" y1="80" x2="30" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="64" y1="80" x2="70" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="15" y1="108" x2="85" y2="108" stroke="#374151" strokeWidth="3"/>
        <text x="50" y="122" textAnchor="middle" fill="#9CA3AF" fontSize="8">BICEP CURL</text>
      </svg>
    ),
    plank: (
      <svg viewBox="0 0 130 90" className="w-full h-full">
        <motion.g animate={{ y:[0,-4,0] }} transition={{ repeat:Infinity, duration:2, ease:'easeInOut' }}>
          <circle cx="22" cy="35" r="8" fill="#FF6B35"/>
          <line x1="22" y1="43" x2="65" y2="52" stroke="#FF6B35" strokeWidth="6" strokeLinecap="round"/>
          <line x1="65" y1="52" x2="105" y2="55" stroke="#FF6B35" strokeWidth="6" strokeLinecap="round"/>
          <line x1="30" y1="52" x2="30" y2="72" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="55" y1="55" x2="55" y2="72" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="85" y1="57" x2="85" y2="72" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="105" y1="58" x2="105" y2="72" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        </motion.g>
        <line x1="10" y1="74" x2="120" y2="74" stroke="#374151" strokeWidth="3"/>
        <text x="65" y="86" textAnchor="middle" fill="#9CA3AF" fontSize="8">PLANK</text>
      </svg>
    ),
    deadlift: (
      <svg viewBox="0 0 110 130" className="w-full h-full">
        <motion.g animate={{ y:[20,0,20] }} transition={{ repeat:Infinity, duration:2, ease:'easeInOut' }}>
          <circle cx="55" cy="15" r="9" fill="#FF6B35"/>
          <motion.rect x="47" y="25" width="16" height="30" rx="4" fill="#FF6B35"
            animate={{ scaleY:[0.85,1,0.85] }} transition={{ repeat:Infinity, duration:2, ease:'easeInOut' }}/>
          <motion.line x1="47" y1="30" x2="25" y2="55" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[15,0,15] }} style={{ originX:'47px', originY:'30px' }} transition={{ repeat:Infinity, duration:2 }}/>
          <motion.line x1="63" y1="30" x2="85" y2="55" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[-15,0,-15] }} style={{ originX:'63px', originY:'30px' }} transition={{ repeat:Infinity, duration:2 }}/>
          <line x1="49" y1="55" x2="42" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="61" y1="55" x2="68" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="42" y1="80" x2="38" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="68" y1="80" x2="72" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          {/* Barbell */}
          <rect x="8" y="97" width="94" height="6" rx="3" fill="#FFD700"/>
          <rect x="5" y="93" width="10" height="14" rx="3" fill="#9CA3AF"/>
          <rect x="95" y="93" width="10" height="14" rx="3" fill="#9CA3AF"/>
        </motion.g>
        <line x1="5" y1="112" x2="105" y2="112" stroke="#374151" strokeWidth="3"/>
        <text x="55" y="126" textAnchor="middle" fill="#9CA3AF" fontSize="8">DEADLIFT</text>
      </svg>
    ),
    row: (
      <svg viewBox="0 0 130 110" className="w-full h-full">
        <motion.g animate={{ x:[0,8,0] }} transition={{ repeat:Infinity, duration:1.6, ease:'easeInOut' }}>
          <circle cx="25" cy="32" r="8" fill="#FF6B35"/>
          <line x1="25" y1="40" x2="60" y2="50" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="60" y1="50" x2="90" y2="55" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <motion.line x1="38" y1="46" x2="65" y2="35" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[20,-10,20] }} style={{ originX:'38px', originY:'46px' }} transition={{ repeat:Infinity, duration:1.6 }}>
            <rect x="62" y="30" width="20" height="6" rx="2" fill="#FFD700"/>
          </motion.line>
          <line x1="35" y1="52" x2="30" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="55" y1="56" x2="52" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="30" y1="78" x2="25" y2="92" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
          <line x1="52" y1="80" x2="48" y2="92" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
        </motion.g>
        <line x1="5" y1="95" x2="125" y2="95" stroke="#374151" strokeWidth="3"/>
        <text x="65" y="107" textAnchor="middle" fill="#9CA3AF" fontSize="8">ROW</text>
      </svg>
    ),
    press: (
      <svg viewBox="0 0 110 130" className="w-full h-full">
        <circle cx="55" cy="22" r="9" fill="#FF6B35"/>
        <rect x="47" y="32" width="16" height="30" rx="4" fill="#FF6B35"/>
        <motion.g animate={{ y:[0,-18,0] }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <line x1="47" y1="36" x2="20" y2="38" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="63" y1="36" x2="90" y2="38" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <rect x="5" y="34" width="16" height="6" rx="2" fill="#FFD700"/>
          <rect x="89" y="34" width="16" height="6" rx="2" fill="#FFD700"/>
          <line x1="21" y1="37" x2="89" y2="37" stroke="#9CA3AF" strokeWidth="4"/>
        </motion.g>
        <line x1="47" y1="62" x2="40" y2="88" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="63" y1="62" x2="70" y2="88" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="40" y1="88" x2="35" y2="108" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="70" y1="88" x2="75" y2="108" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="10" y1="112" x2="100" y2="112" stroke="#374151" strokeWidth="3"/>
        <text x="55" y="126" textAnchor="middle" fill="#9CA3AF" fontSize="8">SHOULDER PRESS</text>
      </svg>
    ),
    pulldown: (
      <svg viewBox="0 0 110 130" className="w-full h-full">
        <rect x="5" y="5" width="100" height="6" rx="3" fill="#4B5563"/>
        <line x1="55" y1="11" x2="55" y2="25" stroke="#4B5563" strokeWidth="3"/>
        <rect x="30" y="22" width="50" height="6" rx="3" fill="#9CA3AF"/>
        <motion.g animate={{ y:[0,15,0] }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <circle cx="55" cy="42" r="9" fill="#FF6B35"/>
          <rect x="47" y="52" width="16" height="28" rx="4" fill="#FF6B35"/>
          <motion.line x1="47" y1="56" x2="32" y2="29" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[-20,10,-20] }} style={{ originX:'47px', originY:'56px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          <motion.line x1="63" y1="56" x2="78" y2="29" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[20,-10,20] }} style={{ originX:'63px', originY:'56px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          <line x1="49" y1="80" x2="42" y2="105" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="61" y1="80" x2="68" y2="105" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        </motion.g>
        <line x1="10" y1="112" x2="100" y2="112" stroke="#374151" strokeWidth="3"/>
        <text x="55" y="126" textAnchor="middle" fill="#9CA3AF" fontSize="7">LAT PULLDOWN</text>
      </svg>
    ),
    lunge: (
      <svg viewBox="0 0 120 130" className="w-full h-full">
        <circle cx="50" cy="12" r="9" fill="#FF6B35"/>
        <rect x="42" y="22" width="16" height="28" rx="4" fill="#FF6B35"/>
        <line x1="42" y1="28" x2="28" y2="42" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="58" y1="28" x2="72" y2="42" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <motion.g animate={{ rotate:[0,15,0] }} style={{ originX:'46px', originY:'50px' }} transition={{ repeat:Infinity, duration:2, ease:'easeInOut' }}>
          <line x1="46" y1="50" x2="32" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="32" y1="80" x2="20" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        </motion.g>
        <motion.g animate={{ rotate:[0,-20,0] }} style={{ originX:'54px', originY:'50px' }} transition={{ repeat:Infinity, duration:2, ease:'easeInOut' }}>
          <line x1="54" y1="50" x2="78" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="78" y1="78" x2="88" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        </motion.g>
        <line x1="5" y1="105" x2="115" y2="105" stroke="#374151" strokeWidth="3"/>
        <text x="60" y="120" textAnchor="middle" fill="#9CA3AF" fontSize="8">LUNGE</text>
      </svg>
    ),
    hipthrust: (
      <svg viewBox="0 0 130 110" className="w-full h-full">
        <motion.g animate={{ y:[10,0,10] }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <circle cx="28" cy="35" r="8" fill="#FF6B35"/>
          <motion.line x1="28" y1="43" x2="65" y2="55" stroke="#FF6B35" strokeWidth="6" strokeLinecap="round"
            animate={{ rotate:[20,0,20] }} style={{ originX:'28px', originY:'43px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          <line x1="65" y1="55" x2="95" y2="50" stroke="#FF6B35" strokeWidth="6" strokeLinecap="round"/>
          <line x1="55" y1="62" x2="48" y2="85" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="75" y1="58" x2="80" y2="82" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="48" y1="85" x2="40" y2="95" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
          <line x1="80" y1="82" x2="88" y2="95" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
          <rect x="30" y="44" width="70" height="6" rx="3" fill="#FFD700" opacity="0.6"/>
        </motion.g>
        <rect x="100" y="60" width="20" height="35" rx="4" fill="#4B5563"/>
        <line x1="5" y1="97" x2="125" y2="97" stroke="#374151" strokeWidth="3"/>
        <text x="65" y="108" textAnchor="middle" fill="#9CA3AF" fontSize="7">HIP THRUST</text>
      </svg>
    ),
    glutebridge: (
      <svg viewBox="0 0 130 100" className="w-full h-full">
        <motion.g animate={{ y:[8,0,8] }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <circle cx="25" cy="42" r="8" fill="#FF6B35"/>
          <line x1="25" y1="50" x2="60" y2="55" stroke="#FF6B35" strokeWidth="6" strokeLinecap="round"/>
          <motion.line x1="60" y1="55" x2="90" y2="45" stroke="#FF6B35" strokeWidth="6" strokeLinecap="round"
            animate={{ rotate:[15,0,15] }} style={{ originX:'60px', originY:'55px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          <line x1="75" y1="62" x2="70" y2="82" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="90" y1="58" x2="95" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        </motion.g>
        <line x1="5" y1="86" x2="125" y2="86" stroke="#374151" strokeWidth="3"/>
        <text x="65" y="97" textAnchor="middle" fill="#9CA3AF" fontSize="7">GLUTE BRIDGE</text>
      </svg>
    ),
    legpress: (
      <svg viewBox="0 0 130 110" className="w-full h-full">
        <rect x="90" y="10" width="30" height="80" rx="5" fill="#374151"/>
        <motion.g animate={{ x:[0,-20,0] }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <circle cx="30" cy="45" r="9" fill="#FF6B35"/>
          <rect x="22" y="55" width="16" height="25" rx="4" fill="#FF6B35"/>
          <motion.line x1="30" y1="55" x2="65" y2="40" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[-20,10,-20] }} style={{ originX:'30px', originY:'55px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          <motion.line x1="38" y1="55" x2="70" y2="50" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[-15,10,-15] }} style={{ originX:'38px', originY:'55px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          <rect x="62" y="35" width="20" height="24" rx="3" fill="#6B7280"/>
        </motion.g>
        <line x1="5" y1="92" x2="125" y2="92" stroke="#374151" strokeWidth="3"/>
        <text x="65" y="105" textAnchor="middle" fill="#9CA3AF" fontSize="7">LEG PRESS</text>
      </svg>
    ),
    legcurl: (
      <svg viewBox="0 0 120 110" className="w-full h-full">
        <circle cx="55" cy="22" r="9" fill="#FF6B35"/>
        <rect x="47" y="32" width="16" height="28" rx="4" fill="#FF6B35"/>
        <line x1="47" y1="36" x2="28" y2="48" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="63" y1="36" x2="82" y2="48" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="49" y1="60" x2="42" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <motion.g animate={{ rotate:[0,-55,0] }} style={{ originX:'61px', originY:'60px' }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <line x1="61" y1="60" x2="72" y2="82" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <rect x="68" y="82" width="14" height="6" rx="2" fill="#FFD700"/>
        </motion.g>
        <line x1="10" y1="95" x2="110" y2="95" stroke="#374151" strokeWidth="3"/>
        <text x="60" y="108" textAnchor="middle" fill="#9CA3AF" fontSize="7">LEG CURL</text>
      </svg>
    ),
    calf: (
      <svg viewBox="0 0 100 130" className="w-full h-full">
        <circle cx="50" cy="12" r="9" fill="#FF6B35"/>
        <rect x="42" y="22" width="16" height="30" rx="4" fill="#FF6B35"/>
        <line x1="42" y1="28" x2="28" y2="42" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="58" y1="28" x2="72" y2="42" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="44" y1="52" x2="38" y2="75" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="56" y1="52" x2="62" y2="75" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <motion.g animate={{ y:[0,-12,0] }} transition={{ repeat:Infinity, duration:1.2, ease:'easeInOut' }}>
          <line x1="38" y1="75" x2="34" y2="98" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="62" y1="75" x2="66" y2="98" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        </motion.g>
        <line x1="15" y1="108" x2="85" y2="108" stroke="#374151" strokeWidth="3"/>
        <text x="50" y="122" textAnchor="middle" fill="#9CA3AF" fontSize="8">CALF RAISE</text>
      </svg>
    ),
    lateral: (
      <svg viewBox="0 0 130 120" className="w-full h-full">
        <circle cx="65" cy="14" r="9" fill="#FF6B35"/>
        <rect x="57" y="24" width="16" height="30" rx="4" fill="#FF6B35"/>
        <motion.line x1="57" y1="30" x2="22" y2="30" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
          animate={{ rotate:[0,-35,0] }} style={{ originX:'57px', originY:'30px' }} transition={{ repeat:Infinity, duration:1.6, ease:'easeInOut' }}>
          <circle cx="18" cy="30" r="5" fill="#FFD700"/>
        </motion.line>
        <motion.line x1="73" y1="30" x2="108" y2="30" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
          animate={{ rotate:[0,35,0] }} style={{ originX:'73px', originY:'30px' }} transition={{ repeat:Infinity, duration:1.6, ease:'easeInOut' }}>
          <circle cx="112" cy="30" r="5" fill="#FFD700"/>
        </motion.line>
        <line x1="59" y1="54" x2="52" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="71" y1="54" x2="78" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="52" y1="80" x2="46" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="78" y1="80" x2="84" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="15" y1="105" x2="115" y2="105" stroke="#374151" strokeWidth="3"/>
        <text x="65" y="118" textAnchor="middle" fill="#9CA3AF" fontSize="7">LATERAL RAISE</text>
      </svg>
    ),
    tricep: (
      <svg viewBox="0 0 100 130" className="w-full h-full">
        <circle cx="50" cy="12" r="9" fill="#FF6B35"/>
        <rect x="42" y="22" width="16" height="28" rx="4" fill="#FF6B35"/>
        <line x1="42" y1="26" x2="28" y2="42" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <motion.g animate={{ rotate:[0,60,0] }} style={{ originX:'62px', originY:'26px' }} transition={{ repeat:Infinity, duration:1.5, ease:'easeInOut' }}>
          <line x1="62" y1="26" x2="62" y2="60" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <rect x="56" y="60" width="14" height="6" rx="2" fill="#FFD700"/>
        </motion.g>
        <line x1="44" y1="50" x2="36" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="56" y1="50" x2="64" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="36" y1="78" x2="30" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="64" y1="78" x2="70" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="15" y1="108" x2="85" y2="108" stroke="#374151" strokeWidth="3"/>
        <text x="50" y="122" textAnchor="middle" fill="#9CA3AF" fontSize="7">TRICEP EXT</text>
      </svg>
    ),
    benchpress: (
      <svg viewBox="0 0 130 110" className="w-full h-full">
        <rect x="10" y="62" width="110" height="10" rx="4" fill="#374151"/>
        <rect x="15" y="72" width="12" height="25" rx="3" fill="#4B5563"/>
        <rect x="103" y="72" width="12" height="25" rx="3" fill="#4B5563"/>
        <motion.g animate={{ y:[0,12,0] }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <circle cx="65" cy="28" r="9" fill="#FF6B35"/>
          <rect x="57" y="38" width="16" height="22" rx="4" fill="#FF6B35"/>
          <motion.line x1="57" y1="44" x2="22" y2="44" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[-10,5,-10] }} style={{ originX:'57px', originY:'44px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          <motion.line x1="73" y1="44" x2="108" y2="44" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[10,-5,10] }} style={{ originX:'73px', originY:'44px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          <rect x="5" y="40" width="16" height="8" rx="3" fill="#FFD700"/>
          <rect x="109" y="40" width="16" height="8" rx="3" fill="#FFD700"/>
          <line x1="21" y1="44" x2="109" y2="44" stroke="#9CA3AF" strokeWidth="4"/>
          <line x1="59" y1="60" x2="55" y2="74" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="71" y1="60" x2="75" y2="74" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        </motion.g>
        <text x="65" y="105" textAnchor="middle" fill="#9CA3AF" fontSize="7">BENCH PRESS</text>
      </svg>
    ),
    dip: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <line x1="20" y1="30" x2="20" y2="90" stroke="#4B5563" strokeWidth="6" strokeLinecap="round"/>
        <line x1="100" y1="30" x2="100" y2="90" stroke="#4B5563" strokeWidth="6" strokeLinecap="round"/>
        <motion.g animate={{ y:[0,18,0] }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <circle cx="60" cy="22" r="9" fill="#FF6B35"/>
          <rect x="52" y="32" width="16" height="25" rx="4" fill="#FF6B35"/>
          <line x1="52" y1="36" x2="20" y2="40" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="68" y1="36" x2="100" y2="40" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <motion.line x1="54" y1="57" x2="46" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[0,15,0] }} style={{ originX:'54px', originY:'57px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
          <motion.line x1="66" y1="57" x2="74" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[0,-15,0] }} style={{ originX:'66px', originY:'57px' }} transition={{ repeat:Infinity, duration:1.8 }}/>
        </motion.g>
        <text x="60" y="110" textAnchor="middle" fill="#9CA3AF" fontSize="8">DIPS</text>
      </svg>
    ),
    run: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <motion.g animate={{ x:[0,5,-5,0] }} transition={{ repeat:Infinity, duration:0.5, ease:'linear' }}>
          <circle cx="60" cy="18" r="9" fill="#FF6B35"/>
          <motion.rect x="52" y="28" width="16" height="24" rx="4" fill="#FF6B35"
            animate={{ rotate:[-5,5,-5] }} style={{ originX:'60px', originY:'40px' }} transition={{ repeat:Infinity, duration:0.5 }}/>
          <motion.line x1="52" y1="34" x2="28" y2="44" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[-30,30,-30] }} style={{ originX:'52px', originY:'34px' }} transition={{ repeat:Infinity, duration:0.5 }}/>
          <motion.line x1="68" y1="34" x2="92" y2="44" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[30,-30,30] }} style={{ originX:'68px', originY:'34px' }} transition={{ repeat:Infinity, duration:0.5 }}/>
          <motion.line x1="54" y1="52" x2="36" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[-25,25,-25] }} style={{ originX:'54px', originY:'52px' }} transition={{ repeat:Infinity, duration:0.5 }}/>
          <motion.line x1="66" y1="52" x2="84" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[25,-25,25] }} style={{ originX:'66px', originY:'52px' }} transition={{ repeat:Infinity, duration:0.5 }}/>
          <motion.line x1="36" y1="78" x2="22" y2="95" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[-20,20,-20] }} style={{ originX:'36px', originY:'78px' }} transition={{ repeat:Infinity, duration:0.5 }}/>
          <motion.line x1="84" y1="78" x2="98" y2="95" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[20,-20,20] }} style={{ originX:'84px', originY:'78px' }} transition={{ repeat:Infinity, duration:0.5 }}/>
        </motion.g>
        <line x1="5" y1="100" x2="115" y2="100" stroke="#374151" strokeWidth="3"/>
        <text x="60" y="114" textAnchor="middle" fill="#9CA3AF" fontSize="8">CARDIO</text>
      </svg>
    ),
    crunch: (
      <svg viewBox="0 0 120 110" className="w-full h-full">
        <motion.g animate={{ rotate:[0,25,0] }} style={{ originX:'60px', originY:'65px' }} transition={{ repeat:Infinity, duration:1.6, ease:'easeInOut' }}>
          <circle cx="60" cy="35" r="9" fill="#FF6B35"/>
          <line x1="60" y1="44" x2="60" y2="65" stroke="#FF6B35" strokeWidth="6" strokeLinecap="round"/>
          <line x1="60" y1="50" x2="35" y2="55" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="60" y1="50" x2="85" y2="55" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        </motion.g>
        <line x1="30" y1="65" x2="90" y2="65" stroke="#FF6B35" strokeWidth="6" strokeLinecap="round"/>
        <line x1="30" y1="65" x2="18" y2="88" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="90" y1="65" x2="102" y2="88" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="5" y1="92" x2="115" y2="92" stroke="#374151" strokeWidth="3"/>
        <text x="60" y="106" textAnchor="middle" fill="#9CA3AF" fontSize="8">CRUNCH</text>
      </svg>
    ),
    legraise: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <circle cx="60" cy="22" r="9" fill="#FF6B35"/>
        <rect x="52" y="32" width="16" height="28" rx="4" fill="#FF6B35"/>
        <line x1="52" y1="38" x2="28" y2="50" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="68" y1="38" x2="92" y2="50" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="54" y1="60" x2="46" y2="82" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <motion.g animate={{ rotate:[0,-75,0] }} style={{ originX:'66px', originY:'60px' }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <line x1="66" y1="60" x2="78" y2="85" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="78" y1="85" x2="88" y2="102" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        </motion.g>
        <line x1="46" y1="82" x2="40" y2="100" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="10" y1="105" x2="110" y2="105" stroke="#374151" strokeWidth="3"/>
        <text x="60" y="116" textAnchor="middle" fill="#9CA3AF" fontSize="7">LEG RAISE</text>
      </svg>
    ),
    kickback: (
      <svg viewBox="0 0 130 110" className="w-full h-full">
        <circle cx="28" cy="28" r="8" fill="#FF6B35"/>
        <line x1="28" y1="36" x2="60" y2="48" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="60" y1="48" x2="90" y2="52" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="38" y1="44" x2="32" y2="68" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="32" y1="68" x2="25" y2="86" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
        <line x1="60" y1="52" x2="55" y2="75" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <motion.g animate={{ rotate:[0,-55,0] }} style={{ originX:'75px', originY:'55px' }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <line x1="75" y1="55" x2="80" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="80" y1="80" x2="105" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="108" cy="80" r="5" fill="#FFD700"/>
        </motion.g>
        <line x1="55" y1="75" x2="50" y2="90" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
        <line x1="5" y1="93" x2="125" y2="93" stroke="#374151" strokeWidth="3"/>
        <text x="65" y="105" textAnchor="middle" fill="#9CA3AF" fontSize="7">KICKBACK</text>
      </svg>
    ),
    facepull: (
      <svg viewBox="0 0 130 110" className="w-full h-full">
        <rect x="110" y="20" width="15" height="60" rx="4" fill="#374151"/>
        <circle cx="50" cy="30" r="9" fill="#FF6B35"/>
        <rect x="42" y="40" width="16" height="28" rx="4" fill="#FF6B35"/>
        <motion.g animate={{ x:[0,15,0] }} transition={{ repeat:Infinity, duration:1.6, ease:'easeInOut' }}>
          <line x1="42" y1="46" x2="20" y2="46" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="58" y1="46" x2="90" y2="46" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="90" y1="46" x2="110" y2="46" stroke="#FFD700" strokeWidth="4"/>
        </motion.g>
        <line x1="44" y1="68" x2="38" y2="90" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="56" y1="68" x2="62" y2="90" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="5" y1="95" x2="125" y2="95" stroke="#374151" strokeWidth="3"/>
        <text x="65" y="107" textAnchor="middle" fill="#9CA3AF" fontSize="7">FACE PULL</text>
      </svg>
    ),
    burpee: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <motion.g animate={{ y:[0,-30,0], rotate:[0,0,0] }} transition={{ repeat:Infinity, duration:1.5, ease:'easeInOut' }}>
          <circle cx="60" cy="55" r="9" fill="#FF6B35"/>
          <line x1="60" y1="64" x2="60" y2="85" stroke="#FF6B35" strokeWidth="6" strokeLinecap="round"/>
          <motion.line x1="60" y1="72" x2="35" y2="62" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[0,30,0] }} style={{ originX:'60px', originY:'72px' }} transition={{ repeat:Infinity, duration:1.5 }}/>
          <motion.line x1="60" y1="72" x2="85" y2="62" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[0,-30,0] }} style={{ originX:'60px', originY:'72px' }} transition={{ repeat:Infinity, duration:1.5 }}/>
          <motion.line x1="60" y1="85" x2="42" y2="102" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[0,-20,0] }} style={{ originX:'60px', originY:'85px' }} transition={{ repeat:Infinity, duration:1.5 }}/>
          <motion.line x1="60" y1="85" x2="78" y2="102" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[0,20,0] }} style={{ originX:'60px', originY:'85px' }} transition={{ repeat:Infinity, duration:1.5 }}/>
        </motion.g>
        <line x1="5" y1="108" x2="115" y2="108" stroke="#374151" strokeWidth="3"/>
        <text x="60" y="118" textAnchor="middle" fill="#9CA3AF" fontSize="8">BURPEE</text>
      </svg>
    ),
    jumpingjack: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <circle cx="60" cy="15" r="9" fill="#FF6B35"/>
        <rect x="52" y="25" width="16" height="26" rx="4" fill="#FF6B35"/>
        <motion.line x1="52" y1="32" x2="22" y2="18" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
          animate={{ rotate:[0,45,0] }} style={{ originX:'52px', originY:'32px' }} transition={{ repeat:Infinity, duration:0.8, ease:'easeInOut' }}/>
        <motion.line x1="68" y1="32" x2="98" y2="18" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
          animate={{ rotate:[0,-45,0] }} style={{ originX:'68px', originY:'32px' }} transition={{ repeat:Infinity, duration:0.8, ease:'easeInOut' }}/>
        <motion.line x1="54" y1="51" x2="28" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
          animate={{ rotate:[0,30,0] }} style={{ originX:'54px', originY:'51px' }} transition={{ repeat:Infinity, duration:0.8, ease:'easeInOut' }}/>
        <motion.line x1="66" y1="51" x2="92" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
          animate={{ rotate:[0,-30,0] }} style={{ originX:'66px', originY:'51px' }} transition={{ repeat:Infinity, duration:0.8, ease:'easeInOut' }}/>
        <line x1="5" y1="95" x2="115" y2="95" stroke="#374151" strokeWidth="3"/>
        <text x="60" y="110" textAnchor="middle" fill="#9CA3AF" fontSize="7">JUMPING JACK</text>
      </svg>
    ),
    highknee: (
      <svg viewBox="0 0 100 120" className="w-full h-full">
        <circle cx="50" cy="14" r="9" fill="#FF6B35"/>
        <rect x="42" y="24" width="16" height="26" rx="4" fill="#FF6B35"/>
        <motion.line x1="42" y1="30" x2="25" y2="42" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
          animate={{ rotate:[0,20,0] }} style={{ originX:'42px', originY:'30px' }} transition={{ repeat:Infinity, duration:0.6 }}/>
        <motion.line x1="58" y1="30" x2="75" y2="42" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
          animate={{ rotate:[0,-20,0] }} style={{ originX:'58px', originY:'30px' }} transition={{ repeat:Infinity, duration:0.6 }}/>
        <line x1="44" y1="50" x2="36" y2="72" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <motion.g animate={{ y:[0,-20,0] }} transition={{ repeat:Infinity, duration:0.6, ease:'easeInOut' }}>
          <line x1="56" y1="50" x2="65" y2="72" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="65" y1="72" x2="72" y2="85" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
        </motion.g>
        <line x1="36" y1="72" x2="28" y2="88" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
        <line x1="10" y1="96" x2="90" y2="96" stroke="#374151" strokeWidth="3"/>
        <text x="50" y="110" textAnchor="middle" fill="#9CA3AF" fontSize="7">HIGH KNEES</text>
      </svg>
    ),
    mountainclimber: (
      <svg viewBox="0 0 130 100" className="w-full h-full">
        <circle cx="22" cy="30" r="8" fill="#FF6B35"/>
        <line x1="22" y1="38" x2="58" y2="50" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="58" y1="50" x2="95" y2="55" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="32" y1="46" x2="28" y2="70" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="28" y1="70" x2="18" y2="82" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
        <line x1="52" y1="52" x2="48" y2="72" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <motion.g animate={{ x:[0,-18,0] }} transition={{ repeat:Infinity, duration:0.7, ease:'easeInOut' }}>
          <line x1="68" y1="52" x2="72" y2="72" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <line x1="72" y1="72" x2="80" y2="84" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
        </motion.g>
        <line x1="90" y1="56" x2="95" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="95" y1="78" x2="105" y2="84" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round"/>
        <line x1="5" y1="87" x2="125" y2="87" stroke="#374151" strokeWidth="3"/>
        <text x="65" y="98" textAnchor="middle" fill="#9CA3AF" fontSize="6">MOUNTAIN CLIMBER</text>
      </svg>
    ),
    shrug: (
      <svg viewBox="0 0 110 120" className="w-full h-full">
        <motion.g animate={{ y:[0,-12,0] }} transition={{ repeat:Infinity, duration:1.4, ease:'easeInOut' }}>
          <circle cx="55" cy="15" r="9" fill="#FF6B35"/>
          <rect x="47" y="25" width="16" height="30" rx="4" fill="#FF6B35"/>
          <motion.line x1="47" y1="28" x2="18" y2="32" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[0,-15,0] }} style={{ originX:'47px', originY:'28px' }} transition={{ repeat:Infinity, duration:1.4 }}/>
          <motion.line x1="63" y1="28" x2="92" y2="32" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate:[0,15,0] }} style={{ originX:'63px', originY:'28px' }} transition={{ repeat:Infinity, duration:1.4 }}/>
          <rect x="5" y="28" width="14" height="8" rx="2" fill="#FFD700"/>
          <rect x="91" y="28" width="14" height="8" rx="2" fill="#FFD700"/>
        </motion.g>
        <line x1="49" y1="55" x2="42" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="61" y1="55" x2="68" y2="78" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="42" y1="78" x2="36" y2="98" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="68" y1="78" x2="74" y2="98" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="10" y1="105" x2="100" y2="105" stroke="#374151" strokeWidth="3"/>
        <text x="55" y="118" textAnchor="middle" fill="#9CA3AF" fontSize="8">SHRUG</text>
      </svg>
    ),
    fly: (
      <svg viewBox="0 0 130 110" className="w-full h-full">
        <rect x="45" y="60" width="40" height="10" rx="4" fill="#374151"/>
        <circle cx="65" cy="35" r="9" fill="#FF6B35"/>
        <rect x="57" y="45" width="16" height="20" rx="4" fill="#FF6B35"/>
        <motion.g animate={{ rotate:[0,-35,0] }} style={{ originX:'57px', originY:'50px' }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <line x1="57" y1="50" x2="22" y2="55" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="18" cy="55" r="5" fill="#FFD700"/>
        </motion.g>
        <motion.g animate={{ rotate:[0,35,0] }} style={{ originX:'73px', originY:'50px' }} transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}>
          <line x1="73" y1="50" x2="108" y2="55" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="112" cy="55" r="5" fill="#FFD700"/>
        </motion.g>
        <line x1="59" y1="65" x2="54" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <line x1="71" y1="65" x2="76" y2="80" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
        <text x="65" y="100" textAnchor="middle" fill="#9CA3AF" fontSize="8">CABLE FLY</text>
      </svg>
    ),
  };
  return (
    <div className="w-full h-full flex items-center justify-center bg-dark/40 rounded-xl">
      {animations[type] || animations['squat']}
    </div>
  );
};

// ── MUSCLE COLORS ─────────────────────────────────────────────────────────────
const muscleColor = (muscle) => {
  const m = muscle?.toLowerCase()||'';
  if(m.includes('chest'))    return 'bg-red-500/20 text-red-300 border-red-500/30';
  if(m.includes('back')||m.includes('lat')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  if(m.includes('leg')||m.includes('quad')||m.includes('hamstring')) return 'bg-green-500/20 text-green-300 border-green-500/30';
  if(m.includes('glute')) return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
  if(m.includes('shoulder')||m.includes('delt')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  if(m.includes('bicep')) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  if(m.includes('tricep')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  if(m.includes('core')||m.includes('ab')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  if(m.includes('cardio')) return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
  return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function WorkoutPlan() {
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [showAnim, setShowAnim]   = useState(null); // index of exercise with open animation
  const [error, setError]         = useState('');

  useEffect(() => {
    api.get('/client/workout-plan')
      .then(r => setPlan(r.data))
      .catch(err => setError(err.response?.data?.message||'Failed to load workout plan'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if(!plan) return;
    const map={0:6,1:0,2:1,3:2,4:3,5:4,6:5};
    setActiveDay(Math.min(map[new Date().getDay()]??0, plan.days.length-1));
  }, [plan]);

  if(loading) return (
    <div className="space-y-3">
      <div className="h-8 bg-card rounded-xl animate-pulse w-56"/>
      <div className="flex gap-2">{[1,2,3,4,5,6,7].map(i=><div key={i} className="h-10 w-16 bg-card rounded-xl animate-pulse border border-gray-700"/>)}</div>
      <div className="h-64 bg-card rounded-2xl animate-pulse border border-gray-700"/>
    </div>
  );

  if(error) return (
    <div className="bg-card border border-gray-700 rounded-2xl p-8 text-center">
      <p className="text-4xl mb-3">⚠️</p>
      <p className="text-red-400 font-semibold">{error}</p>
      <p className="text-gray-500 text-sm mt-2">Make sure your profile has gender, goal and fitness level set.</p>
    </div>
  );

  const today    = plan?.days?.[activeDay];
  const isRest   = !today?.exercises?.length || today?.focus?.toLowerCase().includes('rest');
  const todayAbbr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-black text-2xl text-white">🏋️ Your Workout Plan</h1>
        <p className="text-gray-400 text-sm mt-1">{plan?.splitType} · {plan?.schedule}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-gray-700 rounded-2xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Schedule</p>
          <p className="text-white font-semibold text-sm">{plan?.schedule}</p>
        </div>
        <div className="bg-card border border-gray-700 rounded-2xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Split Type</p>
          <p className="text-white font-semibold text-sm">{plan?.splitType}</p>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {plan?.days?.map((day, i) => {
          const abbr    = day.day.substring(0,3);
          const isToday = abbr===todayAbbr;
          return (
            <button key={i} onClick={()=>{ setActiveDay(i); setShowAnim(null); }}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all border
                ${activeDay===i   ? 'bg-primary border-primary text-white'
                : isToday         ? 'bg-primary/20 border-primary/50 text-primary'
                :                   'bg-card border-gray-700 text-gray-400 hover:border-gray-500'}`}>
              {abbr}{isToday && <span className="ml-1 text-accent">•</span>}
            </button>
          );
        })}
      </div>

      {/* Day content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeDay} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} className="space-y-3">

          {/* Day header */}
          <div className="bg-card border border-gray-700 rounded-2xl p-5">
            <p className="font-heading font-bold text-lg text-white">{today?.day}</p>
            <p className="text-primary text-sm mt-0.5 font-medium">{today?.focus}</p>
            {!isRest && <p className="text-gray-500 text-xs mt-1">{today?.exercises?.length} exercises · Tap any exercise to see animated demo</p>}
          </div>

          {isRest ? (
            <div className="bg-card border border-gray-700 rounded-2xl p-10 text-center">
              <p className="text-5xl mb-3">😴</p>
              <p className="text-white font-semibold text-lg">Rest Day</p>
              <p className="text-gray-400 text-sm mt-2">{today?.exercises?.[0]?.name||'Recovery is where growth happens! Sleep 8 hours.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {today?.exercises?.map((ex, i) => (
                <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                  className="bg-card border border-gray-700 rounded-2xl overflow-hidden">

                  {/* Exercise row — click to toggle animation */}
                  <button className="w-full text-left p-4 flex items-center gap-3 hover:bg-dark/30 transition-colors"
                    onClick={()=>setShowAnim(showAnim===i?null:i)}>
                    <div className="w-8 h-8 bg-primary/20 text-primary text-sm rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {i+1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{ex.name}</p>
                      {ex.muscle && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border mt-0.5 inline-block ${muscleColor(ex.muscle)}`}>
                          {ex.muscle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 text-xs">
                      {ex.sets!=='–' && (
                        <>
                          <div className="text-center hidden sm:block">
                            <p className="text-gray-500">Sets</p>
                            <p className="text-primary font-bold">{ex.sets}</p>
                          </div>
                          <div className="text-center hidden sm:block">
                            <p className="text-gray-500">Reps</p>
                            <p className="text-white font-semibold">{ex.reps}</p>
                          </div>
                          <div className="text-center hidden sm:block">
                            <p className="text-gray-500">Rest</p>
                            <p className="text-gray-300">{ex.rest}</p>
                          </div>
                        </>
                      )}
                      <span className={`text-gray-400 transition-transform duration-200 ${showAnim===i?'rotate-180':''}`}>▾</span>
                    </div>
                  </button>

                  {/* Mobile sets/reps row */}
                  {ex.sets!=='–' && (
                    <div className="flex gap-4 px-4 pb-3 sm:hidden text-xs">
                      <div><span className="text-gray-500">Sets: </span><span className="text-primary font-bold">{ex.sets}</span></div>
                      <div><span className="text-gray-500">Reps: </span><span className="text-white">{ex.reps}</span></div>
                      <div><span className="text-gray-500">Rest: </span><span className="text-gray-300">{ex.rest}</span></div>
                    </div>
                  )}

                  {/* Animated demo panel */}
                  <AnimatePresence>
                    {showAnim===i && (
                      <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                        className="overflow-hidden border-t border-gray-700/50">
                        <div className="p-4">
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3 text-center">Exercise Demo</p>
                          <div className="max-w-[180px] mx-auto" style={{height:'160px'}}>
                            <ExerciseAnimation type={ex.animation||'squat'}/>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
                            <div className="bg-dark rounded-xl p-2 border border-gray-700">
                              <p className="text-gray-500">Sets</p>
                              <p className="text-primary font-bold text-base">{ex.sets}</p>
                            </div>
                            <div className="bg-dark rounded-xl p-2 border border-gray-700">
                              <p className="text-gray-500">Reps</p>
                              <p className="text-white font-bold text-base">{ex.reps}</p>
                            </div>
                            <div className="bg-dark rounded-xl p-2 border border-gray-700">
                              <p className="text-gray-500">Rest</p>
                              <p className="text-gray-300 font-bold">{ex.rest}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tips */}
      {plan?.tips?.length>0 && (
        <div className="bg-card border border-gray-700 rounded-2xl p-5">
          <p className="text-white font-semibold mb-3">💡 Training Tips</p>
          <div className="space-y-2">
            {plan.tips.map((tip,i)=>(
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-primary font-bold mt-0.5">→</span> {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-gray-600 text-xs">⚠️ Always warm up before training. Stop if you feel pain.</p>
    </div>
  );
}