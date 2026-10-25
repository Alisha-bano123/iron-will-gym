import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ExpiryPopup from '../../components/ExpiryPopup';

const navItems = [
  { to: '/client/dashboard',     icon: '🏠', label: 'Dashboard'       },
  { to: '/client/diet',          icon: '🥗', label: 'Diet Plan'        },
  { to: '/client/workout',       icon: '🏋️', label: 'Workout Plan'     },
  { to: '/client/workoutlog',    icon: '📓', label: 'Workout Log'      },
  { to: '/client/streak',        icon: '🔥', label: 'My Streak'        },
  { to: '/client/weight',        icon: '📈', label: 'Weight Tracker'   },
  { to: '/client/announcements', icon: '📢', label: 'Announcements'    },
  { to: '/client/notes',         icon: '📝', label: 'Progress Notes'   },
  { to: '/client/feedback',      icon: '⭐', label: 'Give Feedback'    },
];

export default function ClientLayout() {
  const { user, logout }              = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const planLabel = p => ({ '1_month':'1 Month', '3_month':'3 Months', '6_month':'6 Months' })[p] || '';
  const totalDays = { '1_month':30, '3_month':90, '6_month':180 }[user?.selectedPlan] || 30;
  const daysLeft  = user?.planEndDate
    ? Math.max(0, Math.ceil((new Date(user.planEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;
  const planPct = daysLeft !== null ? Math.min(100, Math.round((daysLeft / totalDays) * 100)) : 0;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800 flex-shrink-0">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-heading font-black text-white">IW</div>
        <div>
          <p className="font-heading font-bold text-white text-sm leading-none">Iron Will Gym</p>
          <p className="text-gray-500 text-xs">Member Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
               ${isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Plan info */}
      {user?.planEndDate && (
        <div className="mx-3 mb-3 bg-dark border border-gray-700 rounded-xl p-3 flex-shrink-0">
          <p className="text-gray-500 text-xs mb-0.5">Active Plan</p>
          <p className="text-white text-sm font-semibold">{planLabel(user.selectedPlan)}</p>
          {daysLeft !== null && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Remaining</span>
                <span className={daysLeft <= 7 ? 'text-yellow-400' : 'text-white'}>{daysLeft}d</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width:`${planPct}%` }}/>
              </div>
            </div>
          )}
          {daysLeft !== null && daysLeft <= 7 && (
            <p className="text-yellow-400 text-xs mt-2">⚠️ Expiring soon! Renew at counter.</p>
          )}
        </div>
      )}

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs capitalize">{user?.goal?.replace('_',' ')}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 py-2 rounded-xl text-xs transition-colors">
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Expiry popup — auto shows when plan expires soon */}
      <ExpiryPopup />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-secondary border-r border-gray-800 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-secondary border-r border-gray-800 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-4 px-4 py-3 bg-secondary border-b border-gray-800 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-heading font-bold text-white text-sm">Iron Will Gym</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}