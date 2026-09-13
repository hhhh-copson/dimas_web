import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  X,
  Bell,
  Radio,
  MapPin,
  Laptop,
  Smartphone,
  ExternalLink,
  Volume2,
  VolumeX,
  Trash2,
  UserCheck,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationCenterDrawer: React.FC = () => {
  const {
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    data,
    activeOnlineVisitors,
    toggleAudioNotification,
    clearVisitorLogs,
  } = usePortfolio();

  if (!isNotificationCenterOpen) return null;

  const recruiterVisitsCount = data.visitorLogs.filter((v) => v.isRecruiterSuspect).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsNotificationCenterOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800 z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Notifikasi Real-Time
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pelacakan kunjungan profil & aktivitas rekruter
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleAudioNotification}
                title={data.audioNotificationEnabled ? 'Matikan Suara Notifikasi' : 'Nyalakan Suara Notifikasi'}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                {data.audioNotificationEnabled ? (
                  <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsNotificationCenterOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Real-time Status Card */}
          <div className="p-4 mx-4 my-3 rounded-2xl bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-emerald-900/10 dark:from-indigo-950/60 dark:via-purple-950/60 dark:to-emerald-950/60 border border-indigo-200/50 dark:border-indigo-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Pengunjung Aktif Saat Ini
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                {activeOnlineVisitors} Online
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Kunjungan</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {data.visitorLogs.length} Sesi
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Kunjungan Rekruter</span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {recruiterVisitsCount} Teridentifikasi
                </span>
              </div>
            </div>

            {/* Real-time Status Badge */}
            <div className="mt-3 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-medium">Pelacakan Nyata Real-Time Aktif</span>
            </div>
          </div>

          {/* Logs List Header */}
          <div className="px-5 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              Aktivitas Terbaru
            </span>
            {data.visitorLogs.length > 0 && (
              <button
                onClick={clearVisitorLogs}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Bersihkan
              </button>
            )}
          </div>

          {/* Activity Logs Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {data.visitorLogs.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Globe className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Belum ada log kunjungan baru.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Kunjungan akan muncul secara otomatis saat profil Anda diakses.
                </p>
              </div>
            ) : (
              data.visitorLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border transition-all text-xs ${
                    log.isRecruiterSuspect
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {log.isRecruiterSuspect ? (
                        <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300">
                          <UserCheck className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          <Globe className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {log.isRecruiterSuspect ? 'Akses Rekruter / Hiring Partner' : 'Pengunjung Web'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>

                  <p className="mt-1.5 text-slate-600 dark:text-slate-300">
                    Melihat bagian:{' '}
                    <strong className="text-slate-900 dark:text-slate-100 font-medium">
                      {log.pageSection}
                    </strong>
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {log.city}, {log.country}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      {log.device === 'Mobile' ? (
                        <Smartphone className="w-3 h-3 text-slate-400" />
                      ) : (
                        <Laptop className="w-3 h-3 text-slate-400" />
                      )}
                      {log.device}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      via {log.source}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[11px] text-center text-slate-400">
            Sistem mendeteksi setiap sesi kunjungan baru secara instan dan aman.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
