import React, { useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { RequirementsSection } from '../components/RequirementsSection';
import { ApplicationForm } from '../components/ApplicationForm';
import { SubmissionSuccess } from '../components/SubmissionSuccess';
import { useNavigation } from '../context/NavigationContext';
import type { GirlfriendApplication } from '../types/application';
import { Heart, ShieldCheck, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [submittedApplication, setSubmittedApplication] = useState<GirlfriendApplication | null>(null);

  const handleApplyClick = () => {
    const el = document.getElementById('application-form');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRequirementsClick = () => {
    const el = document.getElementById('requirements');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <HeroSection
        onApplyClick={handleApplyClick}
        onRequirementsClick={handleRequirementsClick}
      />

      {/* Requirements & Specifications */}
      <RequirementsSection />

      {/* Application Form or Processing / Success Screen */}
      <div id="application-container" className="pt-6">
        {submittedApplication ? (
          <SubmissionSuccess
            application={submittedApplication}
            onReset={() => setSubmittedApplication(null)}
            onGoToAdmin={() => navigate('admin')}
          />
        ) : (
          <ApplicationForm
            onSubmitted={(app) => {
              setSubmittedApplication(app);
              document.getElementById('application-container')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="editorial-footer border-t border-[#d5cec0] px-5 py-8 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4 fill-rose-500/30" />
            </div>
            <div>
              <p className="font-bold text-white">Girlfriend Applications</p>
              <p className="text-[11px] text-slate-500">Alexander's Personal Affairs Bureau © {new Date().getFullYear()}</p>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="text-slate-400">
              All applications safely stored in Google Cloud Firestore.
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-3 text-[11px]">
              <button
                onClick={() => navigate('admin')}
                className="text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Alexander's Admin Login</span>
              </button>
              <span>•</span>
              <span className="text-slate-500">Strict Non-Ghosting Protocol</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
