import React from 'react';
import { ArrowDownRight } from 'lucide-react';
interface HeroSectionProps { onApplyClick: () => void; onRequirementsClick: () => void; }
export const HeroSection: React.FC<HeroSectionProps> = ({ onApplyClick, onRequirementsClick }) => (
  <section id="position-details" className="border-b border-[#d5cec0]">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="grid min-h-[76vh] items-end gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-9"><p className="mb-8 text-[11px] font-semibold tracking-[.2em] text-[#a83328]">APPLICATIONS ARE OPEN</p><h1 className="max-w-5xl text-5xl font-medium leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-[6.7rem]">There is one position available.<br/><em className="font-editorial font-medium">Girlfriend.</em></h1></div>
        <p className="md:col-span-3 text-sm leading-6 text-[#625d54]">Alexander is currently accepting applications for a highly selective position involving companionship, communication, spontaneous conversations and an unreasonable amount of nonsense.</p>
      </div>
      <div className="flex flex-col justify-between gap-8 border-t border-[#d5cec0] py-7 md:flex-row md:items-center"><div className="flex flex-wrap gap-x-8 gap-y-3 text-[11px] uppercase tracking-[.13em] text-[#625d54]"><span>Position — Girlfriend</span><span>Department — Personal Affairs</span><span>Status — Open</span><span>Location — Wherever the vibe is right</span></div><div className="flex items-center gap-6 shrink-0"><button onClick={onRequirementsClick} className="text-sm underline underline-offset-4">View requirements</button><button onClick={onApplyClick} className="application-cta inline-flex items-center gap-3 bg-[#171716] px-5 py-3 text-sm font-semibold text-white">Begin application <ArrowDownRight className="h-4 w-4" /></button></div></div>
    </div>
  </section>
);
