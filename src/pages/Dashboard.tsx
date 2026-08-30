import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Report } from '../types';
import { ReportCard } from '../components/ReportCard';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/Loader';
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Activity,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/user/my-reports');
        if (res.data.success && Array.isArray(res.data.data)) {
          setMyReports(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load user reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyReports();
  }, []);

  const totalSubmitted = myReports.length;
  const inProgress = myReports.filter((r) => r.status === 'In Progress' || r.status === 'Under Review').length;
  const resolved = myReports.filter((r) => r.status === 'Resolved').length;
  const totalVotesReceived = myReports.reduce((acc, r) => acc + (r.upvotes?.length || 0), 0);

  const filteredReports = myReports.filter((r) => {
    if (activeFilter === 'pending') return r.status === 'Reported' || r.status === 'Under Review';
    if (activeFilter === 'in_progress') return r.status === 'In Progress';
    if (activeFilter === 'resolved') return r.status === 'Resolved';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FixMyCity AI Citizen Portal</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
                Welcome back, {user?.name || 'Citizen'}!
              </h1>
              <p className="text-sm text-blue-100 max-w-xl">
                Track your active municipal tickets, watch repair progress, and collaborate with city inspectors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-transform hover:scale-105 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report New Issue</span>
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-900/40 hover:bg-blue-900/60 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-colors cursor-pointer"
              >
                <span>Explore City Map</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Submitted</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
                {totalSubmitted}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Progress / Review</p>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-display">
                {inProgress}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Resolved Issues</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
                {resolved}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Upvotes Received</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-display">
                {totalVotesReceived}
              </p>
            </div>
          </div>
        </div>

        {/* My Reports Filter & List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                My Reported Civic Issues
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tickets submitted by you to municipal dispatch
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({myReports.length})
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'pending'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveFilter('in_progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'in_progress'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'resolved'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report._id}
                  report={report}
                  onUpvoteChange={(updated) => {
                    setMyReports((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={AlertCircle}
              title="No reports match this filter"
              description="You haven't submitted any civic reports in this category yet. Notice something broken or dangerous in your neighborhood?"
              actionText="Report An Issue Now"
              actionLink="/report"
            />
          )}
        </div>
      </div>
    </div>
  );
};
