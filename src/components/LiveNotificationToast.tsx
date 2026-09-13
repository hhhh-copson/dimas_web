import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Bell, MapPin, ExternalLink, X, ShieldAlert, Globe, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LiveNotificationToast: React.FC = () => {
  const { activeToast, dismissToast, data, toggleAudioNotification, setIsNotificationCenterOpen } = usePortfolio();

  return (
    <div className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:bottom-5 sm:right-5 z-50 sm:max-w-md pointer-events-none">
      <AnimatePresence>
        {activeToast && (
          <motion.div
            key={activeToast.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto rounded-2xl border border-indigo-500/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl p-4 text-slate-800 dark:text-slate-100 ring-1 ring-black/5"
            role="alert"
          >
            <div className="flex items-start gap-3">
              {/* Pulse Indicator Icon */}
              <div className="relative shrink-0 mt-0.5">
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Bell className="w-5 h-5" />
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    Kunjungan Profil Real-Time
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{activeToast.timestamp}</span>
                </div>

                <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  {activeToast.isRecruiterSuspect ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      Calon Rekruter / Pengunjung Baru
                    </span>
                  ) : (
                    'Pengunjung Profil Baru'
                  )}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                  Mengakses <strong className="font-semibold text-slate-800 dark:text-slate-200">{activeToast.pageSection}</strong> dari{' '}
                  <span className="inline-flex items-center gap-0.5 font-medium">
                    <MapPin className="w-3 h-3 text-rose-500 inline" />
                    {activeToast.city}, {activeToast.country}
                  </span>{' '}
                  melalui <span className="font-medium text-indigo-600 dark:text-indigo-400">{activeToast.source}</span>.
                </p>

                {/* Quick actions */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      dismissToast();
                      setIsNotificationCenterOpen(true);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Buka Log Kunjungan <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleAudioNotification}
                      title={data.audioNotificationEnabled ? 'Matikan suara notifikasi' : 'Nyalakan suara notifikasi'}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {data.audioNotificationEnabled ? (
                        <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={dismissToast}
                      aria-label="Tutup notifikasi"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
