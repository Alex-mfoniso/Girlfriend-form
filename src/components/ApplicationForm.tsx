import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Sparkles,
  Heart,
  Sliders,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Send,
  AlertCircle,
  HelpCircle,
  Instagram,
  Phone,
  Smile,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import type { ApplicationFormData, GirlfriendApplication } from '../types/application';
import { calculateCompatibilityScore } from '../utils/compatibility';
import { submitApplication } from '../services/applicationService';
import { useToast } from './Toast';

interface ApplicationFormProps {
  onSubmitted: (application: GirlfriendApplication) => void;
}

const TRAIT_OPTIONS = [
  'Sarcastic & Witty',
  'Empathetic Listener',
  'Spontaneous Adventurer',
  'Foodie & Snack Enthusiast',
  'Unconditionally Loyal',
  'Low Drama Mindset',
  'Night Owl & Deep Thinker',
  'Competitive at Games',
  'Music & Playlist Curator',
  'Patient with Nerds',
  'Passenger Princess Energy',
  'Independent & Ambitious',
];

const PERSONALITY_TYPES = [
  'Introvert with Extrovert Subscription',
  'Golden Retriever Warmth & Enthusiasm',
  'Calm Observer with Dark Banter',
  'Ambivert Diplomat & Social Chameleon',
  'Chaotic Good Energizer',
  'Analytical Perfectionist with Soft Heart',
];

const LOVE_LANGUAGES = [
  'Quality Time',
  'Words of Affirmation',
  'Physical Touch',
  'Acts of Service',
  'Receiving Thoughtful Gifts',
];

const NO_REPLY_REACTIONS = [
  'Assume he is deep in code or debugging and live my best life',
  'Send a funny or unhinged meme to check his pulse',
  'Order food and send him a photo of what he is missing',
  'Double text with a completely unrelated shower thought',
  'Call twice then immediately apologize for being dramatic',
];

const DISAGREEMENT_STYLES = [
  'Order food first, talk when fed and calm',
  'Direct conversation with calm reasoning and zero mind-games',
  'Give each other 30 minutes of space, then debrief peacefully',
  'Competitive Rock-Paper-Scissors tournament to establish dominance',
];

const COMMUNICATION_FREQUENCIES = [
  'Morning check-in, casual check-ins, and a cozy evening debrief',
  'Constant stream of consciousness, memes, and audio notes',
  'A few thoughtful exchanges during the day and a good call at night',
  'Quality over quantity: talk whenever something actually matters',
];

