import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  // Scroll pe navbar ka background change karo
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleDashboard = () => {
    if (user?.role === 'owner')           navigate('/owner/dashboard');
    else if (user?.status === 'approved') navigate('/client/dashboard');
    else                                  navigate('/pending');
    setMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-secondary/95 backdrop-blur shadow-lg shadow-primary/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-heading font-black text-white text-lg">IW</div>
            <span className="font-heading font-bold text-white text-lg hidden sm:block">IRON WILL GYM</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/#plans"    className="text-gray-300 hover:text-primary transition-colors text-sm font-medium">Plans</a>
            <a href="/#location" className="text-gray-300 hover:text-primary transition-colors text-sm font-medium">Location</a>
            <a href="/#join"     className="text-gray-300 hover:text-primary transition-colors text-sm font-medium">Join Now</a>

            {user ? (
              <div className="flex items-center gap-3">
                <button onClick={handleDashboard}
                  className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Dashboard
                </button>
                <button onClick={logout}
                  className="border border-gray-600 hover:border-primary text-gray-300 hover:text-primary px-4 py-2 rounded-lg text-sm transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="bg-primary hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-secondary border-t border-gray-800 px-4 py-4 flex flex-col gap-3">
            <a href="/#plans"    className="text-gray-300 hover:text-primary py-2 text-sm" onClick={() => setMenuOpen(false)}>Plans</a>
            <a href="/#location" className="text-gray-300 hover:text-primary py-2 text-sm" onClick={() => setMenuOpen(false)}>Location</a>
            <a href="/#join"     className="text-gray-300 hover:text-primary py-2 text-sm" onClick={() => setMenuOpen(false)}>Join Now</a>
            {user ? (
              <>
                <button onClick={handleDashboard} className="bg-primary text-white py-2.5 rounded-xl text-sm font-semibold">Dashboard</button>
                <button onClick={logout}          className="border border-gray-600 text-gray-300 py-2.5 rounded-xl text-sm">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="bg-primary text-white py-2.5 rounded-xl text-sm font-semibold text-center block">
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}