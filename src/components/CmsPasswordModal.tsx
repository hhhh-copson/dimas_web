import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CmsPasswordModal: React.FC = () => {
  const { isPinModalOpen, setIsPinModalOpen, authenticateCms } = usePortfolio();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  if (!isPinModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    const success = authenticateCms(password);
    if (success) {
      setErrorMessage(null);
      setPassword('');
      setIsPinModalOpen(false);
    } else {
      setErrorMessage('Kata sandi salah! Akses pengubahan CMS ditolak.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsPinModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: shake ? [-8, 8, -6, 6, -3, 3, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => setIsPinModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Autentikasi Akses CMS
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Khusus pemilik portofolio (Dimas Maulana)
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
            Halaman ini dilindungi sandi agar pengunjung umum tidak dapat memodifikasi sertifikat, proyek, atau informasi profil Anda.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                Masukkan Kata Sandi CMS
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ketik kata sandi..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMessage && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Lock className="w-3.5 h-3.5" />
                Buka Kunci CMS
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
