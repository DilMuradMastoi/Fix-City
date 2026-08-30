import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Report, IssueStatus, IssuePriority } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusTimeline } from '../components/StatusTimeline';
import { Loader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  ThumbsUp,
  Share2,
  ArrowLeft,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  Building,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export const ReportDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpvoting, setIsUpvoting] = useState(false);

  // Admin In-line management state
  const [adminStatus, setAdminStatus] = useState<IssueStatus>('Reported');
  const [adminPriority, setAdminPriority] = useState<IssuePriority>('Medium');
  const [officialResponse, setOfficialResponse] = useState('');
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/${id}`);
      if (res.data.success && res.data.data) {
        setReport(res.data.data);
        setAdminStatus(res.data.data.status);
        setAdminPriority(res.data.data.priority);
        setOfficialResponse(res.data.data.officialResponse || '');
      }
    } catch (err: any) {
      toast.error('Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const handleUpvote = async () => {
    if (!user) {
      toast.error('Please log in to upvote this issue!');
      navigate('/login');
      return;
    }
    if (!report || isUpvoting) return;

    setIsUpvoting(true);
    const hasUpvoted = report.upvotes?.includes(user._id);

    try {
      const res = await api.put(`/reports/${report._id}/upvote`);
      if (res.data.success && res.data.data) {
        setReport(res.data.data);
        if (!hasUpvoted) {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.8 },
          });
          toast.success('Thank you for verifying this civic issue!');
        } else {
          toast('Upvote removed', { icon: 'ℹ️' });
        }
      }
    } catch (err: any) {
      toast.error('Failed to update upvote');
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard! Share with neighbors to get more upvotes.');
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    setIsUpdatingAdmin(true);
    try {
      // 1. Update Status & Note
      const res1 = await api.put(`/admin/reports/${report._id}/status`, {
        status: adminStatus,
        officialResponse: officialResponse,
      });

      // 2. Update Priority
      const res2 = await api.put(`/admin/reports/${report._id}/priority`, {
        priority: adminPriority,
      });

      if (res1.data.success || res2.data.success) {
        toast.success('Municipal dispatch status updated successfully!');
        fetchReport();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update administrative status');
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!report) return;
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      if (user?.role === 'admin') {
        await api.delete(`/admin/reports/${report._id}`);
      } else {
        await api.delete(`/reports/${report._id}`);
      }
      toast.success('Report deleted successfully');
      navigate('/explore');
    } catch (err: any) {
      toast.error('Failed to delete report');
    }
  };

  if (loading) {
    return <Loader fullScreen message="Loading civic report details..." />;
  }

  if (!report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Report Not Found</h2>
        <p className="text-slate-500 text-sm">The civic issue ticket you requested does not exist or was removed.</p>
        <Link to="/explore" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs">
          Return to Explore
        </Link>
      </div>
    );
  }

  const hasUpvoted = user ? report.upvotes?.includes(user._id) : false;
  const isReporter = user?._id === report.reportedBy?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back navigation & Share */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to issues</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Ticket</span>
            </button>

            {(isReporter || isAdmin) && (
              <button
                onClick={handleDeleteReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-rose-600 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                title="Delete this report"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Photo, Details, Timeline */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Box */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                    {report.category}
                  </span>
                  <PriorityBadge priority={report.priority} />
                </div>
                <StatusBadge status={report.status} size="md" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display leading-tight">
                {report.title}
              </h1>

              {/* Photo Showcase */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
                <img
                  src={report.image}
                  alt={report.title}
                  className="w-full max-h-[420px] object-cover"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Problem Description
                </h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>

              {/* Official Municipal Response Note if provided */}
              {report.officialResponse && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span>Official Municipal Resolution Update</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    "{report.officialResponse}"
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Multi-Step Timeline */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Resolution Progress Track</span>
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Last updated: {new Date(report.updatedAt || report.createdAt).toLocaleDateString()}
                </span>
              </div>

              <StatusTimeline
                currentStatus={report.status}
                history={report.statusHistory}
                createdAt={report.createdAt}
              />
            </div>
          </div>

          {/* Right Column: Location, Upvotes, Citizen Card, Admin Box */}
          <div className="lg:col-span-4 space-y-6">
            {/* UPVOTE & COMMUNITY VERIFICATION CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Community Consensus
              </h3>
              <div className="space-y-1">
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white font-display">
                  {report.upvotes?.length || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Citizens verified this hazard</p>
              </div>

              <button
                onClick={handleUpvote}
                disabled={isUpvoting}
                className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  hasUpvoted
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-white' : ''}`} />
                <span>{hasUpvoted ? 'Upvoted (Click to remove)' : 'Upvote This Issue'}</span>
              </button>
            </div>

            {/* LOCATION CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Incident Geolocation</span>
              </h3>

              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {report.location.address}
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs font-mono space-y-1 text-slate-600 dark:text-slate-400">
                  <p>LAT: {report.location.latitude}°</p>
                  <p>LNG: {report.location.longitude}°</p>
                </div>
              </div>
            </div>

            {/* CITIZEN AUTHOR CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Reported By
              </h3>

              <div className="flex items-center gap-3">
                <img
                  src={report.reportedBy?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${report.reportedBy?.name}`}
                  alt={report.reportedBy?.name}
                  className="w-11 h-11 rounded-xl object-cover bg-blue-50 dark:bg-slate-800 border"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {report.reportedBy?.name || 'Anonymous Citizen'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {report.reportedBy?.email || 'Verified Citizen'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Submitted on:</span>
                <span className="font-medium">
                  {new Date(report.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* 🛡️ CITY ADMIN INLINE CONTROL HUB */}
            {isAdmin && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 border-2 border-purple-300 dark:border-purple-800/80 shadow-md space-y-4">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <span>Admin Dispatch Control</span>
                </div>

                <form onSubmit={handleAdminUpdate} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Update Dispatch Status:
                    </label>
                    <select
                      value={adminStatus}
                      onChange={(e) => setAdminStatus(e.target.value as IssueStatus)}
                      className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Adjust Priority Level:
                    </label>
                    <select
                      value={adminPriority}
                      onChange={(e) => setAdminPriority(e.target.value as IssuePriority)}
                      className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Official Response / Work Note:
                    </label>
                    <textarea
                      value={officialResponse}
                      onChange={(e) => setOfficialResponse(e.target.value)}
                      rows={3}
                      placeholder="e.g. Crew #14 deployed. Asphalt patch applied and inspected."
                      className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingAdmin}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    {isUpdatingAdmin ? 'Updating Status...' : 'Save Municipal Status'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
