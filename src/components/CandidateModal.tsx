import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  User,
  Heart,
  Sparkles,
  Sliders,
  Calendar,
  Save,
  Trash2,
  Instagram,
  Phone,
  CheckCircle2,
  Clock,
  Flame,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import type {
  GirlfriendApplication,
  ApplicationStatus,
  ApplicationStage,
} from '../types/application';
import {
  STAGE_CONFIG,
  STATUS_CONFIG,
} from '../types/application';
import {
  updateApplicationStatusAndStage,
  deleteApplicationDoc,
} from '../services/applicationService';
import { useToast } from './Toast';

interface CandidateModalProps {
  application: GirlfriendApplication | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  application,
  onClose,
  onUpdated,
}) => {
  if (!application) return null;

  const { showToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(application.status);
  const [selectedStage, setSelectedStage] = useState<ApplicationStage>(application.currentStage);
  const [adminNotes, setAdminNotes] = useState<string>(application.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'interview' | 'assessment'>('profile');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateApplicationStatusAndStage(
        application.id,
        selectedStatus,
        selectedStage,
        adminNotes
      );
      showToast({
        title: 'Candidate Status Updated',
        message: `${application.fullName}'s dossier updated to ${STATUS_CONFIG[selectedStatus].label} (${STAGE_CONFIG[selectedStage].label})`,
        type: 'success',
      });
      onUpdated?.();
      onClose();
    } catch (err: any) {
      console.error('Update candidate failed:', err);
      showToast({
        title: 'Update Failed',
        message: err.message || 'Could not update Firestore document',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ${application.fullName}'s application?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteApplicationDoc(application.id);
      showToast({
        title: 'Application Removed',
        message: 'Dossier successfully deleted from Firestore.',
        type: 'info',
      });
      onUpdated?.();
      onClose();
    } catch (err: any) {
      console.error('Delete candidate failed:', err);
      showToast({
        title: 'Delete Failed',
        message: err.message || 'Could not delete application',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Format creation timestamp
  let formattedDate = 'Recently';
  if (application.createdAt) {
    try {
      if (typeof application.createdAt.toDate === 'function') {
        formattedDate = application.createdAt.toDate().toLocaleString();
      } else if (typeof application.createdAt === 'string') {
        formattedDate = new Date(application.createdAt).toLocaleString();
      }
    } catch {
      formattedDate = 'Recently';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl rounded-3xl glass-card border border-white/10 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Top Header */}
        <div className="p-6 border-b border-white/10 bg-[#0d1322] flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center font-bold text-white text-xl">
                {application.fullName.charAt(0)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {application.fullName}
                </h3>
                {application.preferredName && application.preferredName !== application.fullName && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                    "{application.preferredName}"
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    STATUS_CONFIG[selectedStatus].bg
                  } ${STATUS_CONFIG[selectedStatus].color} ${STATUS_CONFIG[selectedStatus].border}`}
                >
                  {STATUS_CONFIG[selectedStatus].label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {application.location} • {application.age} yrs
                </span>
                <span>•</span>
                <span className="font-mono text-slate-500">{application.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#090e18] px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile & Compatibility
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'interview'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Interview Responses
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'assessment'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Manage Status & Decision
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* TAB 1: Profile & Compatibility */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Score Highlight Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-slate-900 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                    Compatibility Score
                  </span>
                  <p className="text-xs text-slate-400">Totally Unscientific Rating</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">{application.compatibilityScore}</span>
                  <span className="text-rose-400 font-bold text-xs">/100</span>
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  Candidate Contact & Identity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-500 block">Full Name</span>
                    <span className="text-white font-medium">{application.fullName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-500 block">Preferred Name</span>
                    <span className="text-white font-medium">{application.preferredName || 'Same'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-500 block">Age & Location</span>
                    <span className="text-white font-medium">{application.age} years • {application.location}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-500 block">Social & Phone</span>
                    <div className="flex items-center gap-3 text-xs mt-0.5">
                      {application.instagram ? (
                        <a
                          href={`https://instagram.com/${application.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-pink-400 hover:underline flex items-center gap-1"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          @{application.instagram.replace('@', '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">No Instagram provided</span>
                      )}
                      {application.phone && (
                        <span className="text-slate-300 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {application.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personality Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  Personality Architecture
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-500 block">Personality Archetype</span>
                    <span className="text-white font-medium">{application.personality}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-500 block">Love Language</span>
                    <span className="text-white font-medium">{application.loveLanguage}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 sm:col-span-2">
                    <span className="text-[11px] text-slate-500 block mb-1.5">Personality Traits</span>
                    <div className="flex flex-wrap gap-1.5">
                      {application.personalityTraits?.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 sm:col-span-2">
                    <span className="text-[11px] text-slate-500 block">Communication Style</span>
                    <span className="text-white font-medium">{application.communicationStyle}</span>
                  </div>
                </div>
              </div>

              {/* Compatibility Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Tactical Compatibility Responses
                </h4>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-500 block">Disagreement Resolution Style</span>
                    <span className="text-white font-medium">{application.disagreementStyle}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-500 block">Communication Frequency</span>
                    <span className="text-white font-medium">{application.communicationFrequency}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] text-slate-500 block">Ideal Date Vision</span>
                    <span className="text-white font-medium">{application.idealDate}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Jealousy Calibration</span>
                      <span className="text-rose-400 font-bold">{application.jealousyLevel} / 10</span>
                    </div>
                    <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${(application.jealousyLevel / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Interview Responses */}
          {activeTab === 'interview' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs font-bold text-rose-300">
                  "Why should you be selected for this position?"
                </span>
                <p className="text-slate-200 leading-relaxed pt-1 whitespace-pre-wrap">
                  {application.whySelected}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs font-bold text-rose-300">
                  "What do you bring into a relationship?"
                </span>
                <p className="text-slate-200 leading-relaxed pt-1 whitespace-pre-wrap">
                  {application.relationshipValue}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs font-bold text-rose-300">
                  "What's one thing Alexander should know about you?"
                </span>
                <p className="text-slate-200 leading-relaxed pt-1 whitespace-pre-wrap">
                  {application.somethingToKnow}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Biggest Green Flag
                  </span>
                  <p className="text-slate-200 leading-relaxed pt-1">
                    {application.greenFlag}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    Biggest Red Flag
                  </span>
                  <p className="text-slate-200 leading-relaxed pt-1">
                    {application.redFlag}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Manage Status & Decision */}
          {activeTab === 'assessment' && (
            <div className="space-y-6">
              {/* Status selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Requisition Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['pending', 'interview', 'selected', 'rejected'] as ApplicationStatus[]).map(
                    (st) => {
                      const cfg = STATUS_CONFIG[st];
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSelectedStatus(st)}
                          className={`p-3 rounded-xl text-center text-xs font-bold border transition-all ${
                            selectedStatus === st
                              ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-rose-500/40 shadow-sm`
                              : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Stage selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Recruitment Pipeline Stage
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(STAGE_CONFIG) as ApplicationStage[]).map((stg) => {
                    const cfg = STAGE_CONFIG[stg];
                    return (
                      <button
                        key={stg}
                        type="button"
                        onClick={() => setSelectedStage(stg)}
                        className={`p-3 rounded-xl text-left text-xs border transition-all ${
                          selectedStage === stg
                            ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold shadow-sm'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{cfg.label}</span>
                          <span className="text-[10px] font-mono text-slate-500">Stage {cfg.order}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">{cfg.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Alexander's Private Interview Notes</span>
                  <span className="text-slate-500 text-[10px]">Confidential (Admin only)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Record impressions, inside jokes, banter notes, or interview schedules..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0c1220] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Dossier</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Decision</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
