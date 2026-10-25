import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const navItems = [
  { to: '/owner/dashboard',     icon: '📊', label: 'Dashboard'        },
  { to: '/owner/pending',       icon: '🔔', label: 'Pending Requests', badge: true },
  { to: '/owner/members',       icon: '👥', label: 'All Members'       },
  { to: '/owner/expiring',      icon: '⚠️',  label: 'Expiring Plans'   },
  { to: '/owner/attendance',    icon: '📅', label: 'Attendance'        },
  { to: '/owner/payments',      icon: '💰', label: 'Payments'          },
  { to: '/owner/announcements', icon: '📢', label: 'Announcements'     },
  { to: '/owner/feedbacks',     icon: '⭐', label: 'Feedbacks'         },
];

export default function OwnerLayout() {
  const { user, logout }                = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  useEffect(() => {
    const fetch = () =>
      api.get('/owner/dashboard')
        .then(r => setPendingCount(r.data.pendingRequests))
        .catch(() => {});
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800 flex-shrink-0">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-heading font-black text-white">IW</div>
        <div>
          <p className="font-heading font-bold text-white text-sm leading-none">Iron Will Gym</p>
          <p className="text-gray-500 text-xs">Owner Panel</p>
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
            <span className="flex-1">{item.label}</span>
            {item.badge && pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-secondary font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs">Owner 👑</p>
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
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-secondary border-b border-gray-800 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-heading font-bold text-white text-sm flex-1">Iron Will — Owner</span>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}