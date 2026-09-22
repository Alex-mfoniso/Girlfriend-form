import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Heart,
  Copy,
  Check,
  Share2,
  ArrowRight,
  Sparkles,
  FileText,
} from 'lucide-react';
import type { GirlfriendApplication } from '../types/application';
import { calculateCompatibilityScore } from '../utils/compatibility';

interface SubmissionSuccessProps {
  application: GirlfriendApplication;
  onReset: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  application,
  onReset,
}) => {
  const [processingStage, setProcessingStage] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Animated processing sequence steps as mandated by prompt
  const processingSteps = [
    'Personal information verified',
    'Compatibility profile generated',
    'Personality assessment completed',
    'Vibe check initiated',
    'Application forwarded to Alexander',
  ];

  useEffect(() => {
    // Sequentially advance the processing screen steps
    const interval = setInterval(() => {
      setProcessingStage((prev) => {
        if (prev < processingSteps.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 650);

    return () => clearInterval(interval);
  }, []);

  const isCompleted = processingStage >= processingSteps.length;
  const compatibility = calculateCompatibilityScore({
    fullName: application.fullName,
    preferredName: application.preferredName,
    age: application.age,
    location: application.location,
    personality: application.personality,
    communicationStyle: application.communicationStyle,
    loveLanguage: application.loveLanguage,
    personalityTraits: application.personalityTraits,
    noReplyReaction: '',
    disagreementStyle: application.disagreementStyle,
    communicationFrequency: application.communicationFrequency,
    idealDate: application.idealDate,
    jealousyLevel: application.jealousyLevel,
    whySelected: application.whySelected,
    relationshipValue: application.relationshipValue,
    somethingToKnow: application.somethingToKnow,
    greenFlag: application.greenFlag,
    redFlag: application.redFlag,
  });

  const copyId = () => {
    navigator.clipboard.writeText(application.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="application-receipt max-w-2xl mx-auto py-8 px-4 sm:px-6">
      {!isCompleted ? (
        // Animated Processing Screen
        <motion.div
          key="processing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="receipt-processing rounded-3xl glass-card border border-white/10 p-8 sm:p-10 shadow-2xl text-center space-y-8"
        >
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rose-500 animate-spin" />
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Reviewing application...</h3>
            <p className="text-sm text-slate-400">
              Please hold while Alexander's Automated Vibe Assessment Engine indexes your submission.
            </p>
          </div>

          <div className="space-y-3.5 text-left max-w-md mx-auto pt-2">
            {processingSteps.map((step, idx) => {
              const done = processingStage > idx;
              const current = processingStage === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                    done
                      ? 'text-emerald-300 font-medium'
                      : current
                      ? 'text-rose-300 font-semibold scale-[1.02]'
                      : 'text-slate-600 opacity-40'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs transition-colors ${
                      done
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : current
                        ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                        : 'bg-white/5 text-slate-600'
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        // Final Application Received Card
        <motion.div
          key="received"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="receipt-confirmation rounded-3xl glass-card border border-white/10 p-7 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden"
        >
          {/* Subtle decorative banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400" />

          {/* Header */}
          <div className="text-center space-y-3 pt-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              OFFICIAL RECEIPT CONFIRMED
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              APPLICATION RECEIVED
            </h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Your dossier has been securely committed to Cloud Firestore and placed in Alexander's queue for priority review.
            </p>
          </div>

          {/* Structured Key Details Box */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 divide-y divide-white/5 space-y-3 text-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="text-slate-400 font-medium">Candidate:</span>
              <span className="text-white font-bold text-base">{application.fullName}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400 font-medium">Position:</span>
              <span className="text-rose-300 font-semibold">Girlfriend (Full-time)</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400 font-medium">Application ID:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono font-bold bg-black/40 text-amber-300 px-2 py-1 rounded border border-amber-500/20">
                  {application.id}
                </code>
                <button
                  onClick={copyId}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                  title="Copy Application ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400 font-medium">Status:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                UNDER REVIEW
              </span>
            </div>
          </div>

          {/* Unscientific Compatibility Score Badge */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-purple-950/20 to-slate-900 border border-rose-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                  Totally Unscientific Compatibility Score
                </span>
                <p className="text-xs text-slate-400 mt-0.5">Purely for entertainment purposes</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-white">{application.compatibilityScore}</span>
                <span className="text-rose-400 text-sm font-bold">/100</span>
              </div>
            </div>

            {/* Score progress bar */}
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${application.compatibilityScore}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-rose-300">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Verdict: {compatibility.verdict}</span>
              </div>
              <p className="leading-relaxed text-slate-400">{compatibility.summary}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onReset}
              className="receipt-another w-full sm:w-1/2 py-3 px-4 font-semibold text-sm text-center"
            >
              Submit Another Application
            </button>

          </div>
        </motion.div>
      )}
    </div>
  );
};
