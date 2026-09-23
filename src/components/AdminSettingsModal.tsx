import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import {
  FIRESTORE_DATABASE_ID,
} from '../lib/firebase';
import { useToast } from './Toast';

interface AdminSettingsModalProps {
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyRuleSnippet = () => {
    const rules = 'request.auth.token.admin == true';
    navigator.clipboard.writeText(rules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl rounded-3xl glass-card border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-white/10 bg-[#0c1220] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Admin Portal Configuration</h3>
              <p className="text-xs text-slate-400">Access control & Firebase parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {/* Authorized Admin Claim Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">Administrator Access</span>
              <span className="text-[11px] text-slate-400">Enforced by Firestore</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Access is granted only to Firebase accounts with the server-managed <code className="text-white font-mono">admin: true</code> custom claim.
            </p>
          </div>

          {/* Firebase Environment Reference */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Connected Firestore Instance
            </span>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Database ID:</span>
                <span className="text-sky-300 font-semibold">{FIRESTORE_DATABASE_ID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Applications Collection:</span>
                <span className="text-emerald-300 font-semibold">applications</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Real-Time Sync:</span>
                <span className="text-emerald-400">Active (onSnapshot listener)</span>
              </div>
            </div>
          </div>

          {/* Security Rules Reference */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-amber-200">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Server-Side Firestore Security Rule</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-300/90">
              The project root <code className="text-white font-mono bg-black/30 px-1 py-0.5 rounded">firestore.rules</code> restricts read, update, and delete actions strictly to accounts with:
            </p>
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/50 border border-amber-500/20 font-mono text-[11px] text-amber-200">
              <span>request.auth.token.admin == true</span>
              <button
                type="button"
                onClick={copyRuleSnippet}
                className="hover:text-white flex items-center gap-1 text-[10px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#0c1220] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
