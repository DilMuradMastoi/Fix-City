import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Report, AdminStats, IssueStatus, IssuePriority, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Loader } from '../components/Loader';
import {
  ShieldCheck,
  Building,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Trash2,
  Edit,
  ExternalLink,
  MessageSquare,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Reported: '#3B82F6',
  'Under Review': '#F59E0B',
  'In Progress': '#8B5CF6',
  Resolved: '#10B981',
};

const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users'>('overview');

  // Filters for reports table
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Quick edit note modal
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editStatus, setEditStatus] = useState<IssueStatus>('Reported');
  const [officialNote, setOfficialNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/reports'),
        api.get('/admin/users'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (reportsRes.data.success) setReports(reportsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to load municipal dispatch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusChange = async (reportId: string, newStatus: IssueStatus) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setReports((prev) => prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r)));
        // Refresh stats
        const sRes = await api.get('/admin/stats');
        if (sRes.data.success) setStats(sRes.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePriorityChange = async (reportId: string, newPriority: IssuePriority) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}/priority`, { priority: newPriority });
      if (res.data.success) {
        toast.success(`Priority set to ${newPriority}`);
        setReports((prev) => prev.map((r) => (r._id === reportId ? { ...r, priority: newPriority } : r)));
      }
    } catch (err: any) {
      toast.error('Failed to update priority');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this civic ticket?')) return;

    try {
      const res = await api.delete(`/admin/reports/${reportId}`);
      if (res.data.success) {
        toast.success('Report deleted successfully');
        setReports((prev) => prev.filter((r) => r._id !== reportId));
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error('Failed to delete report');
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    setIsUpdating(true);
    try {
      const res = await api.put(`/admin/reports/${editingReport._id}/status`, {
        status: editStatus,
        officialResponse: officialNote,
      });

      if (res.data.success) {
        toast.success('Status & municipal response recorded!');
        setEditingReport(null);
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update report');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reportedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return <Loader fullScreen message="Loading Municipal Control Center & Analytics..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-purple-800/60 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Municipal Control Center & Dispatch</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
                City Administrator Hub
              </h1>
              <p className="text-xs sm:text-sm text-purple-200">
                Manage civic tickets, assign repair priorities, update work orders, and review district analytics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAdminData}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-800/60 hover:bg-purple-800 text-white text-xs font-semibold border border-purple-700/60 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Live Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Tickets</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                {stats.totalReports}
              </p>
              <p className="text-[10px] text-blue-500 font-semibold">{stats.totalUsers} registered citizens</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pending Intake</span>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-display">
                {stats.reportedPending}
              </p>
              <p className="text-[10px] text-slate-400">Needs review & dispatch</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">In Progress</span>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-display">
                {stats.inProgressReports + stats.underReviewReports}
              </p>
              <p className="text-[10px] text-purple-400">Crews deployed on-site</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Resolved</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
                {stats.resolvedReports}
              </p>
              <p className="text-[10px] text-emerald-500 font-semibold">Closed successfully</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Resolution Rate</span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-display">
                {stats.resolutionRate}%
              </p>
              <p className="text-[10px] text-amber-500 font-semibold">{stats.highOrCritical} high severity</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>District Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Manage Work Orders ({reports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Citizen Directory ({users.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & RECHARTS */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Timeline Trends Chart */}
              <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Reported vs. Resolved Trend (Monthly Velocity)
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.timelineTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="reported"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorReported)"
                        name="Reported Issues"
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        stroke="#10B981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorResolved)"
                        name="Resolved Work Orders"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Breakdown Pie Chart */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Issue Status Distribution
                </h3>
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                  {stats.statusData.map((st) => (
                    <div key={st.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                      <span className="text-slate-600 dark:text-slate-300 truncate">
                        {st.name}: {st.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories and Priorities Bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Issues by Municipal Category
                </h3>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]}>
                        {stats.categoryData.map((_, index) => (
                          <Cell key={`cat-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Issues by Severity Priority
                </h3>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE WORK ORDERS TABLE */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {/* Table Filters */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by title, address, citizen..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="all">All Categories</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Road Damage">Road Damage</option>
                  <option value="Street Light">Street Light</option>
                  <option value="Water Leakage">Water Leakage</option>
                  <option value="Traffic">Traffic</option>
                  <option value="Safety">Safety</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="Reported">Reported</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Issue Details</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status (Action)</th>
                      <th className="p-3.5">Reporter</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredReports.map((report) => (
                      <tr key={report._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={report.image}
                              alt={report.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div className="max-w-xs">
                              <Link
                                to={`/reports/${report._id}`}
                                className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 line-clamp-1"
                              >
                                {report.title}
                              </Link>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">{report.location.address}</p>
                              <span className="text-[10px] text-blue-500 font-mono">
                                👍 {report.upvotes?.length || 0} Upvotes
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                            {report.category}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <select
                            value={report.priority}
                            onChange={(e) => handlePriorityChange(report._id, e.target.value as IssuePriority)}
                            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold cursor-pointer"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </td>

                        <td className="p-3.5">
                          <select
                            value={report.status}
                            onChange={(e) => handleStatusChange(report._id, e.target.value as IssueStatus)}
                            className={`p-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                              report.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : report.status === 'In Progress'
                                ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300'
                                : report.status === 'Under Review'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}
                          >
                            <option value="Reported">Reported</option>
                            <option value="Under Review">Under Review</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={report.reportedBy?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${report.reportedBy?.name}`}
                              alt={report.reportedBy?.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                              {report.reportedBy?.name || 'Citizen'}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingReport(report);
                              setEditStatus(report.status);
                              setOfficialNote(report.officialResponse || '');
                            }}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
                            title="Add official dispatch note"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/reports/${report._id}`}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors inline-block"
                            title="View public details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteReport(report._id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                            title="Delete report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CITIZEN DIRECTORY */}
        {activeTab === 'users' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 flex items-center gap-2.5">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <span className="font-bold text-slate-900 dark:text-slate-100">{u.name}</span>
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {u.role === 'admin' ? '🛡️ Administrator' : '👤 Citizen'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: OFFICIAL DISPATCH NOTE */}
        {editingReport && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Add Municipal Response: #{editingReport._id.slice(-6)}
                </h3>
                <button
                  onClick={() => setEditingReport(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Update Dispatch Status:
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as IssueStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="Reported">Reported</option>
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Public Note / Work Order Update:
                  </label>
                  <textarea
                    value={officialNote}
                    onChange={(e) => setOfficialNote(e.target.value)}
                    rows={4}
                    placeholder="e.g. City Public Works Crew #7 dispatched with asphalt compactor. Issue repaired on Aug 29."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingReport(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md"
                  >
                    {isUpdating ? 'Saving...' : 'Save & Publish Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
