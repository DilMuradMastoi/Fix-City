import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Heart, Shield, PhoneCall, Sparkles, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 flex items-center justify-center text-white shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white font-display">
                FIXMYCITY <span className="text-blue-400">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Report Problems. Track Progress. Improve Your City." An AI-powered civic platform empowering citizens
              and municipalities to build safer, cleaner communities together.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Municipal Systems Online & Syncing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/explore" className="hover:text-blue-400 transition-colors">
                  Explore City Issues
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-blue-400 transition-colors">
                  Report A Problem
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-400 transition-colors">
                  Citizen Dashboard
                </Link>
              </li>
              <li>
                <Link to="/my-reports" className="hover:text-blue-400 transition-colors">
                  Track My Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Issue Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Report Categories</h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-400">
              <Link to="/explore?category=Garbage" className="hover:text-blue-400">
                🗑️ Waste & Trash
              </Link>
              <Link to="/explore?category=Road Damage" className="hover:text-blue-400">
                🛣️ Road & Potholes
              </Link>
              <Link to="/explore?category=Street Light" className="hover:text-blue-400">
                💡 Street Lights
              </Link>
              <Link to="/explore?category=Water Leakage" className="hover:text-blue-400">
                💧 Water Leaks
              </Link>
              <Link to="/explore?category=Traffic" className="hover:text-blue-400">
                🚦 Traffic Signals
              </Link>
              <Link to="/explore?category=Safety" className="hover:text-blue-400">
                ⚠️ Public Safety
              </Link>
            </div>
          </div>

          {/* Civic Hotline & Notice */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Civic Notice</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              For immediate life-threatening emergencies, structural collapses, or live wires, please dial 911 / 112
              directly.
            </p>
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
              <span>Civic Dispatch 311 Hotline</span>
              <span className="font-mono font-bold text-slate-200">1-800-FIX-CITY</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FixMyCity AI — Modern Hackathon Edition. All civic rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Powered by</span>
            <span className="font-semibold text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Gemini Vision AI & MERN Stack
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
