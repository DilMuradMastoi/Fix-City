import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { IssueCategory, IssuePriority, AIAssessmentResponse } from '../types';
import { LocationPicker } from '../components/LocationPicker';
import {
  Camera,
  Sparkles,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  Flame,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const CATEGORIES: IssueCategory[] = [
  'Garbage',
  'Road Damage',
  'Street Light',
  'Water Leakage',
  'Infrastructure',
  'Environment',
  'Traffic',
  'Safety',
  'Other',
];

const PRIORITIES: { value: IssuePriority; label: string; color: string; desc: string }[] = [
  { value: 'Low', label: 'Low', color: 'border-slate-300 text-slate-700 dark:text-slate-300', desc: 'Cosmetic or minor issue' },
  { value: 'Medium', label: 'Medium', color: 'border-amber-400 text-amber-700 dark:text-amber-300', desc: 'Noticeable civic inconvenience' },
  { value: 'High', label: 'High', color: 'border-orange-500 text-orange-700 dark:text-orange-300', desc: 'Traffic obstruction / damage risk' },
  { value: 'Critical', label: 'Critical', color: 'border-rose-500 text-rose-700 dark:text-rose-300', desc: 'Immediate safety hazard / danger' },
];

const SAMPLE_DEMO_IMAGES = [
  {
    name: 'Road Pothole',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    hint: 'Severe asphalt crater in roadway',
  },
  {
    name: 'Waste / Garbage',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    hint: 'Overflowing municipal refuse dumpster',
  },
  {
    name: 'Broken Streetlamp',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    hint: 'Shattered street light bulb casing',
  },
  {
    name: 'Water Pipe Burst',
    url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
    hint: 'High pressure municipal water main geyser',
  },
];

export const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Road Damage');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [userHint, setUserHint] = useState<string>('');
  const [location, setLocation] = useState({
    address: '450 Mission Street, Civic District',
    latitude: 37.7897,
    longitude: -122.4012,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAssessmentResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setImagePreview(result);
      // Auto trigger AI analysis for supreme UX
      runAiClassification(result);
    };
    reader.readAsDataURL(file);
  };

  // Convert Sample URL to Base64 for Analysis
  const handleSelectSampleImage = async (sample: typeof SAMPLE_DEMO_IMAGES[0]) => {
    setImagePreview(sample.url);
    setUserHint(sample.hint);
    toast.success(`Loaded sample: ${sample.name}`);

    try {
      setIsAnalyzing(true);
      // Fetch and convert sample image to base64
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setImageBase64(base64data);
        runAiClassification(base64data, sample.hint);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setIsAnalyzing(false);
      runAiClassification('', sample.hint);
    }
  };

  // Run AI Analysis Engine
  const runAiClassification = async (base64Img: string, hintOverride?: string) => {
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const response = await api.post('/ai/analyze-issue', {
        imageBase64: base64Img || imageBase64,
        userHint: hintOverride || userHint,
        locationAddress: location.address,
      });

      if (response.data.success && response.data.data) {
        const aiData: AIAssessmentResponse = response.data.data;
        setAiResult(aiData);

        // Auto-populate form
        setCategory(aiData.category);
        setPriority(aiData.priority);
        if (!title || title.trim() === '') {
          setTitle(aiData.suggestedTitle);
        }
        if (!description || description.trim() === '') {
          setDescription(aiData.suggestedDescription);
        }

        toast.success('✨ AI Vision analyzed and classified the issue!', {
          duration: 4000,
        });
      }
    } catch (err: any) {
      console.warn('AI analysis error:', err);
      toast('AI analysis used heuristic classifier', { icon: '⚡' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title for the issue.');
      return;
    }
    if (!description.trim()) {
      toast.error('Please provide a description of what is happening.');
      return;
    }
    if (!location.address.trim()) {
      toast.error('Please specify the issue location.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reportPayload = {
        title,
        description,
        category,
        priority,
        image:
          imagePreview ||
          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        imageBase64: imageBase64 || undefined,
        location,
      };

      const res = await api.post('/reports', reportPayload);

      if (res.data.success && res.data.data) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success('🎉 Report submitted successfully to City Dispatch!');
        navigate(`/reports/${res.data.data._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Civic Reporting</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
            Report a City Problem
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Upload a photo to let FixMyCity AI automatically detect the category, assess risk priority, and route the
            work order to municipal crews.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: PHOTO & AI SCANNING CONTAINER */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Issue Photo & AI Vision Detection</span>
              </h2>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => runAiClassification(imageBase64)}
                  disabled={isAnalyzing}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>Re-scan with AI</span>
                </button>
              )}
            </div>

            {/* Upload Area / Image Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-7">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!imagePreview ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/50 flex flex-col items-center justify-center min-h-[220px] group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Click to upload or drag & drop photo
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      PNG, JPG, WEBP or camera capture (Max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 group">
                    <img
                      src={imagePreview}
                      alt="Selected issue"
                      className="w-full h-64 object-cover"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
                        <div className="relative">
                          <Sparkles className="w-10 h-10 text-cyan-400 animate-spin" />
                        </div>
                        <p className="text-xs font-bold font-mono text-cyan-300 tracking-wider">
                          AI SCANNING INFRASTRUCTURE HAZARD...
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageBase64('');
                        setAiResult(null);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Sample Images & AI Status Sidebar */}
              <div className="md:col-span-5 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Quick Sample Photos (Demo)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_DEMO_IMAGES.map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => handleSelectSampleImage(sample)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left hover:border-blue-500 dark:hover:border-blue-400 transition-all text-xs cursor-pointer flex items-center gap-2 group"
                      >
                        <img src={sample.url} alt={sample.name} className="w-8 h-8 rounded-lg object-cover" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-500">
                          {sample.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Insights Display Box */}
                {aiResult && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 border border-blue-200 dark:border-blue-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI Diagnosis Result
                      </span>
                      <span className="text-[11px] font-mono bg-blue-100 dark:bg-blue-900/80 px-2 py-0.5 rounded-md">
                        {Math.round(aiResult.confidenceScore * 100)}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                      "{aiResult.severityReasoning}"
                    </p>
                    {aiResult.tags && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {aiResult.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: ISSUE METADATA & LOCATION */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Issue Details & Classification</span>
            </h2>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Issue Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hazardous 8-inch asphalt pothole on right lane"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Priority Rating <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        priority === p.value
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the problem, hazard risk, nearby landmarks, and how long this issue has persisted..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Location Picker with GPS detection */}
            <LocationPicker location={location} onChange={setLocation} />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Ticket to City...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Municipal Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
