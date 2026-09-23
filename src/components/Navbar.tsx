import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRoute, navigate } = useNavigation();
  useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentRoute === 'admin') {
      navigate('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-3 text-left group transition-transform active:scale-95"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base sm:text-lg">
                Girlfriend Applications
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                OFFICIAL
              </span>
            </div>
            <p className="text-xs text-slate-400 -mt-0.5">Alexander's Recruitment Portal</p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          <button
            onClick={() => scrollToSection('position-details')}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Position Details
          </button>
          <button
            onClick={() => scrollToSection('requirements')}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Requirements
          </button>
          <button
            onClick={() => scrollToSection('perks')}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Perks & Benefits
          </button>
          <button
            onClick={() => navigate('login')}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Log in
          </button>

          {/* Apply CTA */}
          <button
            onClick={() => scrollToSection('application-form')}
            className="nav-apply inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Now</span>
          </button>
        </nav>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-menu-toggle p-2 text-slate-300"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-panel md:hidden border-b border-white/10 px-5 py-5 space-y-1">
          <button
            onClick={() => scrollToSection('position-details')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Position Details
          </button>
          <button
            onClick={() => scrollToSection('requirements')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Requirements
          </button>
          <button
            onClick={() => scrollToSection('perks')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Perks & Benefits
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); navigate('login'); }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Log in
          </button>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => scrollToSection('application-form')}
              className="nav-apply w-full py-3 text-center text-sm font-semibold text-white"
            >
              Apply for Girlfriend Position
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
