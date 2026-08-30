import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Report, IssueCategory, IssueStatus, IssuePriority } from '../types';
import { ReportCard } from '../components/ReportCard';
import { CardSkeleton } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';
import {
  Search,
  Filter,
  MapPin,
  Flame,
  LayoutGrid,
  Map as MapIcon,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

const CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'All Categories', icon: '🌐' },
  { id: 'Garbage', label: 'Garbage & Waste', icon: '🗑️' },
  { id: 'Road Damage', label: 'Roads & Potholes', icon: '🛣️' },
  { id: 'Street Light', label: 'Street Lights', icon: '💡' },
  { id: 'Water Leakage', label: 'Water Leakage', icon: '💧' },
  { id: 'Infrastructure', label: 'Infrastructure', icon: '🚧' },
  { id: 'Environment', label: 'Environment', icon: '🌳' },
  { id: 'Traffic', label: 'Traffic & Signals', icon: '🚦' },
  { id: 'Safety', label: 'Public Safety', icon: '⚠️' },
];

export const ExploreReports: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [selectedPriority, setSelectedPriority] = useState<string>(searchParams.get('priority') || 'all');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'newest');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedMapReport, setSelectedMapReport] = useState<Report | null>(null);

  // Fetch reports when filters change
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedPriority && selectedPriority !== 'all') params.priority = selectedPriority;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.get('/reports', { params });
      if (res.data.success && Array.isArray(res.data.data)) {
        setReports(res.data.data);
        if (res.data.data.length > 0 && !selectedMapReport) {
          setSelectedMapReport(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCategory, selectedStatus, selectedPriority, sortBy]);

  // Sync URL search params
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Explore City Issues
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Browse public municipal reports, upvote pressing hazards, and track real-time resolution status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Interactive City Map"
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Interactive Map</span>
              </button>
            </div>

            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:scale-105 transition-all"
            >
              <span>+ Report Issue</span>
            </Link>
          </div>
        </div>

        {/* SEARCH & ADVANCED FILTERS BAR */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          {/* Top Search Input & Sorters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search issues by title, street address, or keyword..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute inset-y-1.5 right-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="newest">🕒 Newest First</option>
                <option value="upvotes">🔥 Most Upvoted</option>
                <option value="oldest">📅 Oldest First</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="Under Review">Under Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>

              {(selectedCategory !== 'all' ||
                selectedStatus !== 'all' ||
                selectedPriority !== 'all' ||
                searchTerm) && (
                <button
                  onClick={handleResetFilters}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Chips Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTS COUNT */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold">
            Showing <strong className="text-slate-900 dark:text-white">{reports.length}</strong> municipal issues
          </span>
          {selectedCategory !== 'all' && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Filtered by: {selectedCategory}
            </span>
          )}
        </div>

        {/* VIEW: GRID OR MAP */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching reports found"
            description="Try changing your search terms, clearing category filters, or report a new issue for this area."
            actionText="Report New Issue"
            actionLink="/report"
          />
        ) : viewMode === 'grid' ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onUpvoteChange={(updated) => {
                  setReports((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
                }}
              />
            ))}
          </div>
        ) : (
          /* Interactive City Map Visualization View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl">
            {/* Visual Simulated Map Stage */}
            <div className="lg:col-span-8 h-[550px] rounded-2xl bg-slate-950 relative overflow-hidden flex flex-col justify-between p-6 border border-slate-800">
              {/* Map grid overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-blue-950/40" />

              {/* Simulated Map Streets & Rivers */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M -50 150 Q 200 120 400 280 T 900 250" fill="none" stroke="#0ea5e9" strokeWidth="8" />
                <path d="M 120 -20 L 120 600" fill="none" stroke="#64748b" strokeWidth="3" strokeDasharray="6,6" />
                <path d="M 450 -20 L 450 600" fill="none" stroke="#64748b" strokeWidth="4" />
                <path d="M -20 380 L 900 380" fill="none" stroke="#64748b" strokeWidth="3" />
                <path d="M -20 200 L 900 200" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4,4" />
              </svg>

              {/* Map Controls & Status Header */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-white text-xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Metro GPS Cluster View ({reports.length} Geo-Nodes)</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800">
                  CENTER: 37.7749° N, -122.4194° W
                </span>
              </div>

              {/* Interactive Report Pins */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                {reports.map((rep, idx) => {
                  const isSelected = selectedMapReport?._id === rep._id;
                  // Calculate dynamic positions spread across container
                  const topPct = 20 + ((idx * 27) % 60);
                  const leftPct = 15 + ((idx * 33) % 70);

                  return (
                    <button
                      key={rep._id}
                      onClick={() => setSelectedMapReport(rep)}
                      style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 cursor-pointer ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm shadow-xl border-2 transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-white text-white ring-4 ring-blue-500/40 shadow-blue-500/50'
                            : rep.priority === 'Critical'
                            ? 'bg-rose-600 border-rose-400 text-white animate-bounce'
                            : rep.status === 'Resolved'
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : 'bg-slate-800 border-slate-600 text-slate-200'
                        }`}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/90 text-white border border-slate-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {rep.title.substring(0, 20)}...
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Map Legend Footer */}
              <div className="relative z-10 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-300 bg-slate-900/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Critical Hazard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Active Ticket</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Resolved</span>
                </div>
              </div>
            </div>

            {/* Selected Pin Details Sidebar */}
            <div className="lg:col-span-4 flex flex-col justify-between p-2">
              {selectedMapReport ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Selected Pin Details
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">#{selectedMapReport._id.slice(-6)}</span>
                  </div>

                  <img
                    src={selectedMapReport.image}
                    alt={selectedMapReport.title}
                    className="w-full h-44 rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
                  />

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {selectedMapReport.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                      {selectedMapReport.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{selectedMapReport.location.address}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Status: {selectedMapReport.status}</span>
                      <span>Priority: {selectedMapReport.priority}</span>
                    </div>
                  </div>

                  <Link
                    to={`/reports/${selectedMapReport._id}`}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-colors"
                  >
                    <span>View Full Investigation Page</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-6 text-slate-400 text-xs">
                  Click any marker on the map to preview municipal report details.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
