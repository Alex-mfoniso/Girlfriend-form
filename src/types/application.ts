export type ApplicationStatus = 'pending' | 'interview' | 'selected' | 'rejected';

export type ApplicationStage =
  | 'application_submitted'
  | 'initial_screening'
  | 'compatibility_assessment'
  | 'vibe_check'
  | 'final_interview'
  | 'decision';

export interface ApplicationFormData {
  // Step 1: Personal
  fullName: string;
  preferredName: string;
  age: number | string;
  location: string;
  email: string;
  instagram?: string;

  // Step 2: Personality
  personality: string;
  communicationStyle: string;
  loveLanguage: string;
  personalityTraits: string[];

  // Step 3: Compatibility
  noReplyReaction: string; // "Alexander hasn't replied for 3 hours. What do you do?"
  disagreementStyle: string; // "How do you handle disagreements?"
  communicationFrequency: string; // "How often do you like talking to your partner?"
  idealDate: string; // "What's your ideal date?"
  jealousyLevel: number; // 1-10 slider

  // Step 4: Final Interview
  whySelected: string; // "Why should you be selected for this position?"
  relationshipValue: string; // "What do you bring into a relationship?"
  somethingToKnow: string; // "What's one thing Alexander should know about you?"
  greenFlag: string; // "What's your biggest green flag?"
  redFlag: string; // "What's your biggest red flag?"
}

export interface GirlfriendApplication {
  id: string;
  fullName: string;
  preferredName: string;
  age: number;
  location: string;
  email: string;
  uid: string;
  instagram?: string;
  personality: string;
  communicationStyle: string;
  loveLanguage: string;
  personalityTraits: string[];
  disagreementStyle: string;
  communicationFrequency: string;
  idealDate: string;
  jealousyLevel: number;
  whySelected: string;
  relationshipValue: string;
  somethingToKnow: string;
  greenFlag: string;
  redFlag: string;
  compatibilityScore: number;
  status: ApplicationStatus;
  currentStage: ApplicationStage;
  adminNotes?: string;
  adminMessage?: string;
  createdAt: any;
  updatedAt: any;
}

export const STAGE_CONFIG: Record<ApplicationStage, { label: string; order: number; description: string }> = {
  application_submitted: {
    label: 'Application Submitted',
    order: 1,
    description: 'Received in database. Awaiting initial triage by Alexander.',
  },
  initial_screening: {
    label: 'Initial Screening',
    order: 2,
    description: 'Reviewing banter credentials, Instagram aesthetic, and humor tolerance.',
  },
  compatibility_assessment: {
    label: 'Compatibility Assessment',
    order: 3,
    description: 'Analyzing reaction to unanswered texts and food sharing policy.',
  },
  vibe_check: {
    label: 'Vibe Check',
    order: 4,
    description: 'Assessing conversational synergy, music taste, and spontaneous laughter quotient.',
  },
  final_interview: {
    label: 'Final Interview',
    order: 5,
    description: 'Informal coffee/cocktail meeting with management (Alexander).',
  },
  decision: {
    label: 'Decision',
    order: 6,
    description: 'Formal contract offering or constructive referral to friendship.',
  },
};

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; border: string }> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  interview: {
    label: 'Interview',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  selected: {
    label: 'Selected',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
};
