import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Search,
  Filter,
  ArrowUpDown,
  User,
  Sparkles,
  MapPin,
  Calendar,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Settings,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Briefcase,
  X,
  ExternalLink,
  Instagram,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../components/Toast';
import { subscribeToApplications } from '../services/applicationService';
import type {
  GirlfriendApplication,
  ApplicationStatus,
  ApplicationStage,
} from '../types/application';
import {
  STATUS_CONFIG,
  STAGE_CONFIG,
} from '../types/application';
import { CandidateModal } from '../components/CandidateModal';
import { AdminSettingsModal } from '../components/AdminSettingsModal';
import { DEFAULT_ADMIN_EMAIL } from '../lib/firebase';

export const AdminPage: React.FC = () => {
  const { user, loading: authLoading, isAdmin, signInWithPassword, sendAdminPasswordReset, logout } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [applications, setApplications] = useState<GirlfriendApplication[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score_high' | 'score_low'>('newest');

  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState<GirlfriendApplication | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Track initial load vs real-time new incoming applicant
  const initialLoadDone = useRef(false);
  const previousAppCount = useRef(0);

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adminPassword) return;
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await signInWithPassword(adminPassword);
      setAdminPassword('');
    } catch (error: any) {
      setLoginError(error?.message || 'Unable to sign in. Check the password and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoginError(null);
    setResetMessage(null);
    try {
      await sendAdminPasswordReset();
      setResetMessage(`Password reset email sent to ${DEFAULT_ADMIN_EMAIL}.`);
    } catch (error: any) {
      setLoginError(error?.message || 'Unable to send a password reset email.');
    }
  };

  // Real-time Firestore subscription when authenticated and authorized
  useEffect(() => {
    if (!user || !isAdmin) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    setFirestoreError(null);

    const unsubscribe = subscribeToApplications(
      (apps) => {
        // Detect new application in real-time
        if (initialLoadDone.current && apps.length > previousAppCount.current) {
          const newest = apps[0];
          showToast({
            title: 'New application received',
            message: `${newest.preferredName || newest.fullName} just applied for the position.`,
            type: 'applicant',
            duration: 6000,
          });
        }
        initialLoadDone.current = true;
        previousAppCount.current = apps.length;

        setApplications(apps);
        setLoadingData(false);
      },
      (err) => {
        console.error('Failed to stream applications:', err);
        setFirestoreError(
          err.message?.includes('permission')
            ? 'Permission Denied: Your account is authenticated, but Firestore security rules require authorization for reading candidate applications.'
            : 'Unable to sync with Firestore database. Please verify network connection.'
        );
        setLoadingData(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Name search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = app.fullName.toLowerCase().includes(q) || app.preferredName?.toLowerCase().includes(q);
          const matchLoc = app.location.toLowerCase().includes(q);
          const matchId = app.id.toLowerCase().includes(q);
          if (!matchName && !matchLoc && !matchId) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && app.status !== statusFilter) {
          return false;
        }

        // Stage filter
        if (stageFilter !== 'all' && app.currentStage !== stageFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score_high') {
          return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
        }
        if (sortBy === 'score_low') {
          return (a.compatibilityScore || 0) - (b.compatibilityScore || 0);
        }
        if (sortBy === 'oldest') {
          const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
          const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
        }
        // Default: newest
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [applications, searchQuery, statusFilter, stageFilter, sortBy]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    const interview = applications.filter((a) => a.status === 'interview').length;
    const selected = applications.filter((a) => a.status === 'selected').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const avgScore =
      total > 0
        ? Math.round(applications.reduce((sum, a) => sum + (a.compatibilityScore || 0), 0) / total)
        : 0;

    return { total, pending, interview, selected, rejected, avgScore };
  }, [applications]);

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
        <p className="text-sm text-slate-400">Verifying administrator credentials...</p>
      </div>
    );
  }

  // 2. Unauthenticated Login Screen
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl glass-card border border-white/10 p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-pink-500" />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Alexander's Admin Portal
            </h2>
            <p className="text-sm text-slate-400">"Authorized personnel only."</p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            This dashboard contains sensitive candidate dossiers and relationship recruitment metrics. Password access is restricted to the configured administrator.
          </p>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between">
              <span>{loginError}</span>
              <button onClick={() => setLoginError(null)} className="text-rose-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {resetMessage && <p className="text-xs text-emerald-300">{resetMessage}</p>}

          <form onSubmit={handlePasswordLogin} className="pt-2 space-y-3">
            <label className="block text-left text-xs font-medium text-slate-300" htmlFor="admin-password">Admin password</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full rounded-xl glass-input px-4 py-3 text-sm" placeholder="Enter password" required />
            <button type="submit" disabled={isLoggingIn} className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 disabled:opacity-60 transition-all">
              {isLoggingIn ? 'Signing in…' : 'Continue'}
            </button>
            <button type="button" onClick={handlePasswordReset} className="w-full text-xs text-rose-300 hover:text-white transition-colors">
              Forgot password? Send a reset email
            </button>

            <button
              type="button"
              onClick={() => navigate('home')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Return to public candidate application
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 3. Authenticated but Unauthorized (Access Denied) Screen
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg rounded-3xl glass-card border border-rose-500/20 p-8 sm:p-10 shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Access Denied</h2>
            <p className="text-sm text-slate-400">
              This account is not authorized to access Alexander's Candidate Management System.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs text-left">
            <div className="flex justify-between text-slate-400">
              <span>Signed in as:</span>
              <strong className="text-white">{user.email}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Configured Admin Email:</span>
              <strong className="text-rose-400">{DEFAULT_ADMIN_EMAIL}</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 text-left leading-relaxed">
            Candidate dossiers and recruitment evaluations are protected by Firestore security rules. Unauthorized accounts cannot view or manipulate applicant data.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={logout}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>

            <button
              onClick={() => navigate('home')}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 transition-colors"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 4. Authorized Admin Candidate Management System
  return (
    <div className="min-h-screen pb-20">
      {/* Top Header Bar */}
      <div className="border-b border-white/10 bg-[#090d16]/90 backdrop-blur-xl sticky top-18 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Girlfriend Applications
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Real-time Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">Candidate Management System</p>
            </div>
          </div>

          {/* Admin User controls */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Admin Portal Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <User className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-300 truncate max-w-[140px]">{user.email}</span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Firestore error banner */}
        {firestoreError && (
          <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{firestoreError}</span>
          </div>
        )}

        {/* Dashboard Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Total */}
          <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Applications
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">{metrics.total}</div>
            <span className="text-[10px] text-slate-500">All submissions in database</span>
          </div>

          {/* Pending */}
          <div className="p-4 sm:p-5 rounded-2xl glass-card border border-amber-500/20 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Pending
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">{metrics.pending}</div>
            <span className="text-[10px] text-amber-400/70">Awaiting initial review</span>
          </div>

          {/* Interview */}
          <div className="p-4 sm:p-5 rounded-2xl glass-card border border-indigo-500/20 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Interview
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-300">{metrics.interview}</div>
            <span className="text-[10px] text-indigo-400/70">Invited to meet</span>
          </div>

          {/* Selected */}
          <div className="p-4 sm:p-5 rounded-2xl glass-card border border-emerald-500/20 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Selected
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">{metrics.selected}</div>
            <span className="text-[10px] text-emerald-400/70">Girlfriend offer extended</span>
          </div>

          {/* Rejected */}
          <div className="p-4 sm:p-5 rounded-2xl glass-card border border-rose-500/20 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              Rejected
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-300">{metrics.rejected}</div>
            <span className="text-[10px] text-rose-400/70">Referred to friendship</span>
          </div>
        </div>

        {/* Search, Filters, and Sort Controls */}
        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates by name, location, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter by Status */}
            <div className="sm:col-span-2.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl glass-input text-xs font-medium cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Statuses</option>
                <option value="pending" className="bg-slate-900">Pending</option>
                <option value="interview" className="bg-slate-900">Interview</option>
                <option value="selected" className="bg-slate-900">Selected</option>
                <option value="rejected" className="bg-slate-900">Rejected</option>
              </select>
            </div>

            {/* Filter by Stage */}
            <div className="sm:col-span-2.5">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl glass-input text-xs font-medium cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Stages</option>
                {Object.entries(STAGE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k} className="bg-slate-900">
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div className="sm:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-2.5 px-3 rounded-xl glass-input text-xs font-medium cursor-pointer"
              >
                <option value="newest" className="bg-slate-900">Newest First</option>
                <option value="oldest" className="bg-slate-900">Oldest First</option>
                <option value="score_high" className="bg-slate-900">Score: High → Low</option>
                <option value="score_low" className="bg-slate-900">Score: Low → High</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Showing <strong className="text-white">{filteredApplications.length}</strong> of{' '}
              <strong className="text-white">{applications.length}</strong> candidates
            </span>
            {(searchQuery || statusFilter !== 'all' || stageFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setStageFilter('all');
                }}
                className="text-rose-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Loading skeleton or empty state */}
        {loadingData ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Streaming applicant collection from Firestore...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 rounded-3xl glass-card border border-white/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No candidates found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {applications.length === 0
                  ? 'No applications have been submitted yet. Share the portal link to start collecting dossiers.'
                  : 'No applications match your active search and filter criteria.'}
              </p>
            </div>
            {applications.length === 0 && (
              <button
                onClick={() => navigate('home')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors inline-block"
              >
                Go to Public Application Form
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-2xl glass-card border border-white/10 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0c1220] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-3">Age</th>
                    <th className="py-3.5 px-3">Location</th>
                    <th className="py-3.5 px-3">Compatibility</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Stage</th>
                    <th className="py-3.5 px-3">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredApplications.map((app) => {
                    const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                    const stageCfg = STAGE_CONFIG[app.currentStage] || STAGE_CONFIG.application_submitted;

                    let submittedDate = 'Recently';
                    if (app.createdAt) {
                      try {
                        if (typeof app.createdAt.toDate === 'function') {
                          submittedDate = app.createdAt.toDate().toLocaleDateString();
                        } else if (typeof app.createdAt === 'string') {
                          submittedDate = new Date(app.createdAt).toLocaleDateString();
                        }
                      } catch {
                        submittedDate = 'Recently';
                      }
                    }

                    return (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedCandidate(app)}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        {/* Candidate */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                              {app.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-rose-300 transition-colors">
                                {app.fullName}
                              </div>
                              {app.preferredName && app.preferredName !== app.fullName && (
                                <span className="text-[10px] text-slate-400">"{app.preferredName}"</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Age */}
                        <td className="py-3.5 px-3 text-slate-300 font-medium">
                          {app.age} yrs
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-3 text-slate-300 truncate max-w-[120px]">
                          {app.location}
                        </td>

                        {/* Compatibility */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{app.compatibilityScore}%</span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400"
                                style={{ width: `${app.compatibilityScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Stage */}
                        <td className="py-3.5 px-3 text-slate-300">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                            {stageCfg.label}
                          </span>
                        </td>

                        {/* Submitted */}
                        <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                          {submittedDate}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCandidate(app);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-200 text-slate-300 text-xs font-semibold border border-white/10 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Responsive Cards View */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredApplications.map((app) => {
                const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                const stageCfg = STAGE_CONFIG[app.currentStage] || STAGE_CONFIG.application_submitted;

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedCandidate(app)}
                    className="p-5 rounded-2xl glass-card border border-white/10 hover:border-rose-500/30 transition-all space-y-4 cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                          {app.fullName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{app.fullName}</h3>
                          <p className="text-[11px] text-slate-400">
                            {app.age} yrs • {app.location}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-slate-500 block">Compatibility</span>
                        <strong className="text-rose-300 font-bold">{app.compatibilityScore}%</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-slate-500 block">Stage</span>
                        <span className="text-slate-300 font-medium truncate block">{stageCfg.label}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs border-t border-white/5">
                      <span className="font-mono text-[10px] text-slate-500">{app.id}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(app);
                        }}
                        className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                      >
                        <span>Open Dossier</span>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Candidate Dossier Detail Modal */}
      {selectedCandidate && (
        <CandidateModal
          application={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdated={() => {
            // Updated snapshot will arrive automatically via Firestore real-time listener
          }}
        />
      )}

      {/* Admin Settings Modal */}
      {settingsModalOpen && (
        <AdminSettingsModal onClose={() => setSettingsModalOpen(false)} />
      )}
    </div>
  );
};