const IDEAL_DATES = [
  'Hidden gem dinner, craft cocktails, and an evening walk with gelato',
  'Cozy home cooked meal, board games / Mario Kart, and dessert on the couch',
  'Spontaneous road trip with windows down and an immaculate playlist',
  'Strolling through bookstores, grabbing iced lattes, and people-watching',
];

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmitted }) => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    preferredName: '',
    age: '',
    location: '',
    instagram: '',
    phone: '',
    personality: PERSONALITY_TYPES[0],
    communicationStyle: 'Direct & straightforward with high meme fluency',
    loveLanguage: LOVE_LANGUAGES[0],
    personalityTraits: ['Sarcastic & Witty', 'Foodie & Snack Enthusiast', 'Low Drama Mindset'],
    noReplyReaction: NO_REPLY_REACTIONS[0],
    disagreementStyle: DISAGREEMENT_STYLES[0],
    communicationFrequency: COMMUNICATION_FREQUENCIES[0],
    idealDate: IDEAL_DATES[0],
    jealousyLevel: 3,
    whySelected: '',
    relationshipValue: '',
    somethingToKnow: '',
    greenFlag: '',
    redFlag: '',
  });

  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  // Jealousy slider witty descriptions
  const getJealousyDescription = (val: number) => {
    if (val <= 2) return 'Zen Master: "You have female friends? Cool, tell them I said hi."';
    if (val <= 4) return 'Healthy Calm: "If someone flirts, it is just validation of my impeccable taste."';
    if (val <= 6) return 'Standard Guardian: "A slight raised eyebrow if boundaries get blurred."';
    if (val <= 8) return 'Elevated Radar: "I will casually remember that girl\'s name for the next 7 years."';
    return 'Full FBI Agent: "Who is that female breathing within a 50-meter radius of you?"';
  };

  const updateField = (field: keyof ApplicationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const toggleTrait = (trait: string) => {
    const current = formData.personalityTraits || [];
    if (current.includes(trait)) {
      updateField('personalityTraits', current.filter((t) => t !== trait));
    } else {
      if (current.length >= 5) {
        showToast({
          title: 'Maximum Traits Reached',
          message: 'Please select up to 5 core traits for optimal bandwidth balance.',
          type: 'info',
        });
        return;
      }
      updateField('personalityTraits', [...current, trait]);
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
      const ageNum = Number(formData.age);
      if (!formData.age || isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
        errors.age = 'Must be an adult age (18+)';
      }
      if (!formData.location.trim()) errors.location = 'Location is required';
    } else if (step === 2) {
      if (!formData.personality) errors.personality = 'Please select your personality profile';
      if (!formData.loveLanguage) errors.loveLanguage = 'Please select a primary love language';
      if (!formData.personalityTraits || formData.personalityTraits.length === 0) {
        errors.personalityTraits = 'Select at least one personality trait';
      }
    } else if (step === 3) {
      if (!formData.noReplyReaction) errors.noReplyReaction = 'Please select your 3-hour reply policy';
      if (!formData.disagreementStyle) errors.disagreementStyle = 'Please specify disagreement handling';
      if (!formData.idealDate) errors.idealDate = 'Please select your ideal date';
    } else if (step === 4) {
      if (!formData.whySelected.trim() || formData.whySelected.trim().length < 10) {
        errors.whySelected = 'Please provide at least a brief explanation (10+ characters)';
      }
      if (!formData.relationshipValue.trim()) {
        errors.relationshipValue = 'Please share what you bring to the partnership';
      }
      if (!formData.somethingToKnow.trim()) {
        errors.somethingToKnow = 'Please share one crucial detail Alexander should know';
      }
      if (!formData.greenFlag.trim()) errors.greenFlag = 'State your biggest green flag';
      if (!formData.redFlag.trim()) errors.redFlag = 'State your biggest red flag';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
      // Scroll to top of form smoothly
      document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast({
        title: 'Form Validation Error',
        message: 'Please complete all required fields highlighted in red.',
        type: 'error',
      });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      showToast({
        title: 'Agreement Required',
        message: 'Please check the candidate declaration box before submitting.',
        type: 'error',
      });
      return;
    }

    // Comprehensive validation across all previous steps
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        showToast({
          title: `Incomplete Step 0${s}`,
          message: 'Please fix the required fields before final transmission.',
          type: 'error',
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const compatibility = calculateCompatibilityScore(formData);
      const { application } = await submitApplication(formData, compatibility.score);
      showToast({
        title: 'Application Dispatched',
        message: `Transmission successful. Application ID: ${application.id}`,
        type: 'success',
      });
      onSubmitted(application);
    } catch (err: any) {
      console.error('Submission failed:', err);
      showToast({
        title: 'Submission Failed',
        message: err.message || 'Could not commit application to Firestore. Please retry.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Personal', icon: User },
    { num: 2, title: 'Personality', icon: Sparkles },
    { num: 3, title: 'Compatibility', icon: Sliders },
    { num: 4, title: 'Final Interview', icon: Heart },
    { num: 5, title: 'Review', icon: FileCheck2 },
  ];

  const currentCompatibility = calculateCompatibilityScore(formData);

  return (
    <section id="application-form" className="editorial-application py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Form Container Card */}
      <div className="application-sheet rounded-3xl glass-card border border-white/10 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle top glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400" />

        {/* Section Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-300">
            OFFICIAL RECRUITMENT APPLICATION
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Girlfriend Candidate Submission
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Please answer with candid honesty. All submissions are encrypted and reviewed by Alexander.
          </p>
        </div>

        {/* Multi-step progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            {/* Background connecting bar */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-white/10 z-0" />
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
            />

            {stepsList.map((step) => {
              const Icon = step.icon;
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <button
                  type="button"
                  key={step.num}
                  onClick={() => {
                    if (step.num < currentStep) setCurrentStep(step.num);
                  }}
                  disabled={step.num > currentStep}
                  className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isPassed
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : isCurrent
                        ? 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white ring-4 ring-rose-500/20 shadow-lg scale-110'
                        : 'bg-[#101726] border border-white/10 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-2 hidden sm:block ${
                      isCurrent
                        ? 'text-rose-300 font-bold'
                        : isPassed
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Steps Content via Motion */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* STEP 1: PERSONAL INFORMATION */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="personality-step space-y-6"
              >
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-rose-400 font-mono text-sm">01.</span>
                    Personal Identification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Basic candidate credentials and contact routing information.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Full Name *</span>
                      {formErrors.fullName && (
                        <span className="text-rose-400 text-[11px]">{formErrors.fullName}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                        formErrors.fullName ? 'border-rose-500' : ''
                      }`}
                    />
                  </div>

                  {/* Preferred Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Preferred / Nickname
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SJ"
                      value={formData.preferredName}
                      onChange={(e) => updateField('preferredName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Age *</span>
                      {formErrors.age && (
                        <span className="text-rose-400 text-[11px]">{formErrors.age}</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="99"
                      placeholder="e.g. 24"
                      value={formData.age}
                      onChange={(e) => updateField('age', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                        formErrors.age ? 'border-rose-500' : ''
                      }`}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Current Location / City *</span>
                      {formErrors.location && (
                        <span className="text-rose-400 text-[11px]">{formErrors.location}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. London / New York / Anywhere cozy"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                        formErrors.location ? 'border-rose-500' : ''
                      }`}
                    />
                  </div>

                  {/* Instagram Username (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      <span>Instagram Handle (Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                      <input
                        type="text"
                        placeholder="your_handle"
                        value={formData.instagram}
                        onChange={(e) => updateField('instagram', e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone number (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Phone / WhatsApp (Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PERSONALITY */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="compatibility-step space-y-6"
              >
                <div className="personality-step-intro border-b border-white/10 pb-3">
                  <span className="text-rose-400 font-mono text-sm">02 / 05 · PERSONALITY</span>
                  <h3 className="text-lg font-bold text-white">Let's talk about you.</h3>
                  <p className="text-xs text-slate-400">Choose what feels closest. Nothing here needs to be a performance.</p>
                </div>

                {/* Personality Type */}
                <div className="personality-archetypes space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Which description feels most like you?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PERSONALITY_TYPES.map((type, index) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => updateField('personality', type)}
                        className={`p-3 rounded-xl text-left text-xs font-medium border transition-all ${
                          formData.personality === type
                            ? 'bg-rose-500/15 border-rose-500 text-rose-200 shadow-sm'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className="choice-number">0{index + 1}</span><span>{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Love Language */}
                <div className="personality-love space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    How do you usually show care?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {LOVE_LANGUAGES.map((lang, index) => (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => updateField('loveLanguage', lang)}
                        className={`p-3 rounded-xl text-center text-xs font-medium border transition-all ${
                          formData.loveLanguage === lang
                            ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className="choice-number">0{index + 1}</span><span>{lang}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personality Traits (Multi-select) */}
                <div className="personality-traits space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Pick up to five things that sound like you
                    </label>
                    <span className="text-[11px] text-rose-400">
                      {formData.personalityTraits?.length || 0} / 5 selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TRAIT_OPTIONS.map((trait, index) => {
                      const selected = formData.personalityTraits?.includes(trait);
                      return (
                        <button
                          type="button"
                          key={trait}
                          onClick={() => toggleTrait(trait)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            selected
                              ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/25'
                              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                          }`}
                        >
                          <span className="choice-number">{String(index + 1).padStart(2, '0')}</span><span>{trait}</span>
                        </button>
                      );
                    })}
                  </div>
                  {formErrors.personalityTraits && (
                    <p className="text-rose-400 text-xs mt-1">{formErrors.personalityTraits}</p>
                  )}
                </div>

                {/* Communication Style text input */}
                <div className="personality-communication space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    How do you usually communicate with someone you like?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Direct, witty, voice notes when exciting things happen"
                    value={formData.communicationStyle}
                    onChange={(e) => updateField('communicationStyle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: COMPATIBILITY */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="compatibility-step-intro border-b border-white/10 pb-3">
                  <span className="text-rose-400 font-mono text-sm">03 / 05 · COMPATIBILITY</span>
                  <h3 className="text-lg font-bold text-white">How do you move through a relationship?</h3>
                  <p className="text-xs text-slate-400">There are no correct answers. We are simply checking the rhythm.</p>
                </div>

                {/* Question 1: Alexander hasn't replied for 3 hours */}
                <div className="compatibility-options space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                    "Alexander hasn't replied for 3 hours. What do you do?" *
                  </label>
                  <div className="space-y-2">
                    {NO_REPLY_REACTIONS.map((option, index) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => updateField('noReplyReaction', option)}
                        className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition-all ${
                          formData.noReplyReaction === option
                            ? 'bg-rose-500/15 border-rose-500 text-rose-200'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className="choice-number">0{index + 1}</span><span>{option}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: How do you handle disagreements? */}
                <div className="compatibility-options space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    "How do you handle disagreements?" *
                  </label>
                  <div className="space-y-2">
                    {DISAGREEMENT_STYLES.map((style, index) => (
                      <button
                        type="button"
                        key={style}
                        onClick={() => updateField('disagreementStyle', style)}
                        className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition-all ${
                          formData.disagreementStyle === style
                            ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className="choice-number">0{index + 1}</span><span>{style}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3: Talking frequency */}
                <div className="compatibility-options space-y-2">
                  <label className="text-xs font-bold text-slate-200">
                    "How often do you like talking to your partner?" *
                  </label>
                  <div className="space-y-2">
                    {COMMUNICATION_FREQUENCIES.map((freq, index) => (
                      <button
                        type="button"
                        key={freq}
                        onClick={() => updateField('communicationFrequency', freq)}
                        className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition-all ${
                          formData.communicationFrequency === freq
                            ? 'bg-indigo-500/15 border-indigo-500 text-indigo-200'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className="choice-number">0{index + 1}</span><span>{freq}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 4: Ideal Date */}
                <div className="compatibility-options space-y-2">
                  <label className="text-xs font-bold text-slate-200">
                    "What's your ideal date?" *
                  </label>
                  <div className="space-y-2">
                    {IDEAL_DATES.map((dateOption, index) => (
                      <button
                        type="button"
                        key={dateOption}
                        onClick={() => updateField('idealDate', dateOption)}
                        className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition-all ${
                          formData.idealDate === dateOption
                            ? 'bg-pink-500/15 border-pink-500 text-pink-200'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className="choice-number">0{index + 1}</span><span>{dateOption}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 5: Interactive 1-10 Jealousy Slider */}
                <div className="compatibility-scale p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-200">
                        "How jealous are you?" (1 to 10 Scale)
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Calibrate your territorial instincts honestly.
                      </p>
                    </div>
                    <span className="text-2xl font-black text-rose-400 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      {formData.jealousyLevel} <span className="text-xs text-slate-400">/ 10</span>
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={formData.jealousyLevel}
                    onChange={(e) => updateField('jealousyLevel', Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />

                  <div className="flex justify-between text-[10px] text-slate-500 px-1">
                    <span>1: Totally Unbothered</span>
                    <span>5: Healthy Protectiveness</span>
                    <span>10: Full Surveillance</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 italic">
                    {getJealousyDescription(formData.jealousyLevel)}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: FINAL INTERVIEW */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-rose-400 font-mono text-sm">04.</span>
                    The Executive Interview
                  </h3>
                  <p className="text-xs text-slate-400">
                    Open-ended qualitative responses evaluated directly by Alexander.
                  </p>
                </div>

                {/* Why selected */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>"Why should you be selected for this position?" *</span>
                    {formErrors.whySelected && (
                      <span className="text-rose-400 text-[11px]">{formErrors.whySelected}</span>
                    )}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Make your pitch. What makes you the undeniable candidate?"
                    value={formData.whySelected}
                    onChange={(e) => updateField('whySelected', e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-sm"
                  />
                </div>

                {/* What do you bring */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>"What do you bring into a relationship?" *</span>
                    {formErrors.relationshipValue && (
                      <span className="text-rose-400 text-[11px]">{formErrors.relationshipValue}</span>
                    )}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Unmatched banter, immaculate Spotify taste, emotional grounding, gourmet pasta..."
                    value={formData.relationshipValue}
                    onChange={(e) => updateField('relationshipValue', e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-sm"
                  />
                </div>

                {/* Something Alexander should know */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>"What's one thing Alexander should know about you?" *</span>
                    {formErrors.somethingToKnow && (
                      <span className="text-rose-400 text-[11px]">{formErrors.somethingToKnow}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. I will unconditionally steal your fries, but I'll defend you with my life."
                    value={formData.somethingToKnow}
                    onChange={(e) => updateField('somethingToKnow', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Green Flag */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>"What's your biggest green flag?" *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Great communicator, patient, loves spontaneous snacks"
                      value={formData.greenFlag}
                      onChange={(e) => updateField('greenFlag', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                        formErrors.greenFlag ? 'border-rose-500' : ''
                      }`}
                    />
                  </div>

                  {/* Red Flag */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>"What's your biggest red flag?" *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Takes 45 minutes to pick a Netflix movie"
                      value={formData.redFlag}
                      onChange={(e) => updateField('redFlag', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                        formErrors.redFlag ? 'border-rose-500' : ''
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: REVIEW & UN-SCIENTIFIC COMPATIBILITY */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-rose-400 font-mono text-sm">05.</span>
                    Pre-Submission Dossier Review
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verify all candidate data before broadcasting to Cloud Firestore.
                  </p>
                </div>

                {/* Playful Compatibility Score Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/40 via-purple-950/20 to-slate-900 border border-rose-500/25 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                        Totally Unscientific Compatibility Score
                      </span>
                      <p className="text-xs text-slate-400">
                        Computed in real-time from your submitted parameters (for entertainment only)
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">
                        {currentCompatibility.score}
                      </span>
                      <span className="text-rose-400 font-bold text-sm">/ 100</span>
                    </div>
                  </div>

                  {/* Animated score bar */}
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentCompatibility.score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {currentCompatibility.badge}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {currentCompatibility.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {currentCompatibility.summary}
                    </p>
                  </div>
                </div>

                {/* Summary Recap Box */}
                <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-4 text-xs">
                  <h4 className="font-bold text-white text-sm">Candidate Summary</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Applicant Name:</span>
                      <strong className="text-white text-sm">{formData.fullName} ({formData.preferredName || 'Same'})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Age & Location:</span>
                      <strong className="text-white text-sm">{formData.age} yrs • {formData.location}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Personality:</span>
                      <span>{formData.personality}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Love Language:</span>
                      <span>{formData.loveLanguage}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block mb-1">Selected Traits:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.personalityTraits?.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 text-[11px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2 pt-2 border-t border-white/5">
                      <span className="text-slate-500 block">Why Selected Pitch:</span>
                      <p className="italic text-slate-300 mt-0.5">"{formData.whySelected}"</p>
                    </div>
                  </div>
                </div>

                {/* Candidate declaration & terms checkbox */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded accent-rose-500 cursor-pointer"
                  />
                  <label htmlFor="terms-checkbox" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                    I acknowledge that submitting this application enters me into the candidate pool for Alexander's Girlfriend and that food on Alexander's plate may be subjected to mutual taxation. I confirm all responses represent my genuine authentic self.
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons (Back & Next / Submit) */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="form-back inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="form-continue inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold"
              >
                <span>Continue to Step 0{currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !agreedToTerms}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-pink-500 shadow-xl shadow-rose-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Committing to Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmit Girlfriend Application</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};
