import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Sun,
  Moon,
  Bell,
  Settings,
  Menu,
  X,
  Radio,
  Award,
  Briefcase,
  User,
  Send,
  Layers,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    data,
    toggleDarkMode,
    activeOnlineVisitors,
    setIsNotificationCenterOpen,
    setIsCmsOpen,
    setIsRecruiterModalOpen,
  } = usePortfolio();
  const { profile } = data;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Profil', href: '#profile', icon: User },
    { name: 'Sertifikasi', href: '#certifications', icon: Award, highlight: true },
    { name: 'Proyek', href: '#projects', icon: Layers },
    { name: 'Pengalaman', href: '#experience', icon: Briefcase },
    { name: 'Kontak Rekruter', href: '#contact', icon: Send },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <a
          href="#profile"
          className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0"
          title="Ke Profil Utama"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white font-heading font-extrabold flex items-center justify-center text-xs shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            DM
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-xs md:max-w-none">
              {profile.fullName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[110px] xs:max-w-[150px] sm:max-w-xs md:max-w-none">
              {profile.headline}
            </span>
          </div>
        </a>

        {/* Desktop Nav Links (Visible on Large Screens >= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  link.highlight
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Real-time visitor badge button */}
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            title="Buka Pusat Notifikasi Kunjungan Real-Time"
            className="relative px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 transition flex items-center gap-1.5 sm:gap-2 text-xs font-semibold cursor-pointer active:scale-95"
          >
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] sm:text-xs">{activeOnlineVisitors}</span>
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300 shrink-0" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            aria-label="Ganti Tema Mode Gelap / Terang"
            title={data.darkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
          >
            {data.darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-amber-400 hidden xl:inline">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 hidden xl:inline">Gelap</span>
              </>
            )}
          </button>

          {/* CMS Admin Button */}
          <button
            onClick={() => setIsCmsOpen(true)}
            title="Kelola CMS & Edit Data Portofolio"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition active:scale-98 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">CMS</span>
          </button>

          {/* Quick Hire CTA Button for Recruiter (Visible on Large Desktop) */}
          <button
            onClick={() => setIsRecruiterModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 transition active:scale-98 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Hubungi Rekruter</span>
          </button>

          {/* Tablet & Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu Navigasi"
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 sm:px-6 pt-3 pb-5 border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md space-y-2.5 shadow-2xl animate-in fade-in duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Icon className="w-4 h-4 text-indigo-500" />
                {link.name}
              </a>
            );
          })}
          {/* Mobile Dark Mode Toggle Row */}
          <button
            onClick={() => {
              toggleDarkMode();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {data.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              <span>Tema: {data.darkMode ? 'Mode Gelap' : 'Mode Terang'}</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs">
              {data.darkMode ? 'Ganti ke Terang' : 'Ganti ke Gelap'}
            </span>
          </button>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCmsOpen(true);
              }}
              className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              Kelola CMS
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsRecruiterModalOpen(true);
              }}
              className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Rekrut Saya
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
