import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Report } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { MapPin, ThumbsUp, Calendar, ArrowUpRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface ReportCardProps {
  report: Report;
  onUpvoteChange?: (updatedReport: Report) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onUpvoteChange }) => {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState<string[]>(report.upvotes || []);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const hasUpvoted = user ? upvotes.includes(user._id) : false;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to upvote issues!');
      return;
    }

    if (isUpvoting) return;
    setIsUpvoting(true);

    // Optimistic UI update
    const prevUpvotes = [...upvotes];
    const newUpvotes = hasUpvoted ? upvotes.filter((id) => id !== user._id) : [...upvotes, user._id];
    setUpvotes(newUpvotes);

    if (!hasUpvoted) {
      // Fire subtle celebratory burst
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#3B82F6', '#8B5CF6', '#10B981'],
      });
    }

    try {
      const response = await api.put(`/reports/${report._id}/upvote`);
      if (response.data.success && response.data.data) {
        setUpvotes(response.data.data.upvotes || []);
        if (onUpvoteChange) {
          onUpvoteChange(response.data.data);
        }
      }
    } catch (err: any) {
      // Revert optimistic update
      setUpvotes(prevUpvotes);
      toast.error(err.response?.data?.message || 'Failed to toggle upvote');
    } finally {
      setIsUpvoting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Road Damage':
        return 'bg-amber-500/90 text-white';
      case 'Garbage':
        return 'bg-emerald-600/90 text-white';
      case 'Water Leakage':
        return 'bg-cyan-600/90 text-white';
      case 'Street Light':
        return 'bg-yellow-500/90 text-slate-900 font-bold';
      case 'Traffic':
        return 'bg-red-500/90 text-white';
      case 'Safety':
        return 'bg-rose-600/90 text-white';
      case 'Environment':
        return 'bg-teal-600/90 text-white';
      default:
        return 'bg-blue-600/90 text-white';
    }
  };

  return (
    <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Top Image & Overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={report.image}
          alt={report.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium shadow-md backdrop-blur-xs ${getCategoryColor(report.category)}`}>
            {report.category}
          </span>
        </div>

        {/* Priority Badge */}
        <div className="absolute top-3 right-3">
          <PriorityBadge priority={report.priority} size="sm" />
        </div>

        {/* Status Badge Overlaid on bottom left of image */}
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={report.status} size="sm" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/reports/${report._id}`} className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 line-clamp-1 flex items-center justify-between gap-1">
              <span>{report.title}</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 shrink-0" />
            </h3>
          </Link>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {report.description}
          </p>
        </div>

        {/* Details & Location */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{report.location.address}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {report.reportedBy?.avatar ? (
                <img
                  src={report.reportedBy.avatar}
                  alt={report.reportedBy.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-slate-500" />
                </div>
              )}
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                {report.reportedBy?.name || 'Citizen'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(report.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={handleUpvote}
            disabled={isUpvoting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              hasUpvoted
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title={hasUpvoted ? 'Remove upvote' : 'Upvote this issue to raise municipal priority'}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-white' : ''}`} />
            <span>{upvotes.length}</span>
            <span className="hidden sm:inline font-normal text-[11px] opacity-80">
              {upvotes.length === 1 ? 'Vote' : 'Votes'}
            </span>
          </button>

          <Link
            to={`/reports/${report._id}`}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 py-1.5 px-2"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
