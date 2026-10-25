import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-gray-800 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-heading font-black text-white">IW</div>
              <span className="font-heading font-bold text-white text-lg">IRON WILL GYM</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transform your body. Transform your life. Your fitness journey starts here.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/#plans"    className="hover:text-primary transition-colors">Plans & Pricing</a></li>
              <li><a href="/#location" className="hover:text-primary transition-colors">Our Location</a></li>
              <li><a href="/#join"     className="hover:text-primary transition-colors">Join Now</a></li>
              <li><Link to="/login"    className="hover:text-primary transition-colors">Member Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-3">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📍 123 Fitness Street, Vaishali Nagar, Jaipur</li>
              <li>📞 +91 98765 43210</li>
              <li>✉️ ironwillgym@email.com</li>
              <li>🕐 Mon–Sat: 5:00 AM – 10:00 PM</li>
              <li>🕐 Sunday: 6:00 AM – 8:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Iron Will Gym. All rights reserved.</p>
          <p>Built with 💪 for fitness enthusiasts</p>
        </div>
      </div>
    </footer>
  );
}