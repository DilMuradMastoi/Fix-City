import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Users,
  Building,
  Wrench,
  Camera,
  Layers,
  ArrowUpRight,
  Flame,
  ThumbsUp,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Report } from '../types';
import { ReportCard } from '../components/ReportCard';

export const Landing: React.FC = () => {
  const { user, quickDemoLogin } = useAuth();
  const [featuredReports, setFeaturedReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'resolved'>('all');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/reports?sortBy=upvotes');
        if (res.data.success && Array.isArray(res.data.data)) {
          setFeaturedReports(res.data.data.slice(0, 3));
        }
      } catch (e) {
        console.warn('Could not load featured reports:', e);
      }
    };
    fetchFeatured();
  }, []);

  const CATEGORIES = [
    {
      id: 'Garbage',
      title: 'Garbage & Waste',
      icon: '🗑️',
      desc: 'Overflowing dumpsters, illegal dumping, and uncollected municipal refuse.',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-500',
    },
    {
      id: 'Road Damage',
      title: 'Roads & Potholes',
      icon: '🛣️',
      desc: 'Dangerous asphalt potholes, broken curbs, and eroded lane pavement.',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-500',
    },
    {
      id: 'Street Light',
      title: 'Street Lighting',
      icon: '💡',
      desc: 'Defective street lamps, dark corridors, and electrical wiring faults.',
      color: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/30 text-yellow-500',
    },
    {
      id: 'Water Leakage',
      title: 'Water Leakage',
      icon: '💧',
      desc: 'Burst municipal pipes, flooding sidewalks, and clogged storm drains.',
      color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-500',
    },
    {
      id: 'Traffic',
      title: 'Traffic & Signals',
      icon: '🚦',
      desc: 'Malfunctioning traffic signals, missing road signs, and blind intersection hazards.',
      color: 'from-red-500/10 to-rose-500/10 border-red-500/30 text-red-500',
    },
    {
      id: 'Safety',
      title: 'Public Safety',
      icon: '⚠️',
      desc: 'Exposed live wires, open manholes, structural collapse, and safety threats.',
      color: 'from-rose-500/10 to-pink-500/10 border-rose-500/30 text-rose-500',
    },
    {
      id: 'Environment',
      title: 'Environment & Parks',
      icon: '🌳',
      desc: 'Fallen trees, polluted public waterways, and damaged public park benches.',
      color: 'from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-500',
    },
    {
      id: 'Infrastructure',
      title: 'Infrastructure',
      icon: '🚧',
      desc: 'Damaged bridges, sidewalk fissures, fractured guardrails, and public property damage.',
      color: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/30 text-indigo-500',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🌟 HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Background glow and subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 dark:opacity-20 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/15 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Next-Gen AI Civic Infrastructure Reporting</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.1] font-display">
                Your Voice Can <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  Fix Your City.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Report civic problems, track their real-time progress, and help build cleaner, safer, smarter
                communities with multimodal AI vision analysis and community consensus.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Report an Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-blue-500" />
                  <span>Explore Reports</span>
                </Link>
              </div>

              {/* Quick Demo Login Bar for Evaluation */}
              {!user && (
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Hackathon Demo:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => quickDemoLogin('citizen')}
                      className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors border border-blue-300/60 dark:border-blue-800 cursor-pointer"
                    >
                      Login as Citizen
                    </button>
                    <button
                      onClick={() => quickDemoLogin('admin')}
                      className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors border border-purple-300/60 dark:border-purple-800 cursor-pointer"
                    >
                      Login as City Admin
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Showcase Glass Card */}
                <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xl p-5 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Live Issue Dispatched
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      ID: #R-9042
                    </span>
                  </div>

                  {/* Sample Photo */}
                  <div className="relative rounded-2xl overflow-hidden h-48 bg-slate-800">
                    <img
                      src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
                      alt="Pothole repair sample"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white">
                      🛣️ Road Damage
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-sm">
                      Critical Priority
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/75 backdrop-blur-md text-white flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">5th Ave & Pine Street</span>
                      </div>
                      <span className="font-semibold text-emerald-400 shrink-0">In Progress</span>
                    </div>
                  </div>

                  {/* AI Vision Chip */}
                  <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI Vision Auto-Classification
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">98.4% Match</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      Detected: Severe road asphalt depression (8" depth). Auto-routed to Dept. of Public Works.
                    </p>
                  </div>

                  {/* Timeline mini */}
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold pt-1">
                    <div className="p-1.5 rounded-lg bg-emerald-500 text-white">✓ Reported</div>
                    <div className="p-1.5 rounded-lg bg-emerald-500 text-white">✓ Reviewed</div>
                    <div className="p-1.5 rounded-lg bg-blue-600 text-white animate-pulse">🛠️ In Work</div>
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">Resolved</div>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 flex items-center gap-3 backdrop-blur-md hidden sm:flex">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">+48 Citizen Upvotes</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Priority expedited to High</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 HOW IT WORKS (3-Step Section) */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Simple 3-Step Civic Cycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
              How FixMyCity AI Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Empowering everyday citizens to report problems and municipalities to resolve them transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="group rounded-3xl p-8 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all duration-300 relative">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-2xl mb-6 group-hover:scale-110 transition-transform">
                📸
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                STEP 01
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-3 font-display">
                1️⃣ Report With AI Assist
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Snap a photo on your phone. FixMyCity AI auto-detects the category, suggests severity priority, and tags
                exact GPS coordinates instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group rounded-3xl p-8 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-xl transition-all duration-300 relative">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl mb-6 group-hover:scale-110 transition-transform">
                🔍
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                STEP 02
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-3 font-display">
                2️⃣ Track Every Stage
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Follow your issue across transparent municipal checkpoints: <strong>Reported</strong> →{' '}
                <strong>Under Review</strong> → <strong>In Progress</strong> → <strong>Resolved</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group rounded-3xl p-8 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-2xl mb-6 group-hover:scale-110 transition-transform">
                🎉
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                STEP 03
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-3 font-display">
                3️⃣ Improve Your City
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Community members upvote urgent hazards. Municipal crews dispatch faster, verify repairs, and improve
                safety for everyone in the neighborhood.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🏷️ ISSUE CATEGORIES */}
      <section className="py-20 bg-slate-50/60 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Civic Taxonomies
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
                Common Issue Categories
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select a category to explore existing reports or start a new ticket.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View all issues in your area</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/explore?category=${encodeURIComponent(cat.id)}`}
                className={`group p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${cat.color}`}
              >
                <div>
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 font-display flex items-center justify-between">
                    <span>{cat.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{cat.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Filter category</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 📊 IMPACT & LIVE STATISTICS */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Civic Progress Metrics</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display">Real Numbers. Tangible Impact.</h2>
            <p className="text-slate-400 text-sm">
              FixMyCity AI powers citizen participation across multiple metropolitan districts.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 text-center space-y-2 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-display">2,500+</p>
              <p className="text-xs font-medium text-slate-400">Reports Submitted</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 text-center space-y-2 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-display">1,800+</p>
              <p className="text-xs font-medium text-slate-400">Problems Resolved</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 text-center space-y-2 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-3">
                <Building className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-display">12</p>
              <p className="text-xs font-medium text-slate-400">Cities Connected</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 text-center space-y-2 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-display">8,000+</p>
              <p className="text-xs font-medium text-slate-400">Active Citizens</p>
            </div>
          </div>
        </div>
      </section>

      {/* 📣 LIVE COMMUNITY ISSUES FEED */}
      {featuredReports.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Community Verified
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
                  High-Priority City Reports
                </h2>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Explore all {featuredReports.length}+ reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredReports.map((report) => (
                <ReportCard key={report._id} report={report} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 📢 CALL TO ACTION (CTA) SECTION */}
      <section className="py-20 bg-gradient-to-tr from-blue-600 via-indigo-700 to-cyan-600 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
            See Something Wrong? Report It.
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto font-normal">
            Join thousands of active citizens making our streets safer, parks greener, and public infrastructure
            stronger every single day.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-700 font-extrabold text-sm shadow-2xl hover:bg-blue-50 hover:scale-105 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Report an Issue Now</span>
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-900/40 hover:bg-blue-900/60 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all cursor-pointer"
            >
              <span>Explore Public Map</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
